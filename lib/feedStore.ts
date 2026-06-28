import { getStore } from "@netlify/blobs";
import type { FeedData, FeedMeta, NewsItem, RunStats } from "./types";
import { FEED_MAX_ITEMS } from "./sources";

const STORE_NAME = "realitea";
const FEED_KEY = "feed.json";
const META_KEY = "meta.json";
const META_HISTORY = 20;

const EMPTY_FEED: FeedData = { updatedAt: new Date(0).toISOString(), items: [] };
const EMPTY_META: FeedMeta = { lastRun: null, history: [] };

function store() {
  // On Netlify (functions + Next runtime) this is auto-configured.
  // Locally, falls back to a sandbox store; missing creds simply yield empty.
  return getStore({ name: STORE_NAME, consistency: "strong" });
}

export async function readFeed(): Promise<FeedData> {
  try {
    const data = await store().get(FEED_KEY, { type: "json" });
    if (!data) return EMPTY_FEED;
    const feed = data as FeedData;
    if (!Array.isArray(feed.items)) return EMPTY_FEED;
    return feed;
  } catch (err) {
    console.warn("[feedStore] read failed:", (err as Error).message);
    return EMPTY_FEED;
  }
}

export async function writeFeed(feed: FeedData): Promise<void> {
  await store().setJSON(FEED_KEY, feed);
}

export async function readMeta(): Promise<FeedMeta> {
  try {
    const data = await store().get(META_KEY, { type: "json" });
    if (!data) return EMPTY_META;
    const meta = data as FeedMeta;
    return {
      lastRun: meta.lastRun ?? null,
      history: Array.isArray(meta.history) ? meta.history : [],
    };
  } catch (err) {
    console.warn("[feedStore] meta read failed:", (err as Error).message);
    return EMPTY_META;
  }
}

export async function appendRunStats(run: RunStats): Promise<void> {
  try {
    const meta = await readMeta();
    const history = [run, ...meta.history].slice(0, META_HISTORY);
    await store().setJSON(META_KEY, { lastRun: run, history });
  } catch (err) {
    // Never let metrics persistence break the run.
    console.warn("[feedStore] meta write failed:", (err as Error).message);
  }
}

/**
 * Merge freshly summarized items into the existing feed:
 * dedupe by id, newest first, capped at FEED_MAX_ITEMS.
 */
export function mergeItems(existing: NewsItem[], fresh: NewsItem[]): NewsItem[] {
  const byId = new Map<string, NewsItem>();
  for (const item of [...fresh, ...existing]) {
    if (!byId.has(item.id)) byId.set(item.id, item);
  }
  return Array.from(byId.values())
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, FEED_MAX_ITEMS);
}
