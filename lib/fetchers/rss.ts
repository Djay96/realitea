import Parser from "rss-parser";
import type { RawArticle, FetchResult } from "../types";
import { RSS_FEEDS, REALITY_KEYWORDS } from "../sources";
import type { RssFeedConfig } from "../sources";
import { idFromUrl, stripHtml, containsAny } from "../util";

type FeedItem = {
  title?: string;
  link?: string;
  isoDate?: string;
  pubDate?: string;
  contentSnippet?: string;
  content?: string;
  enclosure?: { url?: string };
  ["media:content"]?: { $?: { url?: string } };
  ["media:thumbnail"]?: { $?: { url?: string } };
};

const parser = new Parser<unknown, FeedItem>({
  timeout: 15000,
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
    ],
  },
});

function extractImage(item: FeedItem): string | undefined {
  return (
    item.enclosure?.url ||
    item["media:content"]?.$?.url ||
    item["media:thumbnail"]?.$?.url ||
    undefined
  );
}

async function fetchOne(
  config: RssFeedConfig,
): Promise<{ articles: RawArticle[]; stat: FetchResult["stats"][0] }> {
  const { name, url, region, dedicated } = config;
  try {
    const feed = await parser.parseURL(url);
    const out: RawArticle[] = [];
    for (const item of feed.items ?? []) {
      const link = item.link?.trim();
      const title = item.title?.trim();
      if (!link || !title) continue;

      const content = stripHtml(item.contentSnippet || item.content || "");
      const haystack = `${title} ${content}`;
      if (!dedicated && !containsAny(haystack, REALITY_KEYWORDS)) continue;

      out.push({
        id: idFromUrl(link),
        title,
        url: link,
        source: feed.title?.trim() || name,
        publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
        content,
        imageUrl: extractImage(item),
        sourceRegion: region,
      });
    }
    return {
      articles: out,
      stat: { source: name, type: "rss", fetched: out.length, ok: true },
    };
  } catch (err) {
    const message = (err as Error).message;
    console.warn(`[rss] failed for ${name} (${url}):`, message);
    return {
      articles: [],
      stat: { source: name, type: "rss", fetched: 0, ok: false, error: message },
    };
  }
}

export async function fetchRssArticles(): Promise<FetchResult> {
  const results = await Promise.all(RSS_FEEDS.map((f) => fetchOne(f)));
  return {
    articles: results.flatMap((r) => r.articles),
    stats: results.map((r) => r.stat),
  };
}
