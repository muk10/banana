const Case = require("../models/Case");
const Donation = require("../models/Donation");
const User = require("../models/User");
const Query = require("../models/Query");
const AuditLog = require("../models/AuditLog");
const logger = require("../utils/logger");

// @desc    Get all cases for admin review
// @route   GET /api/admin/cases
// @access  Private (Admin)
exports.getAdminCases = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    const filter = {};
    if (status) {
      filter.status = status;
    }

    const cases = await Case.find(filter)
      .populate("applicantId", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Case.countDocuments(filter);

    res.json({
      success: true,
      data: {
        cases,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or reject case
// @route   PUT /api/admin/cases/:id/approve
// @access  Private (Admin)
exports.approveOrRejectCase = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;
    const adminId = req.userId;

    if (!["approved", "rejected", "peer_review"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const caseItem = await Case.findById(id);

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Add admin note
    if (adminNote) {
      caseItem.adminNotes.push({
        note: adminNote,
        adminId,
        createdAt: new Date(),
      });
    }

    caseItem.status = status;

    // If moving to peer review, set expiration
    if (status === "peer_review") {
      caseItem.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days for peer review
    }

    await caseItem.save();

    // Create audit log
    await AuditLog.create({
      action: status === "approved" ? "case_approved" : "case_rejected",
      performedBy: adminId,
      targetType: "case",
      targetId: id,
      details: { status, adminNote },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(`Case ${status}: ${id} by admin: ${adminId}`);

    res.json({
      success: true,
      message: `Case ${status} successfully`,
      data: { case: caseItem },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify donation payment proof
// @route   PUT /api/admin/donations/:id/verify
// @access  Private (Admin)
exports.verifyDonation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body; // status: "confirmed" or "rejected"
    const adminId = req.userId;

    if (!["confirmed", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Must be 'confirmed' or 'rejected'",
      });
    }

    const donation = await Donation.findById(id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    if (donation.status !== "pending_verification") {
      return res.status(400).json({
        success: false,
        message: "Donation is not pending verification",
      });
    }

    donation.status = status;
    donation.verifiedBy = adminId;
    donation.verifiedAt = new Date();
    if (adminNotes) {
      donation.adminNotes = adminNotes;
    }

    // If confirmed, update case amount raised
    if (status === "confirmed") {
      const caseItem = await Case.findById(donation.caseId);
      if (caseItem) {
        caseItem.amountRaised += donation.pledgedAmount;
        donation.paidAmount = donation.pledgedAmount;

        // Check if case is now fully funded
        if (caseItem.amountRaised >= caseItem.amountRequired) {
          caseItem.status = "funded";
        }

        await caseItem.save();
      }
    }

    await donation.save();

    // Create audit log
    await AuditLog.create({
      action: status === "confirmed" ? "donation_verified" : "donation_rejected",
      performedBy: adminId,
      targetType: "donation",
      targetId: id,
      details: { status, adminNotes },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(`Donation ${status}: ${id} by admin: ${adminId}`);

    res.json({
      success: true,
      message: `Donation ${status} successfully`,
      data: { donation },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get admin reports and analytics
// @route   GET /api/admin/reports
// @access  Private (Admin)
exports.getReports = async (req, res, next) => {
  try {
    // Total donations
    const totalDonations = await Donation.aggregate([
      {
        $match: { status: "confirmed" },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$paidAmount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Active cases
    const activeCases = await Case.countDocuments({
      status: { $in: ["approved", "peer_review"] },
      isExpired: false,
    });

    // Funded cases
    const fundedCases = await Case.countDocuments({ status: "funded" });

    // Donor count
    const donorCount = await User.countDocuments({ role: "donor" });

    // Pending approvals
    const pendingApprovals = await Case.countDocuments({
      status: { $in: ["pending", "under_admin_review"] },
    });

    // Pending donation verifications
    const pendingVerifications = await Donation.countDocuments({
      status: "pending_verification",
    });

    // Cases by status
    const casesByStatus = await Case.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Donations by status
    const donationsByStatus = await Donation.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$pledgedAmount" },
        },
      },
    ]);

    // Recent donations
    const recentDonations = await Donation.find({ status: "confirmed" })
      .populate("donorId", "name email")
      .populate("caseId", "applicantName")
      .sort({ verifiedAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      data: {
        summary: {
          totalDonations: totalDonations[0]?.total || 0,
          donationCount: totalDonations[0]?.count || 0,
          activeCases,
          fundedCases,
          donorCount,
          pendingApprovals,
          pendingVerifications,
        },
        casesByStatus,
        donationsByStatus,
        recentDonations,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role;

    const filter = {};
    if (role) {
      filter.role = role;
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Block or unblock user
// @route   PUT /api/admin/users/:id/block
// @access  Private (Admin)
exports.blockUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isBlocked } = req.body;
    const adminId = req.userId;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Cannot block admin users",
      });
    }

    user.isBlocked = isBlocked;
    await user.save();

    // Create audit log
    await AuditLog.create({
      action: isBlocked ? "user_blocked" : "user_unblocked",
      performedBy: adminId,
      targetType: "user",
      targetId: id,
      details: { isBlocked },
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    logger.info(`User ${isBlocked ? "blocked" : "unblocked"}: ${id} by admin: ${adminId}`);

    res.json({
      success: true,
      message: `User ${isBlocked ? "blocked" : "unblocked"} successfully`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

