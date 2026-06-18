import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { imageBase64, mediaType } = await req.json();
    if (!imageBase64) {
      return Response.json({ error: "No image provided" }, { status: 400 });
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
              media_type: mediaType || "image/jpeg",
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

    const text = message.content[0].text;
    let ingredients;
    try {
      ingredients = JSON.parse(text.replace(/```json|```/g, "").trim());
    } catch {
      // Fallback: extract comma-separated items if JSON parsing fails
      ingredients = text.replace(/[\[\]"]/g, "").split(",").map(s => s.trim()).filter(Boolean);
    }

    return Response.json({ ingredients });
  } catch (err) {
    console.error("Vision scan error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
