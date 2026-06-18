// Currency config — prices in local currency, country codes for auto-detection
// Price IDs are Stripe live mode prices — update these after creating new prices in Stripe dashboard

export const CURRENCIES = {
  // ── United States (default) ──────────────────────────────────
  DEFAULT: {
    symbol:"$", code:"USD", monthly:4.99, yearly:39.99,
    monthlyDisplay:"4.99", yearlyDisplay:"39.99",
    monthlyId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID,
    yearlyId:  process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID,
  },

  // ── Europe ───────────────────────────────────────────────────
  EUR: {
    symbol:"€", code:"EUR", monthly:4.49, yearly:35.99,
    monthlyDisplay:"4.49", yearlyDisplay:"35.99",
    monthlyId:"price_1TjozkC8OqGUQkNwlDU55Yz5",
    yearlyId: "price_1TjozkC8OqGUQkNwWa6trZT6",
  },

  // ── United Kingdom ───────────────────────────────────────────
  GBP: {
    symbol:"£", code:"GBP", monthly:3.99, yearly:31.99,
    monthlyDisplay:"3.99", yearlyDisplay:"31.99",
    monthlyId:"price_1TjozkC8OqGUQkNwp67pw6Ar",
    yearlyId: "price_1TjozlC8OqGUQkNwOb4SVFYW",
  },

  // ── Canada ───────────────────────────────────────────────────
  CAD: {
    symbol:"CA$", code:"CAD", monthly:6.99, yearly:55.99,
    monthlyDisplay:"6.99", yearlyDisplay:"55.99",
    monthlyId:"price_1TjozlC8OqGUQkNwLs7cKW4y",
    yearlyId: "price_1TjozlC8OqGUQkNwsBXScUoB",
  },

  // ── Australia ────────────────────────────────────────────────
  AUD: {
    symbol:"AU$", code:"AUD", monthly:7.49, yearly:59.99,
    monthlyDisplay:"7.49", yearlyDisplay:"59.99",
    monthlyId:"price_1TjozlC8OqGUQkNwWVoeohsp",
    yearlyId: "price_1TjozmC8OqGUQkNwXl1PNJxW",
  },

  // ── New Zealand ──────────────────────────────────────────────
  NZD: {
    symbol:"NZ$", code:"NZD", monthly:7.99, yearly:64.99,
    monthlyDisplay:"7.99", yearlyDisplay:"64.99",
    monthlyId:"price_1TjozmC8OqGUQkNwoV9Ij24Q",
    yearlyId: "price_1TjozmC8OqGUQkNwD77TgFIa",
  },

  // ── India ────────────────────────────────────────────────────
  INR: {
    symbol:"₹", code:"INR", monthly:399, yearly:3199,
    monthlyDisplay:"399", yearlyDisplay:"3,199",
    monthlyId:"price_1TjozmC8OqGUQkNwIhZrWwiY",
    yearlyId: "price_1TjoznC8OqGUQkNwXMds7CO7",
  },

  // ── Brazil ───────────────────────────────────────────────────
  BRL: {
    symbol:"R$", code:"BRL", monthly:27.90, yearly:219,
    monthlyDisplay:"27.90", yearlyDisplay:"219",
    monthlyId:"price_1TjoznC8OqGUQkNwHpDHrV8p",
    yearlyId: "price_1TjoznC8OqGUQkNwHcOHLzBH",
  },

  // ── Mexico ───────────────────────────────────────────────────
  MXN: {
    symbol:"MX$", code:"MXN", monthly:99, yearly:779,
    monthlyDisplay:"99", yearlyDisplay:"779",
    monthlyId:"price_1TjoznC8OqGUQkNwlGERkbyB",
    yearlyId: "price_1TjozoC8OqGUQkNwh7qi7C4y",
  },

  // ── Philippines ──────────────────────────────────────────────
  PHP: {
    symbol:"₱", code:"PHP", monthly:279, yearly:2199,
    monthlyDisplay:"279", yearlyDisplay:"2,199",
    monthlyId: process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID_PHP,
    yearlyId:  process.env.NEXT_PUBLIC_STRIPE_YEARLY_PRICE_ID_PHP,
  },

  // ── Singapore ────────────────────────────────────────────────
  SGD: {
    symbol:"S$", code:"SGD", monthly:6.49, yearly:51.99,
    monthlyDisplay:"6.49", yearlyDisplay:"51.99",
    monthlyId:"price_1TjozoC8OqGUQkNwbXqNwAWf",
    yearlyId: "price_1TjozoC8OqGUQkNwv1wYZM1N",
  },

  // ── Malaysia ─────────────────────────────────────────────────
  MYR: {
    symbol:"RM", code:"MYR", monthly:23.90, yearly:189,
    monthlyDisplay:"23.90", yearlyDisplay:"189",
    monthlyId:"price_1TjozoC8OqGUQkNwH0t7gJ4D",
    yearlyId: "price_1TjozpC8OqGUQkNw46616RTX",
  },

  // ── Indonesia ────────────────────────────────────────────────
  IDR: {
    symbol:"Rp", code:"IDR", monthly:82900, yearly:659000,
    monthlyDisplay:"82,900", yearlyDisplay:"659,000",
    monthlyId:"price_1TjozpC8OqGUQkNwLKUT7tcm",
    yearlyId: "price_1TjozpC8OqGUQkNwD2fFyA9R",
  },

  // ── Thailand ─────────────────────────────────────────────────
  THB: {
    symbol:"฿", code:"THB", monthly:179, yearly:1419,
    monthlyDisplay:"179", yearlyDisplay:"1,419",
    monthlyId:"price_1TjozpC8OqGUQkNwWqbKaA40",
    yearlyId: "price_1TjozqC8OqGUQkNw0cEDrHem",
  },

  // ── Japan ────────────────────────────────────────────────────
  JPY: {
    symbol:"¥", code:"JPY", monthly:750, yearly:5999,
    monthlyDisplay:"750", yearlyDisplay:"5,999",
    monthlyId:"price_1TjozqC8OqGUQkNweNfvDz7W",
    yearlyId: "price_1TjozqC8OqGUQkNwW2amplH0",
  },

  // ── South Korea ──────────────────────────────────────────────
  KRW: {
    symbol:"₩", code:"KRW", monthly:7200, yearly:54900,
    monthlyDisplay:"7,200", yearlyDisplay:"54,900",
    monthlyId:"price_1TjozqC8OqGUQkNwnng8d8u2",
    yearlyId: "price_1TjozqC8OqGUQkNwxjqD5rVM",
  },

  // ── Hong Kong ────────────────────────────────────────────────
  HKD: {
    symbol:"HK$", code:"HKD", monthly:38.99, yearly:311.99,
    monthlyDisplay:"38.99", yearlyDisplay:"311.99",
    monthlyId:"price_1TjozrC8OqGUQkNwjBXBBJOL",
    yearlyId: "price_1TjozrC8OqGUQkNwZNUUMRPC",
  },

  // ── UAE ──────────────────────────────────────────────────────
  AED: {
    symbol:"AED", code:"AED", monthly:18.99, yearly:144.99,
    monthlyDisplay:"18.99", yearlyDisplay:"144.99",
    monthlyId:"price_1TjozrC8OqGUQkNwqeEAIdQV",
    yearlyId: "price_1TjozrC8OqGUQkNwuEp6XQTM",
  },

  // ── South Africa ─────────────────────────────────────────────
  ZAR: {
    symbol:"R", code:"ZAR", monthly:93, yearly:749,
    monthlyDisplay:"93", yearlyDisplay:"749",
    monthlyId:"price_1TjozsC8OqGUQkNwHfv1PZK4",
    yearlyId: "price_1TjozsC8OqGUQkNwuqUUwbqF",
  },

  // ── Nigeria ──────────────────────────────────────────────────
  NGN: {
    symbol:"₦", code:"NGN", monthly:8200, yearly:65900,
    monthlyDisplay:"8,200", yearlyDisplay:"65,900",
    monthlyId:"price_1TjozsC8OqGUQkNwFYTpxFtY",
    yearlyId: "price_1TjozsC8OqGUQkNwSXqnuzeH",
  },

  // ── Switzerland ──────────────────────────────────────────────
  CHF: {
    symbol:"CHF", code:"CHF", monthly:4.49, yearly:35.99,
    monthlyDisplay:"4.49", yearlyDisplay:"35.99",
    monthlyId:"price_1TjoztC8OqGUQkNw6qQyOE6i",
    yearlyId: "price_1TjoztC8OqGUQkNwpwerHOBO",
  },

  // ── Norway ───────────────────────────────────────────────────
  NOK: {
    symbol:"kr", code:"NOK", monthly:54.99, yearly:444.99,
    monthlyDisplay:"54.99", yearlyDisplay:"444.99",
    monthlyId:"price_1TjoztC8OqGUQkNwoNMENzFf",
    yearlyId: "price_1TjoztC8OqGUQkNwifrRJaMh",
  },

  // ── Sweden ───────────────────────────────────────────────────
  SEK: {
    symbol:"kr", code:"SEK", monthly:54.99, yearly:444.99,
    monthlyDisplay:"54.99", yearlyDisplay:"444.99",
    monthlyId:"price_1TjozuC8OqGUQkNwi09W5uLp",
    yearlyId: "price_1TjozuC8OqGUQkNwJpsDjrVY",
  },

  // ── Denmark ──────────────────────────────────────────────────
  DKK: {
    symbol:"kr", code:"DKK", monthly:34.99, yearly:279.99,
    monthlyDisplay:"34.99", yearlyDisplay:"279.99",
    monthlyId:"price_1TjozuC8OqGUQkNwvXcWpE3e",
    yearlyId: "price_1TjozuC8OqGUQkNwDe3Kx4ZU",
  },

  // ── Taiwan ───────────────────────────────────────────────────
  TWD: {
    symbol:"NT$", code:"TWD", monthly:155, yearly:1249,
    monthlyDisplay:"155", yearlyDisplay:"1,249",
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
