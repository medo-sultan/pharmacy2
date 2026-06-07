// archives.js
// الأرشيف بيقرأ من staffLog الموجود — مش بنخزن بيانات جديدة
// بس بنعمل model مساعد لو احتجنا نضيف entries يدوياً مستقبلاً

import mongoose from "mongoose";

// هنستخدم staffLog الموجود مباشرة
// الـ model ده placeholder لو احتجنا نوسع لاحقاً
const archiveEntrySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["ADD_MEDICINE", "DELETE_MEDICINE", "RESTOCK_MEDICINE"],
      required: true,
    },
    medicineName: { type: String, required: true },
    medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
    performedBy: { type: String, required: true }, // اسم الـ staff أو "Admin"
    performedById: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    details: { type: Object, default: {} }, // أي بيانات إضافية (كمية، مخزون قديم...)
  },
  { timestamps: true },
);

const archiveModel =
  mongoose.models.ArchiveEntry ||
  mongoose.model("ArchiveEntry", archiveEntrySchema);

export default archiveModel;
