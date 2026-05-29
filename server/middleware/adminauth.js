import jwt from "jsonwebtoken";

// ✅ Middleware للـ Admin فقط (صاحب المشروع)
const adminAuth = (req, res, next) => {
  try {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    } else if (req.headers.token) {
      token = req.headers.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — login again",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ بعد التصحيح — بنتحقق من role مش من email+password
    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Access denied — Admins only",
      });
    }

    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default adminAuth;
