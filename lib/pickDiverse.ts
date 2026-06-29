import type { RawArticle } from "./types";
import { MAX_PER_SOURCE_PER_RUN } from "./sources";

function sourceKey(article: RawArticle): string {
  return article.source.trim().toLowerCase();
}

/**
 * Pick a diverse batch for summarization: round-robin across publishers
 * with a per-source cap so one feed (e.g. Reality Tea) cannot dominate.
 */
export function pickDiverse(
  articles: RawArticle[],
  limit: number,
  maxPerSource = MAX_PER_SOURCE_PER_RUN,
): RawArticle[] {
  const sorted = [...articles].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  const bySource = new Map<string, RawArticle[]>();
  for (const a of sorted) {
    const key = sourceKey(a);
    const list = bySource.get(key) ?? [];
    list.push(a);
    bySource.set(key, list);
  }

  const picked: RawArticle[] = [];
  const counts = new Map<string, number>();
  const keys = Array.from(bySource.keys());

  while (picked.length < limit && keys.length > 0) {
    let progressed = false;
    for (const key of keys) {
      if (picked.length >= limit) break;
      const count = counts.get(key) ?? 0;
      if (count >= maxPerSource) continue;
      const list = bySource.get(key);
      if (!list || list.length === 0) continue;
      picked.push(list.shift()!);
      counts.set(key, count + 1);
      progressed = true;
    }
    if (!progressed) break;
  }

  return picked;
}
