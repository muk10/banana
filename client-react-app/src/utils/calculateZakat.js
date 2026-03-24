/** Nisab: gold equivalent (grams) — approximately 7.5 tola */
export const NISAB_GOLD_GRAMS = 87.48;

/** Nisab: silver equivalent (grams) — approximately 52.5 tola */
export const NISAB_SILVER_GRAMS = 612.36;

/**
 * Reference spot prices (PKR per gram). Update when refreshing rates.
 * As of March 24, 2026.
 */
export const REFERENCE_GOLD_PRICE_PER_GRAM_PKR_MAR_2026 = 43662.89;
export const REFERENCE_SILVER_PRICE_PER_GRAM_PKR_MAR_2026 = 683.58;

/**
 * @typedef {Object} ZakatInput
 * @property {number} cash
 * @property {number} gold_value
 * @property {number} silver_value
 * @property {number} investments
 * @property {number} business_inventory
 * @property {number} receivables
 * @property {number} short_term_debts
 * @property {number} nisab_value
 */

/**
 * Coerce to a non-negative finite number (empty/invalid → 0).
 * @param {unknown} value
 * @returns {number}
 */
export function safeNumber(value) {
  const n = Number(value);
  if (Number.isNaN(n) || !Number.isFinite(n)) {
    return 0;
  }
  return Math.max(0, n);
}

/**
 * Round to 2 decimal places (financial display / output).
 * @param {number} n
 * @returns {number}
 */
function roundToTwoDecimals(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/**
 * Pure Zakat calculation per specification.
 *
 * Example (PKR): cash 500_000, gold_value 300_000, silver 0, investments 200_000,
 * business_inventory 0, receivables 0, short_term_debts 200_000, nisab_value 150_000
 * → total_assets 1_000_000, net_wealth 800_000, zakatable above nisab 650_000,
 * zakat_due 16_250 (= 650_000 × 2.5%), status "Zakat obligatory".
 *
 * @param {ZakatInput} input
 * @returns {{
 *   total_assets: number;
 *   net_wealth: number;
 *   zakatable_above_nisab: number;
 *   zakat_due: number;
 *   status: "Not obligatory" | "Zakat obligatory";
 * }}
 */
export function calculateZakat(input) {
  const cash = safeNumber(input?.cash);
  const gold_value = safeNumber(input?.gold_value);
  const silver_value = safeNumber(input?.silver_value);
  const investments = safeNumber(input?.investments);
  const business_inventory = safeNumber(input?.business_inventory);
  const receivables = safeNumber(input?.receivables);
  const short_term_debts = safeNumber(input?.short_term_debts);
  const nisab_value = safeNumber(input?.nisab_value);

  const total_assets_raw =
    cash +
    gold_value +
    silver_value +
    investments +
    business_inventory +
    receivables;

  const net_wealth_raw = total_assets_raw - short_term_debts;

  if (net_wealth_raw < nisab_value) {
    return {
      total_assets: roundToTwoDecimals(total_assets_raw),
      net_wealth: roundToTwoDecimals(net_wealth_raw),
      zakatable_above_nisab: 0,
      zakat_due: 0,
      status: "Not obligatory",
    };
  }

  /** 2.5% on zakatable wealth above nisab (so nisab changes from metal prices affect Zakat due). */
  const zakatableAboveNisab = net_wealth_raw - nisab_value;
  const zakat_due = roundToTwoDecimals(zakatableAboveNisab * 0.025);

  return {
    total_assets: roundToTwoDecimals(total_assets_raw),
    net_wealth: roundToTwoDecimals(net_wealth_raw),
    zakatable_above_nisab: roundToTwoDecimals(zakatableAboveNisab),
    zakat_due,
    status: "Zakat obligatory",
  };
}

/**
 * Optional: nisab from Hanafi-style gold vs silver thresholds (use the lower in value).
 * @param {number} gold_price_per_gram
 * @param {number} silver_price_per_gram
 * @returns {number}
 */
export function computeNisabFromMetalPrices(gold_price_per_gram, silver_price_per_gram) {
  const g = safeNumber(gold_price_per_gram);
  const s = safeNumber(silver_price_per_gram);
  const nisab_gold = g * NISAB_GOLD_GRAMS;
  const nisab_silver = s * NISAB_SILVER_GRAMS;
  return roundToTwoDecimals(Math.min(nisab_gold, nisab_silver));
}

/**
 * Map raw form values to {@link ZakatInput} using {@link safeNumber}.
 * @param {Record<string, unknown>} raw
 * @returns {ZakatInput}
 */
export function formValuesToZakatInput(raw) {
  return {
    cash: safeNumber(raw?.cash),
    gold_value: safeNumber(raw?.gold_value),
    silver_value: safeNumber(raw?.silver_value),
    investments: safeNumber(raw?.investments),
    business_inventory: safeNumber(raw?.business_inventory),
    receivables: safeNumber(raw?.receivables),
    short_term_debts: safeNumber(raw?.short_term_debts),
    nisab_value: safeNumber(raw?.nisab_value),
  };
}

/**
 * Build {@link ZakatInput} from form values. Nisab is always derived from gold/silver price per gram
 * when both are positive; otherwise nisab is treated as unattainable until both rates are entered.
 * @param {Record<string, unknown>} raw
 * @param {{ gold_price_per_gram?: unknown; silver_price_per_gram?: unknown }} [options]
 * @returns {ZakatInput}
 */
export function buildZakatInput(raw, options = {}) {
  const base = formValuesToZakatInput(raw);
  const g = safeNumber(options.gold_price_per_gram ?? raw?.gold_price_per_gram);
  const s = safeNumber(options.silver_price_per_gram ?? raw?.silver_price_per_gram);
  if (g > 0 && s > 0) {
    base.nisab_value = computeNisabFromMetalPrices(g, s);
  } else {
    base.nisab_value = Number.MAX_SAFE_INTEGER;
  }
  return base;
}
