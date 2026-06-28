import type { RawArticle } from "./types";

const API_KEY = process.env.DEEPSEEK_API_KEY;
const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const BASE_URL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";

const SYSTEM_PROMPT =
  "You are a sharp entertainment news editor for a reality-TV news app. " +
  "Write a single, punchy, factual summary of the article in EXACTLY 55-65 words. " +
  "No preamble, no hashtags, no emojis, no quotes around the text. " +
  "Use a neutral, engaging tone. If the article lacks substance, summarize the headline. " +
  "Return ONLY the summary text.";

function fallbackSummary(article: RawArticle): string {
  const base = article.content || article.title;
  const words = base.split(/\s+/).slice(0, 60).join(" ");
  return words.length > 0 ? words : article.title;
}

export interface SummarizeResult {
  text: string;
  /** True when DeepSeek wasn't used (missing key, error, or empty reply). */
  usedFallback: boolean;
}

/** Summarize a single article into an Inshorts-style ~60-word blurb. */
export async function summarizeArticle(
  article: RawArticle,
): Promise<SummarizeResult> {
  if (!API_KEY) {
    console.warn("[deepseek] DEEPSEEK_API_KEY not set; using fallback summary.");
    return { text: fallbackSummary(article), usedFallback: true };
  }

  const userPrompt =
    `Title: ${article.title}\n` +
    `Source: ${article.source}\n` +
    `Content: ${article.content || "(no body text available)"}`;

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 160,
        stream: false,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.warn(`[deepseek] HTTP ${res.status}: ${text.slice(0, 200)}`);
      return { text: fallbackSummary(article), usedFallback: true };
    }

    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const summary = data.choices?.[0]?.message?.content?.trim();
    return summary && summary.length > 0
      ? { text: summary, usedFallback: false }
      : { text: fallbackSummary(article), usedFallback: true };
  } catch (err) {
    console.warn("[deepseek] request failed:", (err as Error).message);
    return { text: fallbackSummary(article), usedFallback: true };
  }
}
