import { readFeed } from "./feedStore";
import { SAMPLE_ITEMS } from "./sampleData";
import type { NewsItem } from "./types";

export interface DisplayFeed {
  items: NewsItem[];
  updatedAt: string;
  /** True when serving built-in demo content because the cache is empty. */
  isDemo: boolean;
}

/**
 * Returns the cached feed, or built-in sample content when the cache is empty.
 * This is what makes the frontend work standalone with zero backend setup.
 */
export async function getDisplayFeed(limit = 300): Promise<DisplayFeed> {
  const feed = await readFeed();
  if (feed.items.length > 0) {
    return {
      items: feed.items.slice(0, limit),
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
