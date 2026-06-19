import Stripe from "stripe";

const PRODUCT = "prod_UjHIijirQxHXWd";

// New price IDs to KEEP — everything else gets archived
const KEEP = new Set([
  "price_1TjpqxC8OqGUQkNwFNSz3O5K","price_1TjpqxC8OqGUQkNwqqXylzY9",
  "price_1TjpqyC8OqGUQkNwewNh6Tzm","price_1TjpqyC8OqGUQkNwiVWKOHxp",
  "price_1TjpqyC8OqGUQkNwvOzMjfCQ","price_1TjpqyC8OqGUQkNw13gihaee",
  "price_1TjpqyC8OqGUQkNwfbZcpeUb","price_1TjpqyC8OqGUQkNwxzOqEumk",
  "price_1TjpqyC8OqGUQkNwYHUi4fsf","price_1TjpqyC8OqGUQkNwSlBSAj5p",
  "price_1TjpqyC8OqGUQkNwsko4akI2","price_1TjpqyC8OqGUQkNw63Ek9e0w",
  "price_1TjpqyC8OqGUQkNwqX4G4JzJ","price_1TjpqyC8OqGUQkNw7Qcn6SYz",
  "price_1TjpqyC8OqGUQkNwFljd5V6F","price_1TjpqyC8OqGUQkNwqhHMd4f5",
  "price_1TjpqzC8OqGUQkNw08dvjFWh","price_1TjpqzC8OqGUQkNw5zAGTavl",
  "price_1TjpqzC8OqGUQkNwXIw4e3Q2","price_1TjpqzC8OqGUQkNwRt0qJlyx",
  "price_1TjpqzC8OqGUQkNwMIxbWNWU","price_1TjpqzC8OqGUQkNwtwEuubyJ",
  "price_1TjpqzC8OqGUQkNwRCjfsh8L","price_1TjpqzC8OqGUQkNw6cFLEKAT",
  "price_1TjpqzC8OqGUQkNwczkQBWac","price_1TjpqzC8OqGUQkNwjcNFN8EN",
  "price_1TjpqzC8OqGUQkNwTJaFIGP2","price_1TjpqzC8OqGUQkNwzMFOwoTe",
  "price_1TjpqzC8OqGUQkNwX5uXTSI5","price_1TjpqzC8OqGUQkNwkTTPemMa",
  "price_1Tjpr0C8OqGUQkNwkDhXzqS5","price_1Tjpr0C8OqGUQkNwZtIzKm4J",
  "price_1Tjpr0C8OqGUQkNwsB5HJGDO","price_1Tjpr0C8OqGUQkNwY3xEUZto",
  "price_1Tjpr0C8OqGUQkNwNYH8g5ug","price_1Tjpr0C8OqGUQkNwXWYi1KBv",
  "price_1Tjpr0C8OqGUQkNwaZ7RNlc3","price_1Tjpr0C8OqGUQkNwCUKA9aHW",
  "price_1Tjpr0C8OqGUQkNw57nrrvkd","price_1Tjpr0C8OqGUQkNwN3XNRLlf",
  "price_1Tjpr0C8OqGUQkNwyGG8DZcf","price_1Tjpr0C8OqGUQkNw59Bbxg8L",
  "price_1Tjpr0C8OqGUQkNw0b6wN1a8","price_1Tjpr0C8OqGUQkNwapuk4ViL",
  "price_1Tjpr0C8OqGUQkNwTX54WgfF","price_1Tjpr0C8OqGUQkNwQKMIxLMN",
  "price_1Tjpr1C8OqGUQkNwkws7eE0m","price_1Tjpr1C8OqGUQkNwMNvGkg8Y",
  "price_1Tjpr1C8OqGUQkNw5T9tok6S","price_1Tjpr1C8OqGUQkNwFb2sHeBU",
]);

export async function GET(req) {
  const sk = new URL(req.url).searchParams.get("sk");
  if (!sk || !sk.startsWith("sk_live_")) {
    return Response.json({ error: "Missing or invalid sk param" }, { status: 400 });
  }

  const stripe = new Stripe(sk);
  const archived = [];
  const skipped = [];

  // Fetch all active prices for this product
  const prices = await stripe.prices.list({ product: PRODUCT, active: true, limit: 100 });

  for (const price of prices.data) {
    if (KEEP.has(price.id)) {
      skipped.push(price.id);
    } else {
      await stripe.prices.update(price.id, { active: false });
      archived.push(price.id);
    }
  }

  // Also set the product's default price to the new USD monthly price
  await stripe.products.update(PRODUCT, {
    default_price: "price_1TjpqxC8OqGUQkNwFNSz3O5K",
  });

  return Response.json({ archived, kept: skipped, defaultPriceUpdated: true });
}
