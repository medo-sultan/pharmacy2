import medicineModel from "../models/medicine.js";
import prescriptionModel from "../models/prescription.js";
import saleModel from "../models/sale.js";
import staffLogModel from "../models/staffLog.js";
import mongoose from "mongoose";

// ✅ Helper تسجيل الـ actions
const log = async (staff, action, details = {}, ip = "") => {
  try {
    const staffId = staff?._id || null;
    if (!staffId) return; // Admin بدون _id — مش هنسجل في staffLog
    await staffLogModel.create({
      staffId,
      staffName: staff?.name || "Unknown",
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

    res.json({ success: true, medicines, alerts });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch inventory" });
  }
};

// @route PUT /api/pharmacy/inventory/restock/:id
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
// ✅ الإصلاح: الأدوية اختيارية عند الإضافة — يكفي اسم المريض فقط
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

    if (!patientName) {
      return res.status(400).json({
        success: false,
        message: "Patient name is required",
      });
    }

    // بناء قائمة الأدوية (فارغة لو مفيش)
    const medicinesWithNames = [];

    if (medicines && medicines.length > 0) {
      const medicineIds = medicines.map((m) => m.medicineId);
      const foundMedicines = await medicineModel.find({
        _id: { $in: medicineIds },
        isActive: true,
      });

      if (foundMedicines.length !== medicineIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more medicines not found",
        });
      }

      medicines.forEach((m) => {
        const found = foundMedicines.find(
          (f) => f._id.toString() === m.medicineId,
        );
        medicinesWithNames.push({ ...m, medicineName: found?.name || "" });
      });
    }

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

    // ✅ جيب كل الأدوية في query واحدة
    const rxMedIds = prescription.medicines.map((m) => m.medicineId);
    const rxMeds = await medicineModel
      .find({ _id: { $in: rxMedIds } })
      .session(session);
    const rxMedMap = {};
    rxMeds.forEach((m) => {
      rxMedMap[m._id.toString()] = m;
    });

    // تأكيد الكميات قبل الخصم
    for (const item of prescription.medicines) {
      const med = rxMedMap[item.medicineId?.toString()];
      if (!med || med.stock < item.quantity) {
        await session.abortTransaction();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for: ${item.medicineName || item.medicineId}`,
        });
      }
    }

    // ✅ خصم المخزون بـ bulkWrite واحدة
    const rxBulkOps = prescription.medicines.map((item) => ({
      updateOne: {
        filter: { _id: item.medicineId },
        update: {
          $inc: { stock: -item.quantity },
          ...(req.staff._id && { lastUpdatedBy: req.staff._id }),
        },
      },
    }));
    await medicineModel.bulkWrite(rxBulkOps, { session });

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
const getPrescriptions = async (req, res) => {
  try {
    const { status } = req.query;
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
      { prescriptionId: id, reason },
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
const makeSale = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      items,
      paymentMethod,
      patientName,
      prescriptionId,
      notes,
      insuranceCompany,
      insuranceCardNumber,
      discountPercent,
      discountAmount,
    } = req.body;

    if (!items || items.length === 0) {
      await session.abortTransaction();
      return res
        .status(400)
        .json({ success: false, message: "No items provided" });
    }

    let rawTotal = 0;
    const enrichedItems = [];

    // ✅ جيب كل الأدوية في query واحدة بدل loop
    const medicineIds = items.map((i) => i.medicineId);
    const medicines = await medicineModel
      .find({ _id: { $in: medicineIds }, isActive: true })
      .session(session);

    const medicineMap = {};
    medicines.forEach((m) => {
      medicineMap[m._id.toString()] = m;
    });

    for (const item of items) {
      const medicine = medicineMap[item.medicineId?.toString()];

      if (!medicine) {
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
      rawTotal += subtotal;

      enrichedItems.push({
        medicineId: medicine._id,
        medicineName: medicine.name,
        quantity: item.quantity,
        unitPrice: medicine.price,
        subtotal,
      });
    }

    // ✅ تحديث المخزون بـ bulkWrite واحدة بدل loop من findByIdAndUpdate
    const bulkOps = enrichedItems.map((item) => ({
      updateOne: {
        filter: { _id: item.medicineId },
        update: {
          $inc: { stock: -item.quantity },
          ...(req.staff._id && { lastUpdatedBy: req.staff._id }),
        },
      },
    }));
    await medicineModel.bulkWrite(bulkOps, { session });

    const isInsurance = paymentMethod === "insurance" && discountPercent > 0;
    const appliedDiscount = isInsurance
      ? parseFloat(discountAmount) || rawTotal * (discountPercent / 100)
      : 0;
    const totalAmount = parseFloat((rawTotal - appliedDiscount).toFixed(2));

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
          ...(isInsurance && {
            insuranceCompany,
            insuranceCardNumber,
            discountPercent,
            discountAmount: appliedDiscount,
          }),
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
        rawTotal,
        discountAmount: appliedDiscount,
        totalAmount,
        itemsCount: enrichedItems.length,
        ...(isInsurance && { insuranceCompany, discountPercent }),
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
const getSales = async (req, res) => {
  try {
    const { from, to, staffId } = req.query;
    const filter = {};

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

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
