require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./utils/logger");
const connectDB = require("./config/db");
const errorMiddleware = require("./middleware/errorMiddleware");
const { apiLimiter } = require("./middleware/rateLimiter");

// Import routes
const authRoutes = require("./routes/authRoutes");
const caseRoutes = require("./routes/caseRoutes");
const donationRoutes = require("./routes/donationRoutes");
const peerReviewRoutes = require("./routes/peerReviewRoutes");
const queryRoutes = require("./routes/queryRoutes");
const adminRoutes = require("./routes/adminRoutes");
const zakatRoutes = require("./routes/zakatRoutes");

// Initialize app
const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));

// Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Rate limiting
app.use("/api/", apiLimiter);

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/donations", donationRoutes);
app.use("/api/reviews", peerReviewRoutes);
app.use("/api/queries", queryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/zakat", zakatRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV || "development"} mode`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Promise Rejection:", err);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception:", err);
  process.exit(1);
});

module.exports = app;
