import express from "express";
import {
  loginUser,
  registerUser,
  adminLogin,
  getProfile,
  addStaff,
  updateStaffPermissions,
  removeStaff,
  getAllStaff,
  getStaffLogs,
} from "../controllers/Usercontrollers.js";
import authUser from "../middleware/auth.js";
import adminAuth from "../middleware/adminauth.js";

const userRouter = express.Router();

// ── User Auth ─────────────────────────────────────────
userRouter.post("/login", loginUser);
userRouter.post("/register", registerUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/profile", authUser, getProfile);

// ── Staff Management (Admin only) ─────────────────────
// POST   /api/user/staff/add                → إضافة موظف جديد
userRouter.post("/staff/add", adminAuth, addStaff);

// GET    /api/user/staff/all                → عرض كل الموظفين
userRouter.get("/staff/all", adminAuth, getAllStaff);

// PUT    /api/user/staff/permissions/:id    → تعديل صلاحيات موظف
userRouter.put("/staff/permissions/:id", adminAuth, updateStaffPermissions);

// DELETE /api/user/staff/remove/:id         → حذف موظف
userRouter.delete("/staff/remove/:id", adminAuth, removeStaff);

// GET    /api/user/staff/logs               → سجل كل الموظفين
userRouter.get("/staff/logs", adminAuth, getStaffLogs);

// GET    /api/user/staff/logs/:staffId      → سجل موظف بعينه
userRouter.get("/staff/logs/:staffId", adminAuth, getStaffLogs);

export default userRouter;
