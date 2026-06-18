import Stripe from "stripe";

export const dynamic = "force-dynamic";

// Update Firestore via REST API (avoids Firebase client SDK on server)
async function updateFirestore(userId, data) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?updateMask.fieldPaths=${Object.keys(data).join("&updateMask.fieldPaths=")}`;

  const fields = {};
  for (const [key, val] of Object.entries(data)) {
    if (val === null)        fields[key] = { nullValue: null };
    else if (val === true)   fields[key] = { booleanValue: true };
    else if (val === false)  fields[key] = { booleanValue: false };
    else                     fields[key] = { stringValue: String(val) };
  }

  await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
}

export async function POST(req) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  const obj = event.data.object;
  const userId = obj.metadata?.userId;

  switch (event.type) {
    case "checkout.session.completed": {
      if (!userId) break;
      const sub = await stripe.subscriptions.retrieve(obj.subscription);
      await updateFirestore(userId, {
        isPremium: true,
        premiumSince: new Date().toISOString(),
        stripeCustomerId: obj.customer,
        stripeSubscriptionId: obj.subscription,
        premiumExpiry: new Date(sub.current_period_end * 1000).toISOString(),
      });
      break;
    }

    case "customer.subscription.updated": {
      const uid = obj.metadata?.userId;
      if (!uid || obj.status !== "active") break;
      await updateFirestore(uid, {
        isPremium: true,
        premiumExpiry: new Date(obj.current_period_end * 1000).toISOString(),
      });
      break;
    }

    case "customer.subscription.deleted": {
      const uid = obj.metadata?.userId;
      if (!uid) break;
      await updateFirestore(uid, {
        isPremium: false,
        premiumExpiry: null,
        stripeSubscriptionId: null,
      });
      break;
    }
  }

  return new Response("ok", { status: 200 });
}
