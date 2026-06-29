import type { NewsItem, RawArticle, RunStats } from "./types";
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
import { tagArticle } from "./tagging";
import { pickDiverse } from "./pickDiverse";
import { fetchOgImage } from "./extractImage";

function dedupeRaw(articles: RawArticle[]): RawArticle[] {
  const byId = new Map<string, RawArticle>();
  for (const a of articles) {
    if (!byId.has(a.id)) byId.set(a.id, a);
  }
  return Array.from(byId.values());
}

export async function refreshNews(
  trigger: "scheduled" | "manual" = "scheduled",
): Promise<RunStats> {
  const startedAt = new Date().toISOString();
  const startMs = Date.now();
  const sources: RunStats["sources"] = [];

  let totalFetched = 0;
  let deduped = 0;
  let newCount = 0;
  let summarized = 0;
  let summaryFailures = 0;
  let totalItems = 0;
  let ok = true;
  let error: string | undefined;

  try {
    const [rss, api] = await Promise.all([
      fetchRssArticles(),
      fetchNewsApiArticles(),
    ]);
    sources.push(...rss.stats, ...api.stats);

    const tagged = dedupeRaw([...rss.articles, ...api.articles]).map(tagArticle);
    totalFetched = rss.articles.length + api.articles.length;

    // Core relevance gate: keep ONLY articles that mention an active reality
    // show from lib/shows.ts. This is what stops generic entertainment news
    // (and unrelated items from broad/dedicated feeds) reaching the feed.
    const relevant = tagged.filter((a) => (a.shows?.length ?? 0) > 0);
    deduped = relevant.length;

    const existing = await readFeed();
    const seen = new Set(existing.items.map((i) => i.id));
    const unseen = relevant.filter((a) => !seen.has(a.id));
    const fresh = pickDiverse(unseen, MAX_SUMMARIES_PER_RUN);
    newCount = fresh.length;

    const now = new Date().toISOString();
    const newItems: NewsItem[] = [];
    for (const article of fresh) {
      let imageUrl = article.imageUrl;
      if (!imageUrl) {
        imageUrl = await fetchOgImage(article.url);
      }
      const enriched = imageUrl ? { ...article, imageUrl } : article;
      const { text, usedFallback } = await summarizeArticle(enriched);
      if (usedFallback) summaryFailures += 1;
      else summarized += 1;
      newItems.push({
        ...enriched,
        summary: text,
        ingestedAt: now,
        regions: enriched.regions ?? ["global"],
        topics: enriched.topics ?? ["reality-general"],
        shows: enriched.shows ?? [],
      });
    }

    const items = mergeItems(existing.items, newItems);
    totalItems = items.length;
    await writeFeed({ updatedAt: now, items });
  } catch (err) {
    ok = false;
    error = (err as Error).message;
    console.error("[refresh] run failed:", error);
  }

  const run: RunStats = {
    trigger,
    startedAt,
    finishedAt: new Date().toISOString(),
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

  await appendRunStats(run);
  return run;
}
