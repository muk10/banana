const Query = require("../models/Query");
const logger = require("../utils/logger");

// @desc    Create a query
// @route   POST /api/queries
// @access  Private (Donor)
exports.createQuery = async (req, res, next) => {
  try {
    const { caseId, message } = req.body;
    const donorId = req.userId;

    const query = await Query.create({
      donorId,
      caseId,
      message,
      status: "pending",
    });

    logger.info(`Query created: ${query._id} for case: ${caseId} by donor: ${donorId}`);

    res.status(201).json({
      success: true,
      message: "Query submitted successfully",
      data: { query },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get queries for admin
// @route   GET /api/queries/admin
// @access  Private (Admin)
exports.getAdminQueries = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || "pending";

    const filter = { status };

    const queries = await Query.find(filter)
      .populate("donorId", "name email")
      .populate("caseId", "applicantName city description")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Query.countDocuments(filter);

    res.json({
      success: true,
      data: {
        queries,
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

// @desc    Reply to a query
// @route   POST /api/queries/reply
// @access  Private (Admin)
exports.replyToQuery = async (req, res, next) => {
  try {
    const { queryId, adminReply } = req.body;
    const adminId = req.userId;

    const query = await Query.findById(queryId);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: "Query not found",
      });
    }

    query.adminReply = adminReply;
    query.repliedBy = adminId;
    query.status = "replied";
    query.repliedAt = new Date();
    await query.save();

    logger.info(`Query replied: ${queryId} by admin: ${adminId}`);

    res.json({
      success: true,
      message: "Reply sent successfully",
      data: { query },
    });
  } catch (error) {
    next(error);
  }
};

