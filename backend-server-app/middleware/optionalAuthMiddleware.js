const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * If a valid Bearer token is present, sets req.user and req.userId (same as authMiddleware).
 * If missing/invalid/expired, continues without auth — for routes that are public but need
 * role-aware behavior when logged in (e.g. GET /api/cases/:id for admin/donee).
 */
module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.substring(7);
    if (!token) {
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (user && !user.isBlocked) {
        req.user = user;
        req.userId = decoded.userId;
      }
    } catch {
      // Invalid/expired token — treat as anonymous for this public route
    }

    next();
  } catch (error) {
    next(error);
  }
};
