// @desc    Calculate Zakat
// @route   POST /api/zakat/calculate
// @access  Public
exports.calculateZakat = async (req, res, next) => {
  try {
    const { savings, gold, silver, investments, debts } = req.body;

    // Zakat calculation formula
    // Zakat = 2.5% of eligible wealth
    // Eligible wealth = (savings + gold + silver + investments) - debts
    // Nisab threshold: Value of 85g of gold or 595g of silver (using gold as standard)

    // Current gold price per gram (this should be updated regularly or fetched from API)
    // For now, using approximate value - in production, fetch from API
    const GOLD_PRICE_PER_GRAM = 8000; // PKR per gram (example)
    const SILVER_PRICE_PER_GRAM = 100; // PKR per gram (example)
    const NISAB_GOLD_GRAMS = 85;
    const NISAB_SILVER_GRAMS = 595;

    // Calculate nisab value (using gold standard)
    const nisabValue = NISAB_GOLD_GRAMS * GOLD_PRICE_PER_GRAM;

    // Calculate total wealth
    const totalWealth = savings + gold + silver + investments;

    // Calculate eligible wealth (after deducting debts)
    const eligibleWealth = Math.max(0, totalWealth - debts);

    // Check if eligible wealth meets nisab threshold
    const meetsNisab = eligibleWealth >= nisabValue;

    // Calculate zakat (2.5% of eligible wealth)
    const zakatAmount = meetsNisab ? eligibleWealth * 0.025 : 0;

    // Calculate breakdown
    const breakdown = {
      savings,
      gold,
      silver,
      investments,
      totalWealth,
      debts,
      eligibleWealth,
      nisabValue,
      meetsNisab,
      zakatAmount: Math.round(zakatAmount * 100) / 100, // Round to 2 decimal places
      zakatPercentage: 2.5,
    };

    res.json({
      success: true,
      message: meetsNisab
        ? "Zakat calculation completed"
        : "Wealth does not meet nisab threshold. No zakat is due.",
      data: breakdown,
    });
  } catch (error) {
    next(error);
  }
};

