import express from "express";
import staffAuth from "../middleware/staffauth.js";
import adminAuth from "../middleware/adminauth.js";
import upload from "../middleware/multer.js";
import medicineModel from "../models/medicine.js";
import bcrypt from "bcryptjs";
import validator from "validator";
import userModel from "../models/user.js";
import jwt from "jsonwebtoken";

import {
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
} from "../controllers/pharmacyControllers.js";

const pharmacyRouter = express.Router();

// ─────────────────────────────────────────────────────────
//  Staff Login (pharmacy staff بيلوج هنا)
// POST /api/pharmacy/login
// ─────────────────────────────────────────────────────────
pharmacyRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email, role: "staff" });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Staff account not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({
      success: true,
      token,
      staff: {
        _id: user._id,
        name: user.name,
        email: user.email,
        permissions: user.permissions,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
});

// ─────────────────────────────────────────────────────────
//  المخزون — Inventory
// ─────────────────────────────────────────────────────────

// GET  /api/pharmacy/inventory              → عرض كل الأدوية + alerts
pharmacyRouter.get("/inventory", staffAuth("manageOrders"), getInventory);

// GET  /api/pharmacy/inventory/alerts       → التنبيهات فقط
pharmacyRouter.get(
  "/inventory/alerts",
  staffAuth("manageOrders"),
  getStockAlerts,
);

// PUT  /api/pharmacy/inventory/restock/:id  → إضافة كمية لدواء
pharmacyRouter.put(
  "/inventory/restock/:id",
  staffAuth("manageOrders"),
  restockMedicine,
);

// ─────────────────────────────────────────────────────────
//  الوصفات الطبية — Prescriptions
// ─────────────────────────────────────────────────────────

// GET  /api/pharmacy/prescriptions          → عرض الوصفات (?status=pending)
pharmacyRouter.get(
  "/prescriptions",
  staffAuth("manageOrders"),
  getPrescriptions,
);

// POST /api/pharmacy/prescription/add       → إضافة وصفة جديدة
// ✅ بدون upload — بيقبل JSON مباشرة (الصورة اختيارية لاحقاً)
pharmacyRouter.post(
  "/prescription/add",
  staffAuth("manageOrders"),
  addPrescription,
);

// PUT  /api/pharmacy/prescription/dispense/:id → صرف الوصفة
pharmacyRouter.put(
  "/prescription/dispense/:id",
  staffAuth("manageOrders"),
  dispensePrescription,
);

// PUT  /api/pharmacy/prescription/reject/:id   → رفض الوصفة
pharmacyRouter.put(
  "/prescription/reject/:id",
  staffAuth("manageOrders"),
  rejectPrescription,
);

// ─────────────────────────────────────────────────────────
//  المبيعات — Sales
// ─────────────────────────────────────────────────────────

// POST /api/pharmacy/sale                   → بيع مباشر
pharmacyRouter.post("/sale", staffAuth("manageOrders"), makeSale);

// GET  /api/pharmacy/sales                  → عرض المبيعات (?from=&to=&staffId=)
pharmacyRouter.get("/sales", staffAuth("manageOrders"), getSales);

// GET  /api/pharmacy/sales/summary          → ملخص اليوم
pharmacyRouter.get(
  "/sales/summary",
  staffAuth("manageOrders"),
  getSalesSummary,
);

// ─────────────────────────────────────────────────────────
//  إدارة الأدوية — Admin only
// ─────────────────────────────────────────────────────────

// POST /api/pharmacy/medicine/add-json  ← بدون صورة (JSON فقط) ✅
pharmacyRouter.post("/medicine/add-json", adminAuth, async (req, res) => {
  try {
    const {
      name,
      genericName,
      category,
      requiresPrescription,
      price,
      stock,
      lowStockThreshold,
      expiryDate,
      manufacturer,
      description,
    } = req.body;

    if (!name || !price || !expiryDate) {
      return res
        .status(400)
        .json({ success: false, message: "name, price, expiryDate مطلوبة" });
    }

    const medicine = await medicineModel.create({
      name,
      genericName: genericName || "",
      category: category || "general",
      requiresPrescription:
        requiresPrescription === true || requiresPrescription === "true",
      price: Number(price),
      stock: Number(stock || 0),
      lowStockThreshold: Number(lowStockThreshold || 10),
      expiryDate: new Date(expiryDate),
      manufacturer: manufacturer || "",
      description: description || "",
      image: "",
    });

    res.json({ success: true, message: "Medicine added", medicine });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add medicine" });
  }
});

// POST /api/pharmacy/medicine/add  ← مع صورة (multipart)
pharmacyRouter.post(
  "/medicine/add",
  adminAuth,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        name,
        genericName,
        category,
        requiresPrescription,
        price,
        stock,
        lowStockThreshold,
        expiryDate,
        manufacturer,
        description,
      } = req.body;
      const image = req.file ? req.file.filename : "";

      const medicine = await medicineModel.create({
        name,
        genericName,
        category,
        requiresPrescription: requiresPrescription === "true",
        price: Number(price),
        stock: Number(stock || 0),
        lowStockThreshold: Number(lowStockThreshold || 10),
        expiryDate: new Date(expiryDate),
        manufacturer,
        description,
        image,
      });

      res.json({ success: true, message: "Medicine added", medicine });
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "Failed to add medicine" });
    }
  },
);

// PUT /api/pharmacy/medicine/edit/:id
pharmacyRouter.put("/medicine/edit/:id", adminAuth, async (req, res) => {
  try {
    const medicine = await medicineModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    if (!medicine)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, medicine });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update medicine" });
  }
});

// DELETE /api/pharmacy/medicine/delete/:id  (soft delete)
pharmacyRouter.delete("/medicine/delete/:id", adminAuth, async (req, res) => {
  try {
    await medicineModel.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: "Medicine deactivated" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete medicine" });
  }
});

export default pharmacyRouter;
