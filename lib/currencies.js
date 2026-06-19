// Currency config — prices in local currency, country codes for auto-detection
// Price IDs are Stripe live mode prices

export const CURRENCIES = {
  // ── United States (default) ──────────────────────────────────
  DEFAULT: {
    symbol:"$", code:"USD", monthly:4.99, yearly:39.99,
    monthlyDisplay:"4.99", yearlyDisplay:"39.99",
    monthlyId:"price_1TjpqxC8OqGUQkNwFNSz3O5K",
    yearlyId: "price_1TjpqxC8OqGUQkNwqqXylzY9",
  },

  // ── Europe ───────────────────────────────────────────────────
  EUR: {
    symbol:"€", code:"EUR", monthly:4.49, yearly:35.99,
    monthlyDisplay:"4.49", yearlyDisplay:"35.99",
    monthlyId:"price_1TjpqyC8OqGUQkNwewNh6Tzm",
    yearlyId: "price_1TjpqyC8OqGUQkNwiVWKOHxp",
  },

  // ── United Kingdom ───────────────────────────────────────────
  GBP: {
    symbol:"£", code:"GBP", monthly:3.99, yearly:31.99,
    monthlyDisplay:"3.99", yearlyDisplay:"31.99",
    monthlyId:"price_1TjpqyC8OqGUQkNwvOzMjfCQ",
    yearlyId: "price_1TjpqyC8OqGUQkNw13gihaee",
  },

  // ── Canada ───────────────────────────────────────────────────
  CAD: {
    symbol:"CA$", code:"CAD", monthly:6.99, yearly:55.99,
    monthlyDisplay:"6.99", yearlyDisplay:"55.99",
    monthlyId:"price_1TjpqyC8OqGUQkNwfbZcpeUb",
    yearlyId: "price_1TjpqyC8OqGUQkNwxzOqEumk",
  },

  // ── Australia ────────────────────────────────────────────────
  AUD: {
    symbol:"AU$", code:"AUD", monthly:7.49, yearly:59.99,
    monthlyDisplay:"7.49", yearlyDisplay:"59.99",
    monthlyId:"price_1TjpqyC8OqGUQkNwYHUi4fsf",
    yearlyId: "price_1TjpqyC8OqGUQkNwSlBSAj5p",
  },

  // ── New Zealand ──────────────────────────────────────────────
  NZD: {
    symbol:"NZ$", code:"NZD", monthly:7.99, yearly:64.99,
    monthlyDisplay:"7.99", yearlyDisplay:"64.99",
    monthlyId:"price_1TjpqyC8OqGUQkNwsko4akI2",
    yearlyId: "price_1TjpqyC8OqGUQkNw63Ek9e0w",
  },

  // ── India ────────────────────────────────────────────────────
  INR: {
    symbol:"₹", code:"INR", monthly:399, yearly:3199,
    monthlyDisplay:"399", yearlyDisplay:"3,199",
    monthlyId:"price_1TjpqyC8OqGUQkNwqX4G4JzJ",
    yearlyId: "price_1TjpqyC8OqGUQkNw7Qcn6SYz",
  },

  // ── Brazil ───────────────────────────────────────────────────
  BRL: {
    symbol:"R$", code:"BRL", monthly:27.90, yearly:219,
    monthlyDisplay:"27.90", yearlyDisplay:"219",
    monthlyId:"price_1TjpqyC8OqGUQkNwFljd5V6F",
    yearlyId: "price_1TjpqyC8OqGUQkNwqhHMd4f5",
  },

  // ── Mexico ───────────────────────────────────────────────────
  MXN: {
    symbol:"MX$", code:"MXN", monthly:99, yearly:779,
    monthlyDisplay:"99", yearlyDisplay:"779",
    monthlyId:"price_1TjpqzC8OqGUQkNw08dvjFWh",
    yearlyId: "price_1TjpqzC8OqGUQkNw5zAGTavl",
  },

  // ── Philippines ──────────────────────────────────────────────
  PHP: {
    symbol:"₱", code:"PHP", monthly:279, yearly:2199,
    monthlyDisplay:"279", yearlyDisplay:"2,199",
    monthlyId:"price_1TjpqzC8OqGUQkNwXIw4e3Q2",
    yearlyId: "price_1TjpqzC8OqGUQkNwRt0qJlyx",
  },

  // ── Singapore ────────────────────────────────────────────────
  SGD: {
    symbol:"S$", code:"SGD", monthly:6.49, yearly:51.99,
    monthlyDisplay:"6.49", yearlyDisplay:"51.99",
    monthlyId:"price_1TjpqzC8OqGUQkNwMIxbWNWU",
    yearlyId: "price_1TjpqzC8OqGUQkNwtwEuubyJ",
  },

  // ── Malaysia ─────────────────────────────────────────────────
  MYR: {
    symbol:"RM", code:"MYR", monthly:23.90, yearly:189,
    monthlyDisplay:"23.90", yearlyDisplay:"189",
    monthlyId:"price_1TjpqzC8OqGUQkNwRCjfsh8L",
    yearlyId: "price_1TjpqzC8OqGUQkNw6cFLEKAT",
  },

  // ── Indonesia ────────────────────────────────────────────────
  IDR: {
    symbol:"Rp", code:"IDR", monthly:82900, yearly:659000,
    monthlyDisplay:"82,900", yearlyDisplay:"659,000",
    monthlyId:"price_1TjpqzC8OqGUQkNwczkQBWac",
    yearlyId: "price_1TjpqzC8OqGUQkNwjcNFN8EN",
  },

  // ── Thailand ─────────────────────────────────────────────────
  THB: {
    symbol:"฿", code:"THB", monthly:179, yearly:1419,
    monthlyDisplay:"179", yearlyDisplay:"1,419",
    monthlyId:"price_1TjpqzC8OqGUQkNwTJaFIGP2",
    yearlyId: "price_1TjpqzC8OqGUQkNwzMFOwoTe",
  },

  // ── Japan ────────────────────────────────────────────────────
  JPY: {
    symbol:"¥", code:"JPY", monthly:750, yearly:5999,
    monthlyDisplay:"750", yearlyDisplay:"5,999",
    monthlyId:"price_1TjpqzC8OqGUQkNwX5uXTSI5",
    yearlyId: "price_1TjpqzC8OqGUQkNwkTTPemMa",
  },

  // ── South Korea ──────────────────────────────────────────────
  KRW: {
    symbol:"₩", code:"KRW", monthly:7200, yearly:54900,
    monthlyDisplay:"7,200", yearlyDisplay:"54,900",
    monthlyId:"price_1Tjpr0C8OqGUQkNwkDhXzqS5",
    yearlyId: "price_1Tjpr0C8OqGUQkNwZtIzKm4J",
  },

  // ── Hong Kong ────────────────────────────────────────────────
  HKD: {
    symbol:"HK$", code:"HKD", monthly:38.99, yearly:311.99,
    monthlyDisplay:"38.99", yearlyDisplay:"311.99",
    monthlyId:"price_1Tjpr0C8OqGUQkNwsB5HJGDO",
    yearlyId: "price_1Tjpr0C8OqGUQkNwY3xEUZto",
  },

  // ── UAE ──────────────────────────────────────────────────────
  AED: {
    symbol:"AED", code:"AED", monthly:18.99, yearly:144.99,
    monthlyDisplay:"18.99", yearlyDisplay:"144.99",
    monthlyId:"price_1Tjpr0C8OqGUQkNwNYH8g5ug",
    yearlyId: "price_1Tjpr0C8OqGUQkNwXWYi1KBv",
  },

  // ── South Africa ─────────────────────────────────────────────
  ZAR: {
    symbol:"R", code:"ZAR", monthly:93, yearly:749,
    monthlyDisplay:"93", yearlyDisplay:"749",
    monthlyId:"price_1Tjpr0C8OqGUQkNwaZ7RNlc3",
    yearlyId: "price_1Tjpr0C8OqGUQkNwCUKA9aHW",
  },

  // ── Nigeria ──────────────────────────────────────────────────
  NGN: {
    symbol:"₦", code:"NGN", monthly:8200, yearly:65900,
    monthlyDisplay:"8,200", yearlyDisplay:"65,900",
    monthlyId:"price_1Tjpr0C8OqGUQkNw57nrrvkd",
    yearlyId: "price_1Tjpr0C8OqGUQkNwN3XNRLlf",
  },

  // ── Switzerland ──────────────────────────────────────────────
  CHF: {
    symbol:"CHF", code:"CHF", monthly:4.49, yearly:35.99,
    monthlyDisplay:"4.49", yearlyDisplay:"35.99",
    monthlyId:"price_1Tjpr0C8OqGUQkNwyGG8DZcf",
    yearlyId: "price_1Tjpr0C8OqGUQkNw59Bbxg8L",
  },

  // ── Norway ───────────────────────────────────────────────────
  NOK: {
    symbol:"kr", code:"NOK", monthly:54.99, yearly:444.99,
    monthlyDisplay:"54.99", yearlyDisplay:"444.99",
    monthlyId:"price_1Tjpr0C8OqGUQkNw0b6wN1a8",
    yearlyId: "price_1Tjpr0C8OqGUQkNwapuk4ViL",
  },

  // ── Sweden ───────────────────────────────────────────────────
  SEK: {
    symbol:"kr", code:"SEK", monthly:54.99, yearly:444.99,
    monthlyDisplay:"54.99", yearlyDisplay:"444.99",
    monthlyId:"price_1Tjpr0C8OqGUQkNwTX54WgfF",
    yearlyId: "price_1Tjpr0C8OqGUQkNwQKMIxLMN",
  },

  // ── Denmark ──────────────────────────────────────────────────
  DKK: {
    symbol:"kr", code:"DKK", monthly:34.99, yearly:279.99,
    monthlyDisplay:"34.99", yearlyDisplay:"279.99",
    monthlyId:"price_1Tjpr1C8OqGUQkNwkws7eE0m",
    yearlyId: "price_1Tjpr1C8OqGUQkNwMNvGkg8Y",
  },

  // ── Taiwan ───────────────────────────────────────────────────
  TWD: {
    symbol:"NT$", code:"TWD", monthly:155, yearly:1249,
    monthlyDisplay:"155", yearlyDisplay:"1,249",
    monthlyId:"price_1Tjpr1C8OqGUQkNw5T9tok6S",
    yearlyId: "price_1Tjpr1C8OqGUQkNwFb2sHeBU",
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
