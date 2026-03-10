const Case = require("../models/Case");
const logger = require("../utils/logger");

// Check and expire old cases
exports.checkExpiredCases = async () => {
  try {
    const now = new Date();
    const expiredCases = await Case.updateMany(
      {
        expiresAt: { $lt: now },
        isExpired: false,
        status: { $in: ["approved", "peer_review"] },
      },
      {
        $set: { isExpired: true },
      }
    );

    if (expiredCases.modifiedCount > 0) {
      logger.info(`Expired ${expiredCases.modifiedCount} cases`);
    }
  } catch (error) {
    logger.error("Error checking expired cases:", error);
  }
};

// Fraud detection - flag cases with many negative reviews
exports.detectFraud = async (caseId) => {
  try {
    const caseItem = await Case.findById(caseId);

    if (!caseItem) return;

    // Flag if negative reviews exceed threshold
    const NEGATIVE_REVIEW_THRESHOLD = 5;
    const FLAG_THRESHOLD = 3;

    if (caseItem.negativeReviewCount >= NEGATIVE_REVIEW_THRESHOLD) {
      caseItem.status = "under_admin_review";
      await caseItem.save();
      logger.warn(`Case ${caseId} flagged for fraud - high negative reviews`);
    }

    if (caseItem.flaggedCount >= FLAG_THRESHOLD) {
      caseItem.status = "under_admin_review";
      await caseItem.save();
      logger.warn(`Case ${caseId} flagged for fraud - high flag count`);
    }
  } catch (error) {
    logger.error("Error in fraud detection:", error);
  }
};

// Run expiration check periodically (every hour)
if (process.env.NODE_ENV !== "test") {
  setInterval(() => {
    exports.checkExpiredCases();
  }, 60 * 60 * 1000); // 1 hour
}

