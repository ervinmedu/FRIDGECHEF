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
            text: `Look at this image of a fridge, pantry, or food items. List every individual ingredient or food item you can see. Return ONLY a JSON array of ingredient name strings, nothing else. Example: ["Eggs","Milk","Chicken","Broccoli","Garlic"]. Only include clearly visible items.`,
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
