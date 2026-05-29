import mongoose from "mongoose";

const prescriptionSchema = new mongoose.Schema(
  {
    patientName: {
      type: String,
      required: [true, "Patient name is required"],
      trim: true,
    },
    patientPhone: {
      type: String,
      trim: true,
    },
    doctorName: {
      type: String,
      trim: true,
    },
    medicines: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        medicineName: String, // snapshot وقت الصرف
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        dosage: {
          type: String, // مثال: "3 مرات يومياً"
          trim: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "dispensed", "rejected"],
      default: "pending",
    },
    notes: {
      type: String,
      trim: true,
    },
    dispensedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // الـ staff اللي صرف الوصفة
    },
    dispensedAt: {
      type: Date,
    },
    prescriptionImage: {
      type: String, // لو رفع صورة الوصفة
      default: "",
    },
  },
  { timestamps: true },
);

const prescriptionModel =
  mongoose.models.Prescription ||
  mongoose.model("Prescription", prescriptionSchema);

export default prescriptionModel;
