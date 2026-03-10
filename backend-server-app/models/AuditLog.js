const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      enum: [
        "case_approved",
        "case_rejected",
        "case_edited",
        "donation_verified",
        "donation_rejected",
        "user_blocked",
        "user_unblocked",
        "admin_note_added",
      ],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    targetType: {
      type: String,
      enum: ["case", "donation", "user", "query"],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
    ipAddress: String,
    userAgent: String,
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
auditLogSchema.index({ performedBy: 1, createdAt: -1 });
auditLogSchema.index({ targetType: 1, targetId: 1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);

