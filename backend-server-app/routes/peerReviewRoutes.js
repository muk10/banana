const express = require("express");
const router = express.Router();
const {
  createReview,
  getCaseReviews,
} = require("../controllers/peerReviewController");
const { validate } = require("../utils/validators");
const { createReviewSchema } = require("../utils/validators");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/",
  authMiddleware,
  validate(createReviewSchema),
  createReview
);

router.get("/:caseId", getCaseReviews);

module.exports = router;

