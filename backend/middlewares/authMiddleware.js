// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // This matches your login/verifyEmail → { userId: "..." }
    req.userId = decoded.userId;

    // Optional: attach full user for convenience
    // req.user = decoded;

    next();
  } catch (err) {
    console.log("JWT Error:", err.message);
    return res.status(401).json({ 
      message: "Invalid or expired token",
      expired: err.name === "TokenExpiredError"
    });
  }
};