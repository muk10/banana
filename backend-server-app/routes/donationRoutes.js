const express = require("express");
const router = express.Router();
const {
  pledgeDonation,
  uploadPaymentProof,
  getMyDonations,
} = require("../controllers/donationController");
const { validate } = require("../utils/validators");
const { pledgeDonationSchema } = require("../utils/validators");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");
const { donationLimiter } = require("../middleware/rateLimiter");
const { uploadPaymentProof: uploadProof } = require("../middleware/uploadMiddleware");

router.post(
  "/pledge",
  authMiddleware,
  roleMiddleware("donor"),
  donationLimiter,
  validate(pledgeDonationSchema),
  pledgeDonation
);

router.post(
  "/:id/upload-proof",
  authMiddleware,
  roleMiddleware("donor"),
  uploadProof.single("paymentProof"),
  uploadPaymentProof
);

router.get(
  "/my",
  authMiddleware,
  roleMiddleware("donor"),
  getMyDonations
);

module.exports = router;

