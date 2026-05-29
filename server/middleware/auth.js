import jwt from "jsonwebtoken";

const authUser = (req, res, next) => {
  try {
    // ✅ يدعم الاثنين: Authorization: Bearer <token> أو token: <token>
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
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ بيحط userId في req.body عشان الـ controllers تقدر تقرأه
    req.body.userId = decoded.id;

    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export default authUser;
