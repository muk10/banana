const express = require("express");
const router = express.Router();
const {
  createCase,
  getPublicCases,
  getCaseById,
  updateCase,
  getMyCases,
} = require("../controllers/caseController");
const { validate } = require("../utils/validators");
const {
  createCaseSchema,
  updateCaseSchema,
} = require("../utils/validators");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { uploadImages, uploadDocuments } = require("../middleware/uploadMiddleware");

// Public routes
router.get("/public", getPublicCases);
router.get("/:id", getCaseById);

// Protected routes
router.post(
  "/",
  authMiddleware,
  roleMiddleware("donee"),
  uploadImages.fields([
    { name: "images", maxCount: 10 },
    { name: "documents", maxCount: 5 },
  ]),
  validate(createCaseSchema),
  createCase
);

router.get("/my/cases", authMiddleware, roleMiddleware("donee"), getMyCases);

router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("donee"),
  uploadImages.fields([
    { name: "images", maxCount: 10 },
    { name: "documents", maxCount: 5 },
  ]),
  validate(updateCaseSchema),
  updateCase
);

module.exports = router;

