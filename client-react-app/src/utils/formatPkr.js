/**
 * Strip trailing zeros from the fractional part of a locale-formatted number string
 * (decimal assumed to be `.`, as with en-PK for amounts).
 * e.g. "1,234.50" → "1,234.5", "1,234.00" → "1,234"
 */
function stripTrailingZerosFromFormattedAmount(formatted) {
  if (!formatted || typeof formatted !== "string") return formatted;
  const lastDot = formatted.lastIndexOf(".");
  if (lastDot === -1) return formatted;
  const intPart = formatted.slice(0, lastDot);
  const frac = formatted.slice(lastDot + 1).replace(/0+$/, "");
  return frac === "" ? intPart : `${intPart}.${frac}`;
}

/**
 * Display amounts in Pakistani Rupees (no unnecessary trailing zeros).
 */
export function formatPkr(amount) {
  if (amount == null || Number.isNaN(Number(amount))) {
    return "PKR 0";
  }
  const n = Math.round(Number(amount) * 100) / 100;
  const formatted = new Intl.NumberFormat("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
  return `PKR ${stripTrailingZerosFromFormattedAmount(formatted)}`;
}

/**
 * Value string for number inputs after blur — no trailing zeros (e.g. 100 not 100.00).
 */
export function formatNumericInputString(n) {
  if (n == null || Number.isNaN(Number(n))) return "";
  const num = Math.round(Number(n) * 100) / 100;
  const s = num.toFixed(2);
  const lastDot = s.lastIndexOf(".");
  if (lastDot === -1) return s;
  const intPart = s.slice(0, lastDot);
  const frac = s.slice(lastDot + 1).replace(/0+$/, "");
  return frac === "" ? intPart : `${intPart}.${frac}`;
}

/**
 * Integer-only fields (e.g. family size).
 */
export function formatIntegerInputString(n) {
  if (n == null || Number.isNaN(Number(n))) return "";
  return String(Math.round(Number(n)));
}

/**
 * Percent display without trailing .0 (e.g. 100% not 100.0%).
 */
export function formatPercentDisplay(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "0";
  const rounded = Math.round(n * 10) / 10;
  const s = rounded.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
}
