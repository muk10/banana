const mongoose = require("mongoose");

const caseSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    applicantName: {
      type: String,
      required: true,
      trim: true,
    },
    // Personal Information (Private)
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    cnic: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    // Family Details (Private)
    familyMembers: {
      type: Number,
      required: true,
      min: 1,
    },
    dependents: {
      type: String,
      required: true,
      trim: true,
    },
    income: {
      type: Number,
      required: true,
      min: 0,
    },
    expenses: {
      type: Number,
      required: true,
      min: 0,
    },
    // Case Information (Public)
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    amountRequired: {
      type: Number,
      required: true,
      min: [1, "Amount must be greater than 0"],
    },
    amountRaised: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Bank Details (Private until approved)
    bankDetails: {
      accountNumber: String,
      accountTitle: String,
      bankName: String,
      iban: String,
    },
    // Media
    images: [
      {
        url: String,
        publicId: String,
      },
    ],
    documents: [
      {
        url: String,
        publicId: String,
        name: String,
      },
    ],
    videoUrl: {
      type: String,
      default: null,
    },
    // Status Management
    status: {
      type: String,
      enum: [
        "pending",
        "peer_review",
        "under_admin_review",
        "approved",
        "rejected",
        "funded",
      ],
      default: "pending",
    },
    // Peer Review Data
    peerReviews: [
      {
        reviewerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        comment: String,
        supportVote: Boolean,
        flagged: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Admin Management
    adminNotes: [
      {
        note: String,
        adminId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Fraud Detection
    negativeReviewCount: {
      type: Number,
      default: 0,
    },
    flaggedCount: {
      type: Number,
      default: 0,
    },
    // Expiration
    expiresAt: {
      type: Date,
      default: function () {
        return new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days
      },
    },
    isExpired: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
caseSchema.index({ status: 1, createdAt: -1 });
caseSchema.index({ applicantId: 1 });
caseSchema.index({ expiresAt: 1 });

// Virtual for funding progress percentage
caseSchema.virtual("fundingProgress").get(function () {
  if (this.amountRequired === 0) return 0;
  return Math.min((this.amountRaised / this.amountRequired) * 100, 100);
});

// Method to check if case is fully funded
caseSchema.methods.isFullyFunded = function () {
  return this.amountRaised >= this.amountRequired;
};

module.exports = mongoose.model("Case", caseSchema);

