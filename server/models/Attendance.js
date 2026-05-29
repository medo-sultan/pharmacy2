import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    staffName: { type: String, required: true },
    role: { type: String, default: "staff" },
    date: { type: String, required: true }, // YYYY-MM-DD
    clockIn: { type: Date },
    clockOut: { type: Date },
  },
  { timestamps: true },
);

// index عشان البحث يكون سريع
attendanceSchema.index({ staffId: 1, date: 1 });

const attendanceModel =
  mongoose.models.attendance || mongoose.model("attendance", attendanceSchema);

export default attendanceModel;
