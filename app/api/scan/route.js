import Anthropic from "@anthropic-ai/sdk";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Server not configured" }, { status: 500 });
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const { imageBase64, mediaType } = await req.json();

    if (!imageBase64) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(mediaType)) {
      return Response.json({ error: "Invalid image type" }, { status: 400 });
    }
    if (Buffer.byteLength(imageBase64, "base64") > MAX_BYTES) {
      return Response.json({ error: "Image too large (max 5 MB)" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: "text",
            text: `You are a food ingredient scanner. Look carefully at this photo and identify ONLY the actual food ingredients and grocery items you can clearly see.

Rules:
- Only include items you can clearly identify as a food or ingredient
- Use simple common names (e.g. "Chicken breast", "Cheddar cheese", "Bell pepper")
- Do NOT include packaging, containers, appliances, or non-food items
- Do NOT guess — only list what is visibly confirmed
- If the same item appears multiple times, list it once
- Be specific: "Ground beef" not just "meat", "Roma tomatoes" not just "vegetables"

Return ONLY a valid JSON array of strings. No explanation, no markdown.
Example: ["Eggs","Whole milk","Chicken breast","Broccoli","Garlic","Cheddar cheese"]`,
          },
        ],
      }],
    });

    const block = message.content.find(b => b.type === "text");
    const text = block?.text ?? "";
    let ingredients;
    try {
      ingredients = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      ingredients = text.replace(/[\[\]"]/g, "").split(",").map(s => s.trim()).filter(Boolean);
    }

    return Response.json({ ingredients });
  } catch (err) {
    console.error("Vision scan error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
