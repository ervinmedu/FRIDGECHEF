// app/api/claude/route.js
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req) {
  try {
    const { prompt, system } = await req.json();

    const message = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: system || "You are a helpful home chef assistant.",
      messages: [{ role: "user", content: prompt }],
    });

    return Response.json({ text: message.content[0].text });
  } catch (err) {
    console.error("Claude API error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
