import jwt from "jsonwebtoken";
import userModel from "../models/user.js";
////////2

const staffAuth = (requiredPermission = null) => {
  return async (req, res, next) => {
    try {
      let token;

      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else if (req.headers.token) {
        token = req.headers.token;
      }

      if (!token) {
        return res
          .status(401)
          .json({ success: false, message: "No token provided" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Admin token — اسمحله يعدي بدون DB query
      if (decoded.role === "admin") {
        req.staff = { role: "admin", name: "Admin", _id: null };
        // ✅ لا تلمس req.body في حالة admin — مش محتاجينه
        return next();
      }

      // ✅ Staff عادي — جيب بياناته من الداتابيز
      const staff = await userModel.findById(decoded.id).select("-password");

      if (!staff) {
        return res
          .status(401)
          .json({ success: false, message: "Staff not found" });
      }

      if (staff.role !== "staff") {
        return res
          .status(403)
          .json({ success: false, message: "Access denied — Staff only" });
      }

      if (requiredPermission) {
        if (!staff.permissions?.[requiredPermission]) {
          return res.status(403).json({
            success: false,
            message: `You don't have permission: ${requiredPermission}`,
          });
        }
      }

      req.staff = staff;

      // ✅ الإصلاح: فقط اضبط req.body.userId لو req.body موجود (POST/PUT/PATCH)
      if (req.body) {
        req.body.userId = staff._id;
      }

      next();
    } catch (error) {
      console.log(error);
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
  };
};

export default staffAuth;
