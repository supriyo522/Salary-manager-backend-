// Static, approximate rates to USD. Deliberately not live: deterministic + testable.
const COUNTRIES = {
  US: { name: 'United States', currency: 'USD' },
  IN: { name: 'India', currency: 'INR' },
  GB: { name: 'United Kingdom', currency: 'GBP' },
  DE: { name: 'Germany', currency: 'EUR' },
  CA: { name: 'Canada', currency: 'CAD' },
  AU: { name: 'Australia', currency: 'AUD' },
};
const USD_RATES = { USD: 1, INR: 0.012, GBP: 1.27, EUR: 1.08, CAD: 0.74, AUD: 0.66 };

const toUsd = (amount, currency) => {
  if (!(currency in USD_RATES)) throw new Error(`Unknown currency: ${currency}`);
  return Math.round(amount * USD_RATES[currency]);
};

module.exports = { COUNTRIES, USD_RATES, toUsd };
