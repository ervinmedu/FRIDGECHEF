export const dynamic = "force-dynamic";

const TRIAL_DAYS = 7;
const FROM = "FridgeChef <onboarding@resend.dev>";

function daysSinceTrialStart(trialStartDate) {
  const start = new Date(trialStartDate);
  const now = new Date();
  return Math.floor((now - start) / 86400000);
}

function email2DaysLeft(userEmail) {
  return {
    from: FROM,
    to: userEmail,
    subject: "⏰ Your FridgeChef free trial ends in 2 days",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FDF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

    <div style="background:#3E1F00;padding:32px 24px;text-align:center">
      <div style="font-size:36px;margin-bottom:8px">🍳</div>
      <div style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px">FridgeChef</div>
      <div style="color:rgba(255,255,255,0.6);font-size:13px;margin-top:4px">Cook smart with what you have</div>
    </div>

    <div style="padding:32px 24px">
      <div style="background:#FFF3E0;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center">
        <div style="font-size:28px;margin-bottom:4px">⏰</div>
        <div style="font-size:16px;font-weight:700;color:#E65100">2 days left on your free trial</div>
      </div>

      <p style="color:#3E1F00;font-size:15px;line-height:1.6;margin:0 0 16px">
        Hey there! Just a heads up — your FridgeChef free trial ends in <strong>2 days</strong>.
      </p>
      <p style="color:#5D4037;font-size:14px;line-height:1.6;margin:0 0 24px">
        After your trial, these premium features will be locked:
      </p>

      <div style="margin-bottom:24px">
        <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#FDF6F0;border-radius:10px;margin-bottom:8px">
          <span style="font-size:20px">🎤</span>
          <div>
            <div style="font-size:13px;font-weight:700;color:#3E1F00">Voice ingredient capture</div>
            <div style="font-size:12px;color:#8D6E63">Just say your ingredients out loud</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#FDF6F0;border-radius:10px;margin-bottom:8px">
          <span style="font-size:20px">📷</span>
          <div>
            <div style="font-size:13px;font-weight:700;color:#3E1F00">Photo scan</div>
            <div style="font-size:12px;color:#8D6E63">Scan your fridge to detect ingredients</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;background:#FDF6F0;border-radius:10px">
          <span style="font-size:20px">🥗</span>
          <div>
            <div style="font-size:13px;font-weight:700;color:#3E1F00">Nutrition & macros</div>
            <div style="font-size:12px;color:#8D6E63">Calories, protein, carbs & fat per recipe</div>
          </div>
        </div>
      </div>

      <a href="https://fridgechef-sable-alpha.vercel.app" style="display:block;background:#C25E2A;color:#fff;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:0.3px;margin-bottom:16px">
        👑 Upgrade to Premium — Keep Everything
      </a>

      <p style="color:#BCAAA4;font-size:12px;text-align:center;margin:0">
        Questions? Reply to this email and we'll help you out.
      </p>
    </div>

    <div style="background:#FDF6F0;padding:16px 24px;text-align:center">
      <p style="color:#BCAAA4;font-size:11px;margin:0">
        You're receiving this because you signed up for FridgeChef.<br>
        <a href="https://fridgechef-sable-alpha.vercel.app" style="color:#C25E2A">Visit FridgeChef</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}

function emailLastDay(userEmail) {
  return {
    from: FROM,
    to: userEmail,
    subject: "🚨 Last day of your FridgeChef free trial",
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FDF6F0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08)">

    <div style="background:#B71C1C;padding:32px 24px;text-align:center">
      <div style="font-size:36px;margin-bottom:8px">🍳</div>
      <div style="color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.5px">FridgeChef</div>
      <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-top:4px">Cook smart with what you have</div>
    </div>

    <div style="padding:32px 24px">
      <div style="background:#FFEBEE;border-radius:12px;padding:16px 20px;margin-bottom:24px;text-align:center">
        <div style="font-size:28px;margin-bottom:4px">🚨</div>
        <div style="font-size:16px;font-weight:700;color:#B71C1C">Today is your last day!</div>
        <div style="font-size:13px;color:#C62828;margin-top:4px">Your free trial ends tonight at midnight</div>
      </div>

      <p style="color:#3E1F00;font-size:15px;line-height:1.6;margin:0 0 16px">
        This is your final reminder — <strong>your FridgeChef free trial ends today</strong>. After midnight, voice capture, photo scan and nutrition features will be locked.
      </p>

      <p style="color:#5D4037;font-size:14px;line-height:1.6;margin:0 0 24px">
        Upgrade now and keep cooking smarter. Cancel anytime.
      </p>

      <a href="https://fridgechef-sable-alpha.vercel.app" style="display:block;background:#B71C1C;color:#fff;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-size:15px;font-weight:700;letter-spacing:0.3px;margin-bottom:24px">
        👑 Upgrade Now — Don't Lose Access
      </a>

      <div style="background:#FDF6F0;border-radius:12px;padding:16px 20px;margin-bottom:16px">
        <div style="font-size:13px;font-weight:700;color:#3E1F00;margin-bottom:8px">What you'll keep with Premium:</div>
        <div style="font-size:13px;color:#5D4037;line-height:1.8">
          ✅ Unlimited voice ingredient capture<br>
          ✅ Unlimited photo scanning<br>
          ✅ Full nutrition & macros on every recipe<br>
          ✅ AI-powered recipe generation<br>
          ✅ Meal planner & grocery list
        </div>
      </div>

      <p style="color:#BCAAA4;font-size:12px;text-align:center;margin:0">
        Questions? Reply to this email and we'll help you out.
      </p>
    </div>

    <div style="background:#FDF6F0;padding:16px 24px;text-align:center">
      <p style="color:#BCAAA4;font-size:11px;margin:0">
        You're receiving this because you signed up for FridgeChef.<br>
        <a href="https://fridgechef-sable-alpha.vercel.app" style="color:#C25E2A">Visit FridgeChef</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  };
}

async function sendEmail(payload) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error: ${res.status} ${err}`);
  }
  return res.json();
}

async function getAllUsers() {
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");

  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Firestore list failed: ${res.status}`);
  const data = await res.json();
  return data.documents || [];
}

export async function GET(req) {
  // Verify this is called by Vercel Cron (or an authorized source)
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === "production") {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return Response.json({ error: "RESEND_API_KEY not configured" }, { status: 500 });
  }

  try {
    const users = await getAllUsers();
    const results = { sent2day: [], sentLastDay: [], skipped: 0, errors: [] };

    for (const doc of users) {
      const fields = doc.fields || {};
      const trialStartDate = fields.trialStartDate?.stringValue;
      const userEmail = fields.email?.stringValue;
      const isPremium = fields.isPremium?.booleanValue;

      if (!trialStartDate || !userEmail || isPremium) {
        results.skipped++;
        continue;
      }

      const daysSince = daysSinceTrialStart(trialStartDate);

      try {
        if (daysSince === 5) {
          await sendEmail(email2DaysLeft(userEmail));
          results.sent2day.push(userEmail);
        } else if (daysSince === 6) {
          await sendEmail(emailLastDay(userEmail));
          results.sentLastDay.push(userEmail);
        } else {
          results.skipped++;
        }
      } catch (err) {
        results.errors.push({ email: userEmail, error: err.message });
      }
    }

    console.log("Trial reminder cron result:", results);
    return Response.json({ ok: true, ...results });
  } catch (err) {
    console.error("Cron error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
