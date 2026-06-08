import express from "express";
import staffAuth from "../middleware/staffauth.js";
import adminAuth from "../middleware/adminauth.js";
import {
  getAllAttendance,
  clockIn,
  clockOut,
  getMyAttendance,
} from "../controllers/attendanceController.js";

const attendanceRouter = express.Router();

// GET  /api/attendance/all     → Admin يشوف كل الحضور
attendanceRouter.get("/all", adminAuth, getAllAttendance);

// POST /api/attendance/clockin → تسجيل حضور
attendanceRouter.post("/clockin", staffAuth(), clockIn);

// PUT  /api/attendance/clockout → تسجيل انصراف
attendanceRouter.put("/clockout", staffAuth(), clockOut);

// GET  /api/attendance/my      → الموظف يشوف حضوره
attendanceRouter.get("/my", staffAuth(), getMyAttendance);

export default attendanceRouter;
