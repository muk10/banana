const express = require("express");
const router = express.Router();
const { calculateZakat } = require("../controllers/zakatController");
const { validate } = require("../utils/validators");
const { zakatCalculatorSchema } = require("../utils/validators");

router.post(
  "/calculate",
  validate(zakatCalculatorSchema),
  calculateZakat
);

module.exports = router;

