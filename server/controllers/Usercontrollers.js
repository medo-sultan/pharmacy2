import userModel from "../models/user.js";
import staffLogModel from "../models/staffLog.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// ═══════════════════════════════════════════
//  User Auth
// ═══════════════════════════════════════════

// @route POST /api/user/login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "المستخدم غير موجود" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "كلمة المرور غير صحيحة" });
    }

    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Login failed" });
  }
};

// @route POST /api/user/register
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "المستخدم موجود بالفعل" });
    }

    if (!validator.isEmail(email)) {
      return res.json({
        success: false,
        message: "Please enter a valid email",
      });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();

    const token = createToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
};

// @route POST /api/user/admin
const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign({ role: "admin", email }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.json({ success: true, message: "Admin login successful", token });
    } else {
      res
        .status(401)
        .json({ success: false, message: "Invalid admin credentials" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Admin login failed" });
  }
};

// @route GET /api/user/profile
const getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.body.userId).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Failed to get profile" });
  }
};

// ═══════════════════════════════════════════
//  Staff Management — Admin only
// ═══════════════════════════════════════════

// @route POST /api/user/staff/add
// @access Admin only
// body: { name, email, password, permissions: { manageProducts, manageOrders, viewCustomers } }
const addStaff = async (req, res) => {
  try {
    const { name, email, password, permissions } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });
    }

    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "Email already in use" });
    }

    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email" });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const staff = new userModel({
      name,
      email,
      password: hashedPassword,
      role: "staff",
      permissions: {
        manageProducts: permissions?.manageProducts || false,
        manageOrders: permissions?.manageOrders || false,
        viewCustomers: permissions?.viewCustomers || false,
      },
    });

    await staff.save();

    res.json({
      success: true,
      message: "Staff member added successfully",
      staff: {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        permissions: staff.permissions,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to add staff" });
  }
};

// @route PUT /api/user/staff/permissions/:id
// @access Admin only
// body: { permissions: { manageProducts, manageOrders, viewCustomers } }
const updateStaffPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;

    const staff = await userModel
      .findOneAndUpdate(
        { _id: id, role: "staff" },
        { permissions },
        { new: true },
      )
      .select("-password");

    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    res.json({ success: true, message: "Permissions updated", staff });
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update permissions" });
  }
};

// @route DELETE /api/user/staff/remove/:id
// @access Admin only
const removeStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const staff = await userModel.findOneAndDelete({ _id: id, role: "staff" });

    if (!staff) {
      return res
        .status(404)
        .json({ success: false, message: "Staff not found" });
    }

    res.json({ success: true, message: "Staff member removed" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to remove staff" });
  }
};

// @route GET /api/user/staff/all
// @access Admin only
const getAllStaff = async (req, res) => {
  try {
    const staffList = await userModel
      .find({ role: "staff" })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, staffList });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to fetch staff" });
  }
};

// @route GET /api/user/staff/logs
// @route GET /api/user/staff/logs/:staffId  ← سجل موظف معين
// @access Admin only
const getStaffLogs = async (req, res) => {
  try {
    const { staffId } = req.params;
    const filter = staffId ? { staffId } : {};

    const logs = await staffLogModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(200); // آخر 200 action

    res.json({ success: true, logs });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to fetch logs" });
  }
};

export {
  loginUser,
  registerUser,
  adminLogin,
  getProfile,
  addStaff,
  updateStaffPermissions,
  removeStaff,
  getAllStaff,
  getStaffLogs,
};
