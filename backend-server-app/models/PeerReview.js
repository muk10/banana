const mongoose = require("mongoose");

const peerReviewSchema = new mongoose.Schema(
  {
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewerName: {
      type: String,
      required: true,
      trim: true,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    supportVote: {
      type: Boolean,
      default: null, // null = no vote, true = support, false = oppose
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    flagReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate reviews from same user for same case
peerReviewSchema.index({ caseId: 1, reviewerId: 1 }, { unique: true });

module.exports = mongoose.model("PeerReview", peerReviewSchema);

