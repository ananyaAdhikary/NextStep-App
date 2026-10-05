// Optional enrichment: if OPENAI_API_KEY is set, ask the model for a short
// personalized narrative to sit alongside the deterministic, rule-based
// ranking produced by lib/matching.ts. The ranking itself is never delegated
// to the model — it stays deterministic and auditable; the model only adds a
// human-readable summary on top. If no key is configured, callers should
// treat `null` as "skip the AI summary" and fall back to a static string.
export async function generateNarrativeSummary(prompt: string): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are NextStep's advisor voice: concise, encouraging, and specific. Two to three sentences max. No markdown.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 180,
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() ?? null;
  } catch {
    return null;
  }
}
