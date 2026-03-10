const express = require("express");
const router = express.Router();
const {
  getAdminCases,
  approveOrRejectCase,
  verifyDonation,
  getReports,
  getUsers,
  blockUser,
} = require("../controllers/adminController");
const { validate } = require("../utils/validators");
const { approveCaseSchema } = require("../utils/validators");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

// Case management
router.get("/cases", authMiddleware, roleMiddleware("admin"), getAdminCases);
router.put(
  "/cases/:id/approve",
  authMiddleware,
  roleMiddleware("admin"),
  validate(approveCaseSchema),
  approveOrRejectCase
);

// Donation verification
router.put(
  "/donations/:id/verify",
  authMiddleware,
  roleMiddleware("admin"),
  verifyDonation
);

// Reports and analytics
router.get(
  "/reports",
  authMiddleware,
  roleMiddleware("admin"),
  getReports
);

// User management
router.get("/users", authMiddleware, roleMiddleware("admin"), getUsers);
router.put(
  "/users/:id/block",
  authMiddleware,
  roleMiddleware("admin"),
  blockUser
);

module.exports = router;

