const Case = require("../models/Case");
const Donation = require("../models/Donation");
const logger = require("../utils/logger");
const { uploadToCloudinary, deleteFromCloudinary } = require("../utils/uploadToCloudinary");

// @desc    Create a new case
// @route   POST /api/cases
// @access  Private (Donee)
exports.createCase = async (req, res, next) => {
  try {
    const applicantId = req.userId;
    const caseData = { ...req.body, applicantId };

    // Handle image uploads
    if (req.files && req.files.images) {
      const imagePromises = Array.isArray(req.files.images)
        ? req.files.images.map((file) =>
            uploadToCloudinary(file.buffer, "cases/images")
          )
        : [uploadToCloudinary(req.files.images.buffer, "cases/images")];

      const uploadedImages = await Promise.all(imagePromises);
      caseData.images = uploadedImages;
    }

    // Handle document uploads
    if (req.files && req.files.documents) {
      const docPromises = Array.isArray(req.files.documents)
        ? req.files.documents.map((file) =>
            uploadToCloudinary(file.buffer, "cases/documents")
          )
        : [uploadToCloudinary(req.files.documents.buffer, "cases/documents")];

      const uploadedDocs = await Promise.all(docPromises);
      caseData.documents = uploadedDocs.map((doc, index) => ({
        ...doc,
        name: Array.isArray(req.files.documents)
          ? req.files.documents[index].originalname
          : req.files.documents.originalname,
      }));
    }

    const newCase = await Case.create(caseData);

    logger.info(`New case created: ${newCase._id} by user: ${applicantId}`);

    res.status(201).json({
      success: true,
      message: "Case submitted successfully",
      data: { case: newCase },
    });
  } catch (error) {
    // Clean up uploaded files on error
    if (req.files) {
      // Cleanup logic can be added here if needed
    }
    next(error);
  }
};

// @desc    Get public cases (approved cases with sensitive data hidden)
// @route   GET /api/cases/public
// @access  Public
exports.getPublicCases = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      status: "approved",
      isExpired: { $ne: true },
      expiresAt: { $gt: new Date() },
    };

    const cases = await Case.find(filter)
      .select(
        "applicantName city description amountRequired amountRaised images status createdAt fundingProgress"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate funding progress
    const casesWithProgress = cases.map((caseItem) => ({
      ...caseItem,
      fundingProgress: caseItem.amountRequired > 0
        ? Math.min((caseItem.amountRaised / caseItem.amountRequired) * 100, 100)
        : 0,
    }));

    const total = await Case.countDocuments(filter);

    res.json({
      success: true,
      data: {
        cases: casesWithProgress,
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

// @desc    Get single case by ID (public view - hides sensitive data)
// @route   GET /api/cases/:id
// @access  Public
exports.getCaseById = async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const userId = req.userId; // May be undefined for public access

    const caseItem = await Case.findById(caseId);

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // If case is approved, show public view
    if (caseItem.status === "approved") {
      const publicCase = {
        id: caseItem._id,
        applicantName: caseItem.applicantName,
        city: caseItem.city,
        description: caseItem.description,
        amountRequired: caseItem.amountRequired,
        amountRaised: caseItem.amountRaised,
        images: caseItem.images,
        status: caseItem.status,
        createdAt: caseItem.createdAt,
        fundingProgress:
          caseItem.amountRequired > 0
            ? Math.min(
                (caseItem.amountRaised / caseItem.amountRequired) * 100,
                100
              )
            : 0,
        bankDetails: caseItem.bankDetails, // Show bank details for approved cases
      };

      return res.json({
        success: true,
        data: { case: publicCase },
      });
    }

    // If user is the applicant or admin, show full details
    if (userId && (userId.toString() === caseItem.applicantId.toString() || req.user?.role === "admin")) {
      return res.json({
        success: true,
        data: { case: caseItem },
      });
    }

    res.status(403).json({
      success: false,
      message: "Access denied",
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update case
// @route   PUT /api/cases/:id
// @access  Private (Donee - own cases only)
exports.updateCase = async (req, res, next) => {
  try {
    const caseId = req.params.id;
    const userId = req.userId;

    const caseItem = await Case.findById(caseId);

    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    // Check ownership
    if (caseItem.applicantId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own cases",
      });
    }

    // Only allow updates if case is pending or peer_review
    if (!["pending", "peer_review"].includes(caseItem.status)) {
      return res.status(400).json({
        success: false,
        message: "Cannot update case in current status",
      });
    }

    // Handle new image uploads
    if (req.files && req.files.images) {
      const imagePromises = Array.isArray(req.files.images)
        ? req.files.images.map((file) =>
            uploadToCloudinary(file.buffer, "cases/images")
          )
        : [uploadToCloudinary(req.files.images.buffer, "cases/images")];

      const uploadedImages = await Promise.all(imagePromises);
      req.body.images = [...(caseItem.images || []), ...uploadedImages];
    }

    const updatedCase = await Case.findByIdAndUpdate(caseId, req.body, {
      new: true,
      runValidators: true,
    });

    logger.info(`Case updated: ${caseId} by user: ${userId}`);

    res.json({
      success: true,
      message: "Case updated successfully",
      data: { case: updatedCase },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my cases (for donee)
// @route   GET /api/cases/my
// @access  Private (Donee)
exports.getMyCases = async (req, res, next) => {
  try {
    const userId = req.userId;

    const cases = await Case.find({ applicantId: userId })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { cases },
    });
  } catch (error) {
    next(error);
  }
};

