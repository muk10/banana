const mongoose = require("mongoose");

const querySchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    caseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Case",
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [2000, "Message cannot exceed 2000 characters"],
    },
    adminReply: {
      type: String,
      trim: true,
    },
    repliedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "replied", "resolved"],
      default: "pending",
    },
    repliedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
querySchema.index({ donorId: 1, createdAt: -1 });
querySchema.index({ caseId: 1 });
querySchema.index({ status: 1 });

module.exports = mongoose.model("Query", querySchema);

