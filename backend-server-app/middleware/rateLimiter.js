const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later.",
    });
  },
});

// Strict rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many login attempts, please try again later.",
  },
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: "Too many login attempts, please try again later.",
    });
  },
});

// Rate limiter for donation endpoints
const donationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 donation requests per hour
  message: {
    success: false,
    message: "Too many donation requests, please try again later.",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  donationLimiter,
};

