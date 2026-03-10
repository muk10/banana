const Donation = require("../models/Donation");
const Case = require("../models/Case");
const logger = require("../utils/logger");
const { uploadToCloudinary } = require("../utils/uploadToCloudinary");

// @desc    Pledge a donation
// @route   POST /api/donations/pledge
// @access  Private (Donor)
exports.pledgeDonation = async (req, res, next) => {
  try {
    const { caseId, pledgedAmount } = req.body;
    const donorId = req.userId;

    // Check if case exists and is approved
    const caseItem = await Case.findById(caseId);
    if (!caseItem) {
      return res.status(404).json({
        success: false,
        message: "Case not found",
      });
    }

    if (caseItem.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Can only donate to approved cases",
      });
    }

    if (caseItem.isExpired) {
      return res.status(400).json({
        success: false,
        message: "This case has expired",
      });
    }

    // Check if case is already fully funded
    if (caseItem.amountRaised >= caseItem.amountRequired) {
      return res.status(400).json({
        success: false,
        message: "This case is already fully funded",
      });
    }

    // Check if donor already has a pending/confirmed donation for this case
    const existingDonation = await Donation.findOne({
      donorId,
      caseId,
      status: { $in: ["pledged", "pending_verification", "confirmed"] },
    });

    if (existingDonation) {
      return res.status(400).json({
        success: false,
        message: "You already have an active donation for this case",
      });
    }

    // Create donation
    const donation = await Donation.create({
      donorId,
      caseId,
      pledgedAmount,
      status: "pledged",
    });

    logger.info(
      `Donation pledged: ${donation._id} for case: ${caseId} by donor: ${donorId}`
    );

    res.status(201).json({
      success: true,
      message: "Donation pledged successfully. Please upload payment proof.",
      data: { donation },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload payment proof
// @route   POST /api/donations/:id/upload-proof
// @access  Private (Donor)
exports.uploadPaymentProof = async (req, res, next) => {
  try {
    const { id: donationId } = req.params;
    const donorId = req.userId;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Payment proof image is required",
      });
    }

    const donation = await Donation.findById(donationId);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    // Check ownership
    if (donation.donorId.toString() !== donorId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only upload proof for your own donations",
      });
    }

    if (donation.status !== "pledged") {
      return res.status(400).json({
        success: false,
        message: "Payment proof can only be uploaded for pledged donations",
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      req.file.buffer,
      "donations/payment-proofs"
    );

    // Update donation
    donation.paymentProof = {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      uploadedAt: new Date(),
    };
    donation.status = "pending_verification";
    await donation.save();

    logger.info(`Payment proof uploaded for donation: ${donationId}`);

    res.json({
      success: true,
      message: "Payment proof uploaded successfully. Waiting for admin verification.",
      data: { donation },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get my donations
// @route   GET /api/donations/my
// @access  Private (Donor)
exports.getMyDonations = async (req, res, next) => {
  try {
    const donorId = req.userId;

    const donations = await Donation.find({ donorId })
      .populate("caseId", "applicantName city description amountRequired")
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      data: { donations },
    });
  } catch (error) {
    next(error);
  }
};

