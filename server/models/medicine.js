import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Medicine name is required"],
      trim: true,
    },
    genericName: {
      type: String,
      trim: true, // الاسم العلمي
    },
    category: {
      type: String,
      enum: [
        "antibiotic",
        "painkiller",
        "vitamin",
        "chronic", // أمراض مزمنة
        "dermatology", // جلدية
        "cardiology", // قلب
        "pediatric", // أطفال
        "other",
      ],
      default: "other",
    },
    requiresPrescription: {
      type: Boolean,
      default: false, // هل يحتاج وصفة طبية؟
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10, // يبعت تنبيه لما المخزون ينزل تحت الرقم ده
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry date is required"],
    },
    manufacturer: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true, // لو اتحذف منطقياً
    },
    // مين آخر واحد عدّل على الدواء ده
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// ✅ Virtual: هل المخزون منخفض؟
medicineSchema.virtual("isLowStock").get(function () {
  return this.stock <= this.lowStockThreshold;
});

// ✅ Virtual: هل قارب على الانتهاء (خلال 30 يوم)؟
medicineSchema.virtual("isNearExpiry").get(function () {
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return this.expiryDate - Date.now() <= thirtyDays;
});

// ✅ Virtual: هل انتهت صلاحيته؟
medicineSchema.virtual("isExpired").get(function () {
  return this.expiryDate < Date.now();
});

medicineSchema.set("toJSON", { virtuals: true });
medicineSchema.set("toObject", { virtuals: true });

const medicineModel =
  mongoose.models.Medicine || mongoose.model("Medicine", medicineSchema);

export default medicineModel;
