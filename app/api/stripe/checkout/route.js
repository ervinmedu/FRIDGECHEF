import Stripe from "stripe";

export const dynamic = "force-dynamic";

export async function POST(req) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.json({ error: "Server not configured" }, { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const { priceId, userId, userEmail } = await req.json();
    if (!priceId || !userId) {
      return Response.json({ error: "Missing priceId or userId" }, { status: 400 });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || "https://fridgechef-sable-alpha.vercel.app";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: userEmail || undefined,
      metadata: { userId },
      subscription_data: {
        metadata: { userId },
        trial_period_days: 7,
      },
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
