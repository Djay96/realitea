import { readFeed } from "./feedStore";
import { SAMPLE_ITEMS } from "./sampleData";
import { normalizeNewsItem } from "./tagging";
import type { NewsItem } from "./types";

export interface DisplayFeed {
  items: NewsItem[];
  updatedAt: string;
  isDemo: boolean;
}

export async function getDisplayFeed(limit = 300): Promise<DisplayFeed> {
  const feed = await readFeed();
  if (feed.items.length > 0) {
    return {
      items: feed.items.slice(0, limit).map((i) => normalizeNewsItem(i)),
      updatedAt: feed.updatedAt,
      isDemo: false,
    };
  }
  return {
    items: SAMPLE_ITEMS.slice(0, limit),
    updatedAt: SAMPLE_ITEMS[0]?.ingestedAt ?? new Date().toISOString(),
    isDemo: true,
  };
}
