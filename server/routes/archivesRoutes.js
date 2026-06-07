// archivesRoutes.js
import express from "express";
import adminAuth from "../middleware/adminauth.js";
import staffAuth from "../middleware/staffauth.js";
import { getInventoryArchive } from "../controllers/archivesConteollers.js";

const archivesRouter = express.Router();

// GET /api/archives/inventory
// ?from=2025-01-01&to=2025-12-31&action=ADD_MEDICINE&page=1&limit=50
// Admin أو Staff بصلاحية manageOrders
archivesRouter.get(
  "/inventory",
  staffAuth("manageOrders"),
  getInventoryArchive,
);

export default archivesRouter;
