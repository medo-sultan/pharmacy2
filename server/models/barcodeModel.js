import mongoose from "mongoose";

const barcodeSchema = new mongoose.Schema(
  {
    barcode: { type: String, required: true },
    scannedAt: { type: Date, default: Date.now },
    consumed: { type: Boolean, default: false }, // ✅ لما الـ POS يقراه يتعلم consumed
    sessionId: { type: String }, // عشان كل جهاز يقرأ الخاص بيه بس
  },
  { timestamps: true },
);

// امسح السجلات القديمة أوتوماتيك بعد 5 دقايق
barcodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

const barcodeModel =
  mongoose.models.Barcode || mongoose.model("Barcode", barcodeSchema);

export default barcodeModel;
