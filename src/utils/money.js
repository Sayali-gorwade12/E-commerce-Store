// Money calculation utilities to prevent floating-point rounding errors

const SHIPPING_FEE = 99.00;
const FREE_SHIPPING_THRESHOLD = 999.00;

function toPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

function toRupees(paise) {
  return Number((paise / 100).toFixed(2));
}

function calculateShipping(subtotalRupees) {
  const subtotalPaise = toPaise(subtotalRupees);
  const thresholdPaise = toPaise(FREE_SHIPPING_THRESHOLD);
  if (subtotalPaise >= thresholdPaise) {
    return 0;
  }
  return SHIPPING_FEE;
}

function formatINR(amount) {
  const num = Number(amount) || 0;
  return `₹${num.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}

module.exports = {
  SHIPPING_FEE,
  FREE_SHIPPING_THRESHOLD,
  toPaise,
  toRupees,
  calculateShipping,
  formatINR
};
