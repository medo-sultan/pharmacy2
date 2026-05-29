import express from "express";
import staffAuth from "../middleware/staffauth.js";
import {
  addProduct,
  editProduct,
  getOrders,
  updateOrderStatus,
  getCustomers,
  getStaffProfile,
} from "../controllers/staffControllers.js";
//////////////////////////////////////////////////////

const staffRouter = express.Router();

// ── Profile ──────────────────────────────────────────
// GET /api/staff/profile
staffRouter.get("/profile", staffAuth(), getStaffProfile);

// ── Products ─────────────────────────────────────────
// POST /api/staff/product/add      → لازم permission: manageProducts
staffRouter.post("/product/add", staffAuth("manageProducts"), addProduct);

// PUT /api/staff/product/edit/:id  → لازم permission: manageProducts
staffRouter.put("/product/edit/:id", staffAuth("manageProducts"), editProduct);

// ── Orders ───────────────────────────────────────────
// GET /api/staff/orders            → لازم permission: manageOrders
staffRouter.get("/orders", staffAuth("manageOrders"), getOrders);

// PUT /api/staff/order/status/:id  → لازم permission: manageOrders
staffRouter.put(
  "/order/status/:id",
  staffAuth("manageOrders"),
  updateOrderStatus,
);

// ── Customers ────────────────────────────────────────
// GET /api/staff/customers         → لازم permission: viewCustomers
staffRouter.get("/customers", staffAuth("viewCustomers"), getCustomers);

export default staffRouter;
