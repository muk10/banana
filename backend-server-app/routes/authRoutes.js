const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getMe,
  logout,
} = require("../controllers/authController");
const { validate } = require("../utils/validators");
const {
  registerSchema,
  loginSchema,
} = require("../utils/validators");
const authMiddleware = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  register
);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", authMiddleware, getMe);
router.post("/logout", authMiddleware, logout);

module.exports = router;

