const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
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
    pledgedAmount: {
      type: Number,
      required: true,
      min: [1, "Pledged amount must be greater than 0"],
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentProof: {
      url: String,
      publicId: String,
      uploadedAt: Date,
    },
    status: {
      type: String,
      enum: ["pledged", "pending_verification", "confirmed", "rejected"],
      default: "pledged",
    },
    adminNotes: {
      type: String,
      trim: true,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
donationSchema.index({ donorId: 1, createdAt: -1 });
donationSchema.index({ caseId: 1 });
donationSchema.index({ status: 1 });

module.exports = mongoose.model("Donation", donationSchema);

