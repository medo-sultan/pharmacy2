import mongoose from "mongoose";

const staffLogSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    staffName: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    details: {
      type: Object,
      default: {},
    },
    ip: {
      type: String,
    },
  },
  { timestamps: true },
);

const staffLogModel =
  mongoose.models.StaffLog || mongoose.model("StaffLog", staffLogSchema);

export default staffLogModel;
