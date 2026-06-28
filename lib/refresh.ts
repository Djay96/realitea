import type { NewsItem, RawArticle, RunStats, SourceStat } from "./types";
import { fetchRssArticles } from "./fetchers/rss";
import { fetchNewsApiArticles } from "./fetchers/newsapi";
import { summarizeArticle } from "./deepseek";
import {
  readFeed,
  writeFeed,
  mergeItems,
  appendRunStats,
} from "./feedStore";
import { MAX_SUMMARIES_PER_RUN } from "./sources";

function dedupeRaw(articles: RawArticle[]): RawArticle[] {
  const byId = new Map<string, RawArticle>();
  for (const a of articles) {
    if (!byId.has(a.id)) byId.set(a.id, a);
  }
  return Array.from(byId.values());
}

/**
 * The core hourly job: fetch sources, keep only unseen articles,
 * summarize them with DeepSeek, persist the merged feed, and record
 * a full RunStats record (every input/output point) to meta.json.
 */
export async function refreshNews(
  trigger: "scheduled" | "manual" = "scheduled",
): Promise<RunStats> {
  const startedAt = new Date().toISOString();
  const startMs = Date.now();
  const sources: SourceStat[] = [];

  let totalFetched = 0;
  let deduped = 0;
  let newCount = 0;
  let summarized = 0;
  let summaryFailures = 0;
  let totalItems = 0;
  let ok = true;
  let error: string | undefined;

  try {
    // --- INPUT: fetch all sources in parallel ---
    const [rss, api] = await Promise.all([
      fetchRssArticles(),
      fetchNewsApiArticles(),
    ]);
    sources.push(...rss.stats, ...api.stats);

    const fetched = dedupeRaw([...rss.articles, ...api.articles]);
    totalFetched = rss.articles.length + api.articles.length;
    deduped = fetched.length;

    // --- FILTER: drop already-seen ids (no re-summarizing) ---
    const existing = await readFeed();
    const seen = new Set(existing.items.map((i) => i.id));
    const fresh = fetched
      .filter((a) => !seen.has(a.id))
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
      .slice(0, MAX_SUMMARIES_PER_RUN);
    newCount = fresh.length;

    // --- TRANSFORM: DeepSeek summarization (OUTPUT of AI step) ---
    const now = new Date().toISOString();
    const newItems: NewsItem[] = [];
    for (const article of fresh) {
      const { text, usedFallback } = await summarizeArticle(article);
      if (usedFallback) summaryFailures += 1;
      else summarized += 1;
      newItems.push({ ...article, summary: text, ingestedAt: now });
    }

    // --- OUTPUT: persist merged feed to Netlify Blobs ---
    const items = mergeItems(existing.items, newItems);
    totalItems = items.length;
    await writeFeed({ updatedAt: now, items });
  } catch (err) {
    ok = false;
    error = (err as Error).message;
    console.error("[refresh] run failed:", error);
  }

  const finishedAt = new Date().toISOString();
  const run: RunStats = {
    trigger,
    startedAt,
    finishedAt,
    durationMs: Date.now() - startMs,
    sources,
    totalFetched,
    deduped,
    newArticles: newCount,
    summarized,
    summaryFailures,
    totalItems,
    ok,
    error,
  };

  // --- OUTPUT: persist run metrics (best-effort) ---
  await appendRunStats(run);
  return run;
}
