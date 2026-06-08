import attendanceModel from "../models/Attendance.js";

// ─── helpers ───────────────────────────────────────────
export const todaySA = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Riyadh" });

export const formatTime = (date) =>
  date
    ? new Date(date).toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Riyadh",
      })
    : null;

// ───────────────────────────────────────────────────────

// @route GET /api/attendance/all  (admin)
export const getAllAttendance = async (req, res) => {
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
      clockIn: formatTime(r.clockIn),
      clockOut: formatTime(r.clockOut),
    }));

    res.json({ success: true, records: formatted });
  } catch (err) {
    console.error("attendance/all error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch attendance" });
  }
};

// @route POST /api/attendance/clockin
export const clockIn = async (req, res) => {
  try {
    const staff = req.staff;

    if (!staff._id) {
      return res
        .status(400)
        .json({ success: false, message: "Admin cannot clock in" });
    }

    const today = todaySA();

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
};

// @route PUT /api/attendance/clockout
export const clockOut = async (req, res) => {
  try {
    const staff = req.staff;

    if (!staff._id) {
      return res
        .status(400)
        .json({ success: false, message: "Admin cannot clock out" });
    }

    const today = todaySA();

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
};

// @route GET /api/attendance/my  (staff)
export const getMyAttendance = async (req, res) => {
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
      clockIn: formatTime(r.clockIn),
      clockOut: formatTime(r.clockOut),
    }));

    res.json({ success: true, records: formatted });
  } catch (err) {
    console.error("attendance/my error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch attendance" });
  }
};
