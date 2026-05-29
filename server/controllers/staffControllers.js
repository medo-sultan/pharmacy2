import staffLogModel from "../models/staffLog.js";
import userModel from "../models/user.js";

const logAction = async (staff, action, details = {}, ip = "") => {
  try {
    await staffLogModel.create({
      staffId: staff._id,
      staffName: staff.name,
      action,
      details,
      ip,
    });
  } catch (err) {
    console.error("Log error:", err);
  }
};

// ═══════════════════════════════════════════
//  منتجات — Products
// ═══════════════════════════════════════════

// @route POST /api/staff/product/add
// @permission manageProducts
const addProduct = async (req, res) => {
  try {
    // هنا تضيف لوجيك إضافة المنتج من الـ Product model بتاعتك
    const { name, price, category, description } = req.body;

    // مثال placeholder — استبدله بـ productModel الحقيقي
    // const product = await productModel.create({ name, price, category, description });

    await logAction(
      req.staff,
      "ADD_PRODUCT",
      { name, price, category },
      req.ip,
    );

    res.json({ success: true, message: "Product added successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to add product" });
  }
};

// @route PUT /api/staff/product/edit/:id
// @permission manageProducts
const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // const product = await productModel.findByIdAndUpdate(id, updates, { new: true });

    await logAction(
      req.staff,
      "EDIT_PRODUCT",
      { productId: id, updates },
      req.ip,
    );

    res.json({ success: true, message: "Product updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to edit product" });
  }
};

// ═══════════════════════════════════════════
//  طلبات — Orders
// ═══════════════════════════════════════════

// @route GET /api/staff/orders
// @permission manageOrders
const getOrders = async (req, res) => {
  try {
    // const orders = await orderModel.find().populate("userId", "name email");

    await logAction(req.staff, "VIEW_ORDERS", {}, req.ip);

    // Placeholder response
    res.json({ success: true, orders: [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

// @route PUT /api/staff/order/status/:id
// @permission manageOrders
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid status" });
    }

    // await orderModel.findByIdAndUpdate(id, { status });

    await logAction(
      req.staff,
      "UPDATE_ORDER_STATUS",
      { orderId: id, newStatus: status },
      req.ip,
    );

    res.json({ success: true, message: `Order status updated to ${status}` });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to update order status" });
  }
};

// ═══════════════════════════════════════════
//  عملاء — Customers
// ═══════════════════════════════════════════

// @route GET /api/staff/customers
// @permission viewCustomers
const getCustomers = async (req, res) => {
  try {
    const customers = await userModel
      .find({ role: "user" })
      .select("name email createdAt")
      .sort({ createdAt: -1 });

    await logAction(
      req.staff,
      "VIEW_CUSTOMERS",
      { count: customers.length },
      req.ip,
    );

    res.json({ success: true, customers });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch customers" });
  }
};

// ═══════════════════════════════════════════
//  الـ Staff نفسه — Profile
// ═══════════════════════════════════════════

// @route GET /api/staff/profile
const getStaffProfile = async (req, res) => {
  try {
    const staff = await userModel.findById(req.staff._id).select("-password");

    res.json({ success: true, staff });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to get profile" });
  }
};

export {
  addProduct,
  editProduct,
  getOrders,
  updateOrderStatus,
  getCustomers,
  getStaffProfile,
};
