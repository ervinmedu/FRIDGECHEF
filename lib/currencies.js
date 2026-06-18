// Currency config — prices in local currency, country codes for auto-detection
// Price IDs are Stripe live mode prices

export const CURRENCIES = {
  // ── United States (default) ──────────────────────────────────
  DEFAULT: {
    symbol:"$", code:"USD", monthly:8.99, yearly:71.99,
    monthlyDisplay:"8.99", yearlyDisplay:"71.99",
    monthlyId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
    yearlyId:  process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID,
  },

  // ── Europe ───────────────────────────────────────────────────
  EUR: {
    symbol:"€", code:"EUR", monthly:8.49, yearly:67.99,
    monthlyDisplay:"8.49", yearlyDisplay:"67.99",
    monthlyId:"price_1TjozkC8OqGUQkNwlDU55Yz5",
    yearlyId: "price_1TjozkC8OqGUQkNwWa6trZT6",
  },

  // ── United Kingdom ───────────────────────────────────────────
  GBP: {
    symbol:"£", code:"GBP", monthly:7.49, yearly:59.99,
    monthlyDisplay:"7.49", yearlyDisplay:"59.99",
    monthlyId:"price_1TjozkC8OqGUQkNwp67pw6Ar",
    yearlyId: "price_1TjozlC8OqGUQkNwOb4SVFYW",
  },

  // ── Canada ───────────────────────────────────────────────────
  CAD: {
    symbol:"CA$", code:"CAD", monthly:12.99, yearly:99.99,
    monthlyDisplay:"12.99", yearlyDisplay:"99.99",
    monthlyId:"price_1TjozlC8OqGUQkNwLs7cKW4y",
    yearlyId: "price_1TjozlC8OqGUQkNwsBXScUoB",
  },

  // ── Australia ────────────────────────────────────────────────
  AUD: {
    symbol:"AU$", code:"AUD", monthly:13.99, yearly:109.99,
    monthlyDisplay:"13.99", yearlyDisplay:"109.99",
    monthlyId:"price_1TjozlC8OqGUQkNwWVoeohsp",
    yearlyId: "price_1TjozmC8OqGUQkNwXl1PNJxW",
  },

  // ── New Zealand ──────────────────────────────────────────────
  NZD: {
    symbol:"NZ$", code:"NZD", monthly:14.99, yearly:119.99,
    monthlyDisplay:"14.99", yearlyDisplay:"119.99",
    monthlyId:"price_1TjozmC8OqGUQkNwoV9Ij24Q",
    yearlyId: "price_1TjozmC8OqGUQkNwD77TgFIa",
  },

  // ── India ────────────────────────────────────────────────────
  INR: {
    symbol:"₹", code:"INR", monthly:749, yearly:5999,
    monthlyDisplay:"749", yearlyDisplay:"5,999",
    monthlyId:"price_1TjozmC8OqGUQkNwIhZrWwiY",
    yearlyId: "price_1TjoznC8OqGUQkNwXMds7CO7",
  },

  // ── Brazil ───────────────────────────────────────────────────
  BRL: {
    symbol:"R$", code:"BRL", monthly:49.90, yearly:399,
    monthlyDisplay:"49.90", yearlyDisplay:"399",
    monthlyId:"price_1TjoznC8OqGUQkNwHpDHrV8p",
    yearlyId: "price_1TjoznC8OqGUQkNwHcOHLzBH",
  },

  // ── Mexico ───────────────────────────────────────────────────
  MXN: {
    symbol:"MX$", code:"MXN", monthly:179, yearly:1399,
    monthlyDisplay:"179", yearlyDisplay:"1,399",
    monthlyId:"price_1TjoznC8OqGUQkNwlGERkbyB",
    yearlyId: "price_1TjozoC8OqGUQkNwh7qi7C4y",
  },

  // ── Philippines ──────────────────────────────────────────────
  PHP: {
    symbol:"₱", code:"PHP", monthly:499, yearly:3999,
    monthlyDisplay:"499", yearlyDisplay:"3,999",
    monthlyId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID_PHP,
    yearlyId:  process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID_PHP,
  },

  // ── Singapore ────────────────────────────────────────────────
  SGD: {
    symbol:"S$", code:"SGD", monthly:11.99, yearly:95.99,
    monthlyDisplay:"11.99", yearlyDisplay:"95.99",
    monthlyId:"price_1TjozoC8OqGUQkNwbXqNwAWf",
    yearlyId: "price_1TjozoC8OqGUQkNwv1wYZM1N",
  },

  // ── Malaysia ─────────────────────────────────────────────────
  MYR: {
    symbol:"RM", code:"MYR", monthly:42.90, yearly:339,
    monthlyDisplay:"42.90", yearlyDisplay:"339",
    monthlyId:"price_1TjozoC8OqGUQkNwH0t7gJ4D",
    yearlyId: "price_1TjozpC8OqGUQkNw46616RTX",
  },

  // ── Indonesia ────────────────────────────────────────────────
  IDR: {
    symbol:"Rp", code:"IDR", monthly:149000, yearly:1190000,
    monthlyDisplay:"149,000", yearlyDisplay:"1,190,000",
    monthlyId:"price_1TjozpC8OqGUQkNwLKUT7tcm",
    yearlyId: "price_1TjozpC8OqGUQkNwD2fFyA9R",
  },

  // ── Thailand ─────────────────────────────────────────────────
  THB: {
    symbol:"฿", code:"THB", monthly:319, yearly:2549,
    monthlyDisplay:"319", yearlyDisplay:"2,549",
    monthlyId:"price_1TjozpC8OqGUQkNwWqbKaA40",
    yearlyId: "price_1TjozqC8OqGUQkNw0cEDrHem",
  },

  // ── Japan ────────────────────────────────────────────────────
  JPY: {
    symbol:"¥", code:"JPY", monthly:1350, yearly:10800,
    monthlyDisplay:"1,350", yearlyDisplay:"10,800",
    monthlyId:"price_1TjozqC8OqGUQkNweNfvDz7W",
    yearlyId: "price_1TjozqC8OqGUQkNwW2amplH0",
  },

  // ── South Korea ──────────────────────────────────────────────
  KRW: {
    symbol:"₩", code:"KRW", monthly:12900, yearly:99000,
    monthlyDisplay:"12,900", yearlyDisplay:"99,000",
    monthlyId:"price_1TjozqC8OqGUQkNwnng8d8u2",
    yearlyId: "price_1TjozqC8OqGUQkNwxjqD5rVM",
  },

  // ── Hong Kong ────────────────────────────────────────────────
  HKD: {
    symbol:"HK$", code:"HKD", monthly:69.99, yearly:559.99,
    monthlyDisplay:"69.99", yearlyDisplay:"559.99",
    monthlyId:"price_1TjozrC8OqGUQkNwjBXBBJOL",
    yearlyId: "price_1TjozrC8OqGUQkNwZNUUMRPC",
  },

  // ── UAE ──────────────────────────────────────────────────────
  AED: {
    symbol:"AED", code:"AED", monthly:32.99, yearly:259.99,
    monthlyDisplay:"32.99", yearlyDisplay:"259.99",
    monthlyId:"price_1TjozrC8OqGUQkNwqeEAIdQV",
    yearlyId: "price_1TjozrC8OqGUQkNwuEp6XQTM",
  },

  // ── South Africa ─────────────────────────────────────────────
  ZAR: {
    symbol:"R", code:"ZAR", monthly:169, yearly:1349,
    monthlyDisplay:"169", yearlyDisplay:"1,349",
    monthlyId:"price_1TjozsC8OqGUQkNwHfv1PZK4",
    yearlyId: "price_1TjozsC8OqGUQkNwuqUUwbqF",
  },

  // ── Nigeria ──────────────────────────────────────────────────
  NGN: {
    symbol:"₦", code:"NGN", monthly:14900, yearly:119000,
    monthlyDisplay:"14,900", yearlyDisplay:"119,000",
    monthlyId:"price_1TjozsC8OqGUQkNwFYTpxFtY",
    yearlyId: "price_1TjozsC8OqGUQkNwSXqnuzeH",
  },

  // ── Switzerland ──────────────────────────────────────────────
  CHF: {
    symbol:"CHF", code:"CHF", monthly:8.49, yearly:67.99,
    monthlyDisplay:"8.49", yearlyDisplay:"67.99",
    monthlyId:"price_1TjoztC8OqGUQkNw6qQyOE6i",
    yearlyId: "price_1TjoztC8OqGUQkNwpwerHOBO",
  },

  // ── Norway ───────────────────────────────────────────────────
  NOK: {
    symbol:"kr", code:"NOK", monthly:99.99, yearly:799.99,
    monthlyDisplay:"99.99", yearlyDisplay:"799.99",
    monthlyId:"price_1TjoztC8OqGUQkNwoNMENzFf",
    yearlyId: "price_1TjoztC8OqGUQkNwifrRJaMh",
  },

  // ── Sweden ───────────────────────────────────────────────────
  SEK: {
    symbol:"kr", code:"SEK", monthly:99.99, yearly:799.99,
    monthlyDisplay:"99.99", yearlyDisplay:"799.99",
    monthlyId:"price_1TjozuC8OqGUQkNwi09W5uLp",
    yearlyId: "price_1TjozuC8OqGUQkNwJpsDjrVY",
  },

  // ── Denmark ──────────────────────────────────────────────────
  DKK: {
    symbol:"kr", code:"DKK", monthly:62.99, yearly:509.99,
    monthlyDisplay:"62.99", yearlyDisplay:"509.99",
    monthlyId:"price_1TjozuC8OqGUQkNwvXcWpE3e",
    yearlyId: "price_1TjozuC8OqGUQkNwDe3Kx4ZU",
  },

  // ── Taiwan ───────────────────────────────────────────────────
  TWD: {
    symbol:"NT$", code:"TWD", monthly:279, yearly:2239,
    monthlyDisplay:"279", yearlyDisplay:"2,239",
    monthlyId:"price_1TjozuC8OqGUQkNwAsMDg7p0",
    yearlyId: "price_1TjozvC8OqGUQkNw6EnwRoB6",
  },
};

// Country code → currency key
export const COUNTRY_MAP = {
  // Eurozone
  DE:"EUR", FR:"EUR", IT:"EUR", ES:"EUR", NL:"EUR", BE:"EUR",
  AT:"EUR", PT:"EUR", IE:"EUR", FI:"EUR", GR:"EUR", LU:"EUR",
  SK:"EUR", SI:"EUR", EE:"EUR", LV:"EUR", LT:"EUR", MT:"EUR", CY:"EUR",

  // Others
  GB:"GBP",
  CA:"CAD",
  AU:"AUD",
  NZ:"NZD",
  IN:"INR",
  BR:"BRL",
  MX:"MXN",
  PH:"PHP",
  SG:"SGD",
  MY:"MYR",
  ID:"IDR",
  TH:"THB",
  JP:"JPY",
  KR:"KRW",
  HK:"HKD",
  AE:"AED",
  ZA:"ZAR",
  NG:"NGN",
  CH:"CHF",
  NO:"NOK",
  SE:"SEK",
  DK:"DKK",
  TW:"TWD",
};

export function getCurrencyForCountry(countryCode) {
  const key = COUNTRY_MAP[countryCode];
  return key ? CURRENCIES[key] : CURRENCIES.DEFAULT;
}
