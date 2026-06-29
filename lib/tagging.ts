import type { RawArticle, NewsItem } from "./types";
import { matchShowsInText, SHOW_BY_ID } from "./shows";

interface TopicRule {
  slug: string;
  keywords: string[];
}

const TOPIC_RULES: TopicRule[] = [
  { slug: "love-island", keywords: ["love island"] },
  { slug: "big-brother", keywords: ["big brother"] },
  { slug: "bigg-boss", keywords: ["bigg boss", "big boss"] },
  { slug: "drag-race", keywords: ["drag race", "rupaul"] },
  { slug: "bachelor", keywords: ["bachelor", "bachelorette"] },
  { slug: "survivor", keywords: ["survivor"] },
  { slug: "housewives", keywords: ["housewives", "real housewife"] },
  { slug: "masterchef", keywords: ["masterchef", "master chef"] },
  { slug: "traitors", keywords: ["the traitors", "traitors"] },
  { slug: "kardashians", keywords: ["kardashian", "kardashians"] },
  { slug: "reality-general", keywords: ["reality show", "reality tv", "reality series"] },
];

const REGION_KEYWORDS: { region: import("./types").RegionSlug; keywords: string[] }[] = [
  { region: "uk", keywords: [" uk ", "u.k.", "british", "love island uk", "strictly", "i'm a celebrity", "itv ", "bbc "] },
  { region: "india", keywords: ["india", "indian", "bigg boss", "bollywood", "hindi", "colors tv", "sony tv"] },
  { region: "australia", keywords: ["australia", "australian", "mafs australia", "channel 10", "channel nine"] },
  { region: "canada", keywords: ["canada", "canadian", "big brother canada", "ctv ", "global tv"] },
  { region: "us", keywords: ["american", " usa ", "u.s.", "bravo", "cbs ", "abc ", "nbc ", "fox ", "hulu"] },
];

function haystack(article: RawArticle): string {
  return ` ${article.title} ${article.content} ${article.source} ${article.url} `.toLowerCase();
}

function matchTopics(text: string): string[] {
  const found: string[] = [];
  for (const rule of TOPIC_RULES) {
    if (rule.keywords.some((k) => text.includes(k))) found.push(rule.slug);
  }
  return found.length > 0 ? found : ["reality-general"];
}

function matchRegions(text: string, sourceRegion?: import("./types").RegionSlug): import("./types").RegionSlug[] {
  const regions = new Set<import("./types").RegionSlug>();
  if (sourceRegion) regions.add(sourceRegion);
  for (const { region, keywords } of REGION_KEYWORDS) {
    if (keywords.some((k) => text.includes(k.trim()))) regions.add(region);
  }
  if (regions.size === 0) regions.add("global");
  if (regions.size > 1 && regions.has("global")) regions.delete("global");
  return Array.from(regions);
}

/** Keyword-based region + topic + show tags (no extra API calls). */
export function tagArticle(article: RawArticle): RawArticle {
  const text = haystack(article);
  const shows = matchShowsInText(text);
  const regions = matchRegions(text, article.sourceRegion);
  // Let the matched shows reinforce region tags (a show's home region is a
  // strong signal even when the copy doesn't name the country).
  for (const id of shows) {
    const region = SHOW_BY_ID.get(id)?.region;
    if (region && region !== "global" && !regions.includes(region)) {
      regions.push(region);
    }
  }
  return {
    ...article,
    regions,
    topics: matchTopics(text),
    shows,
  };
}

/** Backfill tags on cached items that predate tagging. */
export function normalizeNewsItem(
  item: Partial<NewsItem> & Pick<NewsItem, "id" | "title" | "url" | "source" | "publishedAt" | "content" | "summary" | "ingestedAt">,
): NewsItem {
  const base: RawArticle = {
    id: item.id,
    title: item.title,
    url: item.url,
    source: item.source,
    publishedAt: item.publishedAt,
    content: item.content,
    imageUrl: item.imageUrl,
    sourceRegion: item.sourceRegion,
  };
  const tagged = tagArticle(base);
  return {
    ...tagged,
    summary: item.summary,
    ingestedAt: item.ingestedAt,
    regions: item.regions?.length ? item.regions : (tagged.regions ?? ["global"]),
    topics: item.topics?.length ? item.topics : (tagged.topics ?? ["reality-general"]),
    shows: item.shows?.length ? item.shows : (tagged.shows ?? []),
  };
}
