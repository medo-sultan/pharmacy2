import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    // ✅ role: user عادي | staff موظف | admin صاحب المشروع
    role: {
      type: String,
      enum: ["user", "staff", "admin"],
      default: "user",
    },
    // ✅ بس للـ staff: المهام المسموحة ليه
    permissions: {
      manageProducts: { type: Boolean, default: false }, // إضافة/تعديل منتجات
      manageOrders: { type: Boolean, default: false }, // عرض/تحديث طلبات
      viewCustomers: { type: Boolean, default: false }, // عرض بيانات العملاء
    },
    cartData: {
      type: Object,
      default: {},
    },
  },
  { minimize: false, timestamps: true },
);

// ✅ Method لمقارنة الباسورد
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const userModel = mongoose.models.User || mongoose.model("User", userSchema);

export default userModel;
