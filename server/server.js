import dotenv from "dotenv";
import express from "express";
import cors from "cors";

dotenv.config();

const app = express();

const { default: connectDB } = await import("./config/db.js");
const { default: connectCloudinary } = await import("./config/cloudinary.js");
const { default: userRoutes } = await import("./routes/userRoutes.js");
const { default: pharmacyRouter } = await import("./routes/pharmacyRoutes.js");
const { default: barcodeRouter } = await import("./routes/barcodeRoutes.js");
const { default: attendanceRouter } =
  await import("./routes/attendanceRoutes.js");

connectCloudinary();

// ── Middleware: ضمان اتصال DB قبل أي request ──────────────
// ده الحل الأساسي على Vercel Serverless
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("DB connection failed:", err.message);
    res.status(503).json({
      success: false,
      message: "قاعدة البيانات غير متاحة حالياً، حاول مجدداً",
    });
  }
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "token"],
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => res.json({ message: "API running..." }));

app.use("/api/user", userRoutes);
app.use("/api/pharmacy", pharmacyRouter);
app.use("/api/attendance", attendanceRouter);
app.use("/api/barcode", barcodeRouter);

app.use((req, res) => res.status(404).json({ message: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
