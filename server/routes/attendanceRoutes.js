import express from "express";
import staffAuth from "../middleware/staffauth.js";
import adminAuth from "../middleware/adminauth.js";
import attendanceModel from "../models/Attendance.js";

const attendanceRouter = express.Router();

// GET /api/attendance/all — Admin يشوف كل الحضور
attendanceRouter.get("/all", adminAuth, async (req, res) => {
  try {
    const records = await attendanceModel
      .find()
      .sort({ date: -1, clockIn: -1 })
      .limit(500);

    const formatted = records.map((r) => ({
      id: r._id,
      name: r.staffName,
      role: r.role || "staff",
      date: r.date,
      clockIn: r.clockIn
        ? new Date(r.clockIn).toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      clockOut: r.clockOut
        ? new Date(r.clockOut).toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
    }));

    res.json({ success: true, records: formatted });
  } catch (err) {
    console.error("attendance/all error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch attendance" });
  }
});

// POST /api/attendance/clockin
attendanceRouter.post("/clockin", staffAuth(), async (req, res) => {
  try {
    const staff = req.staff;

    if (!staff._id) {
      return res
        .status(400)
        .json({ success: false, message: "Admin cannot clock in" });
    }

    const today = new Date().toLocaleDateString("en-CA");

    // ✅ بيرفض بس لو في session مفتوحة (دخل ولسه مخرجش)
    const openSession = await attendanceModel.findOne({
      staffId: staff._id,
      date: today,
      clockOut: null,
    });

    if (openSession) {
      return res.status(400).json({
        success: false,
        message: "Already clocked in — clock out first",
      });
    }

    // ✅ record جديد في كل دخول
    const record = await attendanceModel.create({
      staffId: staff._id,
      staffName: staff.name,
      role: staff.role,
      date: today,
      clockIn: new Date(),
    });

    res.json({ success: true, message: "Clock in recorded", record });
  } catch (err) {
    console.error("clockin error:", err);
    res.status(500).json({ success: false, message: "Failed to clock in" });
  }
});

// PUT /api/attendance/clockout
attendanceRouter.put("/clockout", staffAuth(), async (req, res) => {
  try {
    const staff = req.staff;

    if (!staff._id) {
      return res
        .status(400)
        .json({ success: false, message: "Admin cannot clock out" });
    }

    const today = new Date().toLocaleDateString("en-CA");

    const record = await attendanceModel.findOneAndUpdate(
      { staffId: staff._id, date: today, clockOut: null },
      { clockOut: new Date() },
      { returnDocument: "after" },
    );

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "No active clock-in found for today",
      });
    }

    res.json({ success: true, message: "Clock out recorded", record });
  } catch (err) {
    console.error("clockout error:", err);
    res.status(500).json({ success: false, message: "Failed to clock out" });
  }
});

// GET /api/attendance/my — الموظف يشوف حضوره
attendanceRouter.get("/my", staffAuth(), async (req, res) => {
  try {
    if (!req.staff._id) {
      return res.json({ success: true, records: [] });
    }

    const records = await attendanceModel
      .find({ staffId: req.staff._id })
      .sort({ date: -1, clockIn: -1 })
      .limit(60);

    const formatted = records.map((r) => ({
      id: r._id,
      name: r.staffName,
      role: r.role || "staff",
      date: r.date,
      clockIn: r.clockIn
        ? new Date(r.clockIn).toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      clockOut: r.clockOut
        ? new Date(r.clockOut).toLocaleTimeString("ar-EG", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
    }));

    res.json({ success: true, records: formatted });
  } catch (err) {
    console.error("attendance/my error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch attendance" });
  }
});

export default attendanceRouter;
