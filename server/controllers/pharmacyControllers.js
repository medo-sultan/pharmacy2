import medicineModel from "../models/medicine.js";
import prescriptionModel from "../models/prescription.js";
import saleModel from "../models/sale.js";
import staffLogModel from "../models/staffLog.js";
import mongoose from "mongoose";

// ✅ Helper تسجيل الـ actions
const log = async (staff, action, details = {}, ip = "") => {
  try {
    await staffLogModel.create({
      staffId: staff._id,
      staffName: staff.name,
      action,
      details,
      ip,
    });
  } catch (e) {
    console.error("Log error:", e);
  }
};

// ═══════════════════════════════════════════════════════
//  المخزون — Inventory
// ═══════════════════════════════════════════════════════

// @route GET /api/pharmacy/inventory
// عرض كل الأدوية مع حالة المخزون
const getInventory = async (req, res) => {
  try {
    const medicines = await medicineModel
      .find({ isActive: true })
      .sort({ name: 1 });

    // فلترة التنبيهات
    const alerts = {
      lowStock: medicines
        .filter((m) => m.isLowStock)
        .map((m) => ({
          _id: m._id,
          name: m.name,
          stock: m.stock,
          threshold: m.lowStockThreshold,
        })),
      nearExpiry: medicines
        .filter((m) => m.isNearExpiry && !m.isExpired)
        .map((m) => ({
          _id: m._id,
          name: m.name,
          expiryDate: m.expiryDate,
        })),
      expired: medicines
        .filter((m) => m.isExpired)
        .map((m) => ({
          _id: m._id,
          name: m.name,
          expiryDate: m.expiryDate,
        })),
    };

    await log(
      req.staff,
      "VIEW_INVENTORY",
      { totalItems: medicines.length },
      req.ip,
    );

    res.json({ success: true, medicines, alerts });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch inventory" });
  }
};

// @route PUT /api/pharmacy/inventory/restock/:id
// تحديث الكمية (الـ staff يستقبل شحنة جديدة)
const restockMedicine = async (req, res) => {
  try {
    const { id } = req.params;
    const { addQuantity, newExpiryDate } = req.body;

    if (!addQuantity || addQuantity <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid quantity" });
    }

    const medicine = await medicineModel.findById(id);
    if (!medicine || !medicine.isActive) {
      return res
        .status(404)
        .json({ success: false, message: "Medicine not found" });
    }

    const oldStock = medicine.stock;
    medicine.stock += Number(addQuantity);
    if (newExpiryDate) medicine.expiryDate = new Date(newExpiryDate);
    if (req.staff._id) medicine.lastUpdatedBy = req.staff._id;
    await medicine.save();

    await log(
      req.staff,
      "RESTOCK_MEDICINE",
      {
        medicineId: id,
        medicineName: medicine.name,
        oldStock,
        addedQuantity: addQuantity,
        newStock: medicine.stock,
      },
      req.ip,
    );

    res.json({
      success: true,
      message: `Stock updated: ${oldStock} → ${medicine.stock}`,
      medicine,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to restock" });
  }
};

// @route GET /api/pharmacy/inventory/alerts
// تنبيهات المخزون فقط (مش كل الأدوية)
const getStockAlerts = async (req, res) => {
  try {
    const medicines = await medicineModel.find({ isActive: true });

    const lowStock = medicines.filter((m) => m.isLowStock);
    const nearExpiry = medicines.filter((m) => m.isNearExpiry && !m.isExpired);
    const expired = medicines.filter((m) => m.isExpired);

    res.json({
      success: true,
      alerts: {
        lowStock: { count: lowStock.length, items: lowStock },
        nearExpiry: { count: nearExpiry.length, items: nearExpiry },
        expired: { count: expired.length, items: expired },
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to get alerts" });
  }
};

// ═══════════════════════════════════════════════════════
//  الوصفات الطبية — Prescriptions
// ═══════════════════════════════════════════════════════

// @route POST /api/pharmacy/prescription/add
// إضافة وصفة جديدة وانتظار الصرف
const addPrescription = async (req, res) => {
  try {
    const {
      patientName,
      patientPhone,
      doctorName,
      medicines,
      notes,
      prescriptionImage,
    } = req.body;

    if (!patientName || !medicines || medicines.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Patient name and medicines are required",
      });
    }

    // تأكيد إن الأدوية موجودة في الداتابيز
    const medicineIds = medicines.map((m) => m.medicineId);
    const foundMedicines = await medicineModel.find({
      _id: { $in: medicineIds },
      isActive: true,
    });

    if (foundMedicines.length !== medicineIds.length) {
      return res
        .status(400)
        .json({ success: false, message: "One or more medicines not found" });
    }

    // ضيف snapshot للاسم
    const medicinesWithNames = medicines.map((m) => {
      const found = foundMedicines.find(
        (f) => f._id.toString() === m.medicineId,
      );
      return { ...m, medicineName: found?.name || "" };
    });

    const prescription = await prescriptionModel.create({
      patientName,
      patientPhone,
      doctorName,
      medicines: medicinesWithNames,
      notes,
      prescriptionImage,
    });

    await log(
      req.staff,
      "ADD_PRESCRIPTION",
      {
        prescriptionId: prescription._id,
        patientName,
      },
      req.ip,
    );

    res.json({ success: true, message: "Prescription added", prescription });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to add prescription" });
  }
};

// @route PUT /api/pharmacy/prescription/dispense/:id
// صرف الوصفة — بيخصم من المخزون تلقائياً
const dispensePrescription = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { notes } = req.body;

    const prescription = await prescriptionModel.findById(id).session(session);

    if (!prescription) {
      await session.abortTransaction();
      return res
        .status(404)
        .json({ success: false, message: "Prescription not found" });
    }
    if (prescription.status === "dispensed") {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "Already dispensed" });
    }

    // تأكيد الكميات قبل الخصم
    for (const item of prescription.medicines) {
      const med = await medicineModel
        .findById(item.medicineId)
        .session(session);
      if (!med || med.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for: ${item.medicineName || item.medicineId}`,
        });
      }
    }

    // خصم المخزون
    for (const item of prescription.medicines) {
      await medicineModel.findByIdAndUpdate(
        item.medicineId,
        {
          $inc: { stock: -item.quantity },
          ...(req.staff._id && { lastUpdatedBy: req.staff._id }),
        },
        { session },
      );
    }

    // تحديث الوصفة
    prescription.status = "dispensed";
    if (req.staff._id) prescription.dispensedBy = req.staff._id;
    prescription.dispensedAt = new Date();
    if (notes) prescription.notes = notes;
    await prescription.save({ session });

    await session.commitTransaction();

    await log(
      req.staff,
      "DISPENSE_PRESCRIPTION",
      {
        prescriptionId: id,
        patientName: prescription.patientName,
        itemsCount: prescription.medicines.length,
      },
      req.ip,
    );

    res.json({
      success: true,
      message: "Prescription dispensed successfully",
      prescription,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to dispense prescription" });
  } finally {
    session.endSession();
  }
};

// @route GET /api/pharmacy/prescriptions
// عرض الوصفات (فلترة بالحالة)
const getPrescriptions = async (req, res) => {
  try {
    const { status } = req.query; // pending | dispensed | rejected
    const filter = status ? { status } : {};

    const prescriptions = await prescriptionModel
      .find(filter)
      .populate("dispensedBy", "name")
      .sort({ createdAt: -1 });

    res.json({ success: true, prescriptions });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch prescriptions" });
  }
};

// @route PUT /api/pharmacy/prescription/reject/:id
const rejectPrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const prescription = await prescriptionModel.findByIdAndUpdate(
      id,
      { status: "rejected", notes: reason },
      { new: true },
    );

    if (!prescription) {
      return res
        .status(404)
        .json({ success: false, message: "Prescription not found" });
    }

    await log(
      req.staff,
      "REJECT_PRESCRIPTION",
      {
        prescriptionId: id,
        reason,
      },
      req.ip,
    );

    res.json({ success: true, message: "Prescription rejected", prescription });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to reject prescription" });
  }
};

// ═══════════════════════════════════════════════════════
//  المبيعات — Sales
// ═══════════════════════════════════════════════════════

// @route POST /api/pharmacy/sale
// بيع مباشر (من غير وصفة أو مع وصفة)
const makeSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { items, paymentMethod, patientName, prescriptionId, notes } =
      req.body;

    if (!items || items.length === 0) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "No items provided" });
    }

    let totalAmount = 0;
    const enrichedItems = [];

    for (const item of items) {
      const medicine = await medicineModel
        .findById(item.medicineId)
        .session(session);

      if (!medicine || !medicine.isActive) {
        await session.abortTransaction();
        return res.status(404).json({
          success: false,
          message: `Medicine not found: ${item.medicineId}`,
        });
      }
      if (medicine.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock: ${medicine.name}`,
        });
      }
      if (medicine.isExpired) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Expired medicine: ${medicine.name}`,
        });
      }

      const subtotal = medicine.price * item.quantity;
      totalAmount += subtotal;

      enrichedItems.push({
        medicineId: medicine._id,
        medicineName: medicine.name,
        quantity: item.quantity,
        unitPrice: medicine.price,
        subtotal,
      });

      // خصم من المخزون
      await medicineModel.findByIdAndUpdate(
        medicine._id,
        {
          $inc: { stock: -item.quantity },
          ...(req.staff._id && { lastUpdatedBy: req.staff._id }),
        },
        { session },
      );
    }

    const sale = await saleModel.create(
      [
        {
          items: enrichedItems,
          totalAmount,
          paymentMethod: paymentMethod || "cash",
          patientName,
          prescriptionId: prescriptionId || null,
          servedBy: req.staff._id || "000000000000000000000000",
          notes,
        },
      ],
      { session },
    );

    await session.commitTransaction();

    await log(
      req.staff,
      "MAKE_SALE",
      {
        saleId: sale[0]._id,
        totalAmount,
        itemsCount: enrichedItems.length,
      },
      req.ip,
    );

    res.json({ success: true, message: "Sale completed", sale: sale[0] });
  } catch (err) {
    await session.abortTransaction();
    console.error(err);
    res.status(500).json({ success: false, message: "Sale failed" });
  } finally {
    session.endSession();
  }
};

// @route GET /api/pharmacy/sales
// عرض المبيعات (فلترة بالتاريخ)
const getSales = async (req, res) => {
  try {
    const { from, to, staffId } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    // الـ staff العادي يشوف مبيعاته بس — الـ admin يشوف الكل
    if (req.staff.role !== "admin") {
      filter.servedBy = req.staff._id;
    } else if (staffId) {
      filter.servedBy = staffId;
    }

    const sales = await saleModel
      .find(filter)
      .populate("servedBy", "name")
      .populate("prescriptionId", "patientName")
      .sort({ createdAt: -1 });

    const totalRevenue = sales.reduce((sum, s) => sum + s.totalAmount, 0);

    res.json({ success: true, sales, totalRevenue });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch sales" });
  }
};

// @route GET /api/pharmacy/sales/summary
// ملخص مبيعات اليوم للـ staff
const getSalesSummary = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const filter = {
      createdAt: { $gte: startOfDay },
      ...(req.staff.role !== "admin" && { servedBy: req.staff._id }),
    };

    const todaySales = await saleModel.find(filter);
    const totalRevenue = todaySales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalTransactions = todaySales.length;

    res.json({
      success: true,
      summary: {
        date: new Date().toDateString(),
        totalTransactions,
        totalRevenue,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to get summary" });
  }
};

export {
  getInventory,
  restockMedicine,
  getStockAlerts,
  addPrescription,
  dispensePrescription,
  getPrescriptions,
  rejectPrescription,
  makeSale,
  getSales,
  getSalesSummary,
};
