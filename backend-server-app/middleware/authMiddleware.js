const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../utils/logger");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid token format.",
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Fetch user from database to ensure they still exist and aren't blocked
      const user = await User.findById(decoded.userId).select("-password");
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found.",
        });
      }

      if (user.isBlocked) {
        return res.status(403).json({
          success: false,
          message: "Account has been blocked. Please contact administrator.",
        });
      }

      req.user = user;
      req.userId = decoded.userId;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Token expired. Please login again.",
        });
      }
      if (error.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Invalid token.",
        });
      }
      throw error;
    }
  } catch (error) {
    logger.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication error.",
    });
  }
};

module.exports = authMiddleware;