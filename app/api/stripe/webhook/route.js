import Stripe from "stripe";

export const dynamic = "force-dynamic";

async function updateFirestore(userId, data) {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${userId}?updateMask.fieldPaths=${Object.keys(data).join("&updateMask.fieldPaths=")}`;

  const fields = {};
  for (const [key, val] of Object.entries(data)) {
    if (val === null)       fields[key] = { nullValue: null };
    else if (val === true)  fields[key] = { booleanValue: true };
    else if (val === false) fields[key] = { booleanValue: false };
    else                    fields[key] = { stringValue: String(val) };
  }

  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Firestore update failed: ${res.status} ${text}`);
  }
}

export async function POST(req) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return new Response("Server not configured", { status: 500 });
  }
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const body = await req.text();
  const sig  = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature failed:", err.message);
    return new Response(`Webhook error: ${err.message}`, { status: 400 });
  }

  const obj = event.data.object;

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const userId = obj.metadata?.userId;
        if (!userId) break;
        if (!obj.subscription) break;
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
        if (!uid) break;
        if (obj.status === "active") {
          await updateFirestore(uid, {
            isPremium: true,
            premiumExpiry: new Date(obj.current_period_end * 1000).toISOString(),
          });
        } else if (["past_due","unpaid","paused","canceled"].includes(obj.status)) {
          await updateFirestore(uid, {
            isPremium: false,
            premiumExpiry: null,
          });
        }
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

      case "invoice.payment_failed": {
        const subId = obj.subscription;
        if (!subId) break;
        const sub = await stripe.subscriptions.retrieve(subId);
        const uid = sub.metadata?.userId;
        if (!uid) break;
        await updateFirestore(uid, { isPremium: false, premiumExpiry: null });
        break;
      }
    }
  } catch (err) {
    console.error(`Webhook handler error for ${event.type}:`, err.message);
  }

  return new Response("ok", { status: 200 });
}
