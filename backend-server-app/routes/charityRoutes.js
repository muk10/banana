const express = require("express");
const router = express.Router();
const { calculateCharity } = require("../controllers/charityController");
const { validate } = require("../utils/validators");
const { charityCalculatorSchema } = require("../utils/validators");

router.post(
  "/calculate",
  validate(charityCalculatorSchema),
  calculateCharity
);

module.exports = router;

