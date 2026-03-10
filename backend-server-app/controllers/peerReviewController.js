const PeerReview = require("../models/PeerReview");
const Case = require("../models/Case");
const logger = require("../utils/logger");

// @desc    Create a peer review
// @route   POST /api/reviews
// @access  Private (All authenticated users)
exports.createReview = async (req, res, next) => {
  try {
    const { caseId, comment, supportVote, flagged, flagReason } = req.body;
    const reviewerId = req.userId;
    const reviewerName = req.user.name;

    // Check if case exists and is in peer review
    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    if (caseItem.status !== "peer_review") {
      return res.status(400).json({
        success: false,
        message: "Case is not in peer review status",
      });
    }

    // Check if user already reviewed this case
    const existingReview = await PeerReview.findOne({
      caseId,
      reviewerId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this case",
      });
    }

    // Prevent applicant from reviewing their own case
    if (caseItem.applicantId.toString() === reviewerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You cannot review your own case",
      });
    }

    // Create review
    const review = await PeerReview.create({
      caseId,
      reviewerId,
      reviewerName,
      comment,
      supportVote,
      flagged,
      flagReason,
    });

    // Update case with review data
    caseItem.peerReviews.push({
      reviewerId,
      comment,
      supportVote,
      flagged,
      createdAt: new Date(),
    });

    // Update negative review count
    if (supportVote === false) {
      caseItem.negativeReviewCount = (caseItem.negativeReviewCount || 0) + 1;
    }

    // Update flagged count
    if (flagged) {
      caseItem.flaggedCount = (caseItem.flaggedCount || 0) + 1;
    }

    await caseItem.save();

    logger.info(`Peer review created: ${review._id} for case: ${caseId}`);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: { review },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a case
// @route   GET /api/reviews/:caseId
// @access  Public
exports.getCaseReviews = async (req, res, next) => {
  try {
    const { caseId } = req.params;

    const reviews = await PeerReview.find({ caseId })
      .select("reviewerName comment supportVote flagged createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { reviews },
    });
  } catch (error) {
    next(error);
  }
};

