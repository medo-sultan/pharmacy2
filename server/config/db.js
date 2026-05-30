import mongoose from "mongoose";

// ── Cached connection (مهم جداً على Vercel Serverless) ──
let cached = global._mongoose;
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // لو في connection موجود وشغّال، ارجعه مباشرةً
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // لو في promise شغّال (request تاني بيستنى)، انتظره
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // متـ buffer متشيلش — لو مفيش connection ارجع error فوراً
      maxPoolSize: 10, // أقصى عدد connections في الـ pool
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    };

    cached.promise = mongoose
      .connect(process.env.MONGODB_URL, opts)
      .then((m) => {
        console.log("✅ MongoDB connected");
        return m;
      })
      .catch((err) => {
        // لو فشل امسح الـ promise عشان يحاول تاني في الـ request الجاي
        cached.promise = null;
        console.error("🔴 MongoDB connection failed:", err.message);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

// أحداث الـ connection للمراقبة
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected — سيعيد الاتصال تلقائياً");
  cached.conn = null;
  cached.promise = null;
});

mongoose.connection.on("error", (err) => {
  console.error("🔴 MongoDB error:", err.message);
  cached.conn = null;
  cached.promise = null;
});

export default connectDB;
