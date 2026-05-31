import express from "express";
import barcodeModel from "../models/barcodeModel.js";
import medicineModel from "../models/medicine.js"; // ✅ غير الاسم لو مختلف عندك

const barcodeRouter = express.Router();

// POST /api/barcode/scan — الهاتف يبعت الباركود
barcodeRouter.post("/scan", async (req, res) => {
  try {
    const { barcode, sessionId } = req.body;
    if (!barcode) {
      return res
        .status(400)
        .json({ success: false, message: "barcode required" });
    }

    // تحقق إن الدواء موجود
    const medicine = await medicineModel.findOne({ barcode });

    // احفظ الـ scan بغض النظر — الـ POS هيحدد لو موجود ولا لأ
    await barcodeModel.create({ barcode, sessionId: sessionId || "default" });

    if (!medicine) {
      return res.json({
        success: true,
        found: false,
        message: "الدواء مش موجود في النظام",
        barcode,
      });
    }

    res.json({
      success: true,
      found: true,
      medicine: {
        _id: medicine._id,
        name: medicine.name,
        price: medicine.price,
        stock: medicine.stock,
        category: medicine.category,
        barcode: medicine.barcode,
        isLowStock: medicine.stock <= 10,
      },
    });
  } catch (err) {
    console.error("barcode/scan error:", err);
    res.status(500).json({ success: false, message: "فشل المسح" });
  }
});

// GET /api/barcode/poll?sessionId=xxx — الـ POS يسأل كل ثانية
barcodeRouter.get("/poll", async (req, res) => {
  try {
    const { sessionId = "default" } = req.query;

    // جيب أول scan لسه مش consumed
    const scan = await barcodeModel.findOneAndUpdate(
      { sessionId, consumed: false },
      { consumed: true },
      { new: false, sort: { createdAt: 1 } },
    );

    if (!scan) {
      return res.json({ success: true, scan: null });
    }

    // جيب تفاصيل الدواء
    const medicine = await medicineModel.findOne({ barcode: scan.barcode });

    res.json({
      success: true,
      scan: {
        barcode: scan.barcode,
        found: !!medicine,
        medicine: medicine
          ? {
              _id: medicine._id,
              name: medicine.name,
              price: medicine.price,
              stock: medicine.stock,
              category: medicine.category,
              barcode: medicine.barcode,
              isLowStock: medicine.stock <= 10,
            }
          : null,
      },
    });
  } catch (err) {
    console.error("barcode/poll error:", err);
    res.status(500).json({ success: false, message: "فشل الـ poll" });
  }
});

// GET /api/barcode/session — يولد sessionId جديد للـ POS
barcodeRouter.get("/session", (req, res) => {
  const sessionId = Math.random().toString(36).slice(2, 10);
  res.json({ success: true, sessionId });
});

export default barcodeRouter;
