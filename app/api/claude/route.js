import Anthropic from "@anthropic-ai/sdk";

export async function POST(req) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Server not configured" }, { status: 500 });
  }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  try {
    const { prompt, system, maxTokens } = await req.json();

    if (!prompt) {
      return Response.json({ error: "prompt is required" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: maxTokens || 2048,
      system: system || "You are a helpful home chef assistant.",
      messages: [{ role: "user", content: prompt }],
    });

    const block = message.content.find(b => b.type === "text");
    return Response.json({ text: block?.text ?? "" });
  } catch (err) {
    console.error("Claude API error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
