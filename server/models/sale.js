import mongoose from "mongoose";

const saleSchema = new mongoose.Schema(
  {
    items: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        medicineName: String,
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        subtotal: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "insurance"],
      default: "cash",
    },
    prescriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Prescription",
      default: null,
    },
    patientName: {
      type: String,
      trim: true,
    },
    servedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // ✅ Admin مش عنده _id في الداتابيز
    },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

const saleModel = mongoose.models.Sale || mongoose.model("Sale", saleSchema);

export default saleModel;
