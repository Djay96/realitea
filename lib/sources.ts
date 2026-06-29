import type { RegionSlug } from "./types";
import { getShowNewsQueries, getSelectableCountries, COUNTRY_META } from "./shows";

/**
 * Configuration for where raw reality-TV news comes from.
 * DeepSeek only summarizes; these sources provide the raw stories.
 */

export interface RssFeedConfig {
  name: string;
  url: string;
  region: RegionSlug;
  /** Dedicated reality feeds skip the broad keyword filter. */
  dedicated?: boolean;
}

/** RSS / Atom feeds by region (free, no key). */
export const RSS_FEEDS: RssFeedConfig[] = [
  // US
  { name: "Reality Blurred", url: "https://www.realityblurred.com/realitytv/feed/", region: "us", dedicated: true },
  { name: "Reality Tea", url: "https://www.realitytea.com/feed/", region: "us", dedicated: true },
  { name: "EW", url: "https://ew.com/feed/", region: "us" },
  { name: "TVLine", url: "https://tvline.com/feed/", region: "us" },
  // UK
  { name: "Digital Spy Reality", url: "https://www.digitalspy.com/rss/reality-tv/", region: "uk", dedicated: true },
  { name: "Radio Times TV", url: "https://www.radiotimes.com/tv/feed/", region: "uk" },
  // Global / multi-market entertainment
  { name: "Deadline TV", url: "https://deadline.com/category/tv/feed/", region: "global" },
];

export interface NewsApiQueryConfig {
  query: string;
  region: RegionSlug;
  /** NewsAPI.org country code (us, gb, in, au, ca). */
  country?: string;
}

/**
 * All news API queries — now derived from the active shows in lib/shows.ts so
 * we only ever ask the news API about shows we actually cover. Rotated per
 * hourly run to stay within free-tier limits (airing/upcoming shows first).
 */
export const NEWS_API_QUERIES: NewsApiQueryConfig[] = getShowNewsQueries();

/** Queries per hourly run (rotate batches to cover all shows over time). */
export const NEWS_API_QUERIES_PER_RUN = 8;

/** Return the news API query batch for the current UTC hour. */
export function getNewsApiQueriesForRun(): NewsApiQueryConfig[] {
  const all = NEWS_API_QUERIES;
  if (all.length === 0) return [];
  const batchSize = NEWS_API_QUERIES_PER_RUN;
  const batchIndex =
    Math.floor(Date.now() / 3_600_000) % Math.ceil(all.length / batchSize);
  const start = batchIndex * batchSize;
  return all.slice(start, start + batchSize);
}

/**
 * Cheap pre-filter keywords for BROAD RSS feeds (EW, Deadline, …). This is only
 * a coarse first pass to avoid summarizing obvious non-reality items early; the
 * authoritative relevance gate is the per-show match in refresh.ts, which keeps
 * only articles that mention an active show from lib/shows.ts.
 */
export const REALITY_KEYWORDS: string[] = [
  "reality",
  "big brother",
  "love island",
  "bigg boss",
  "masterchef",
  "drag race",
  "bachelor",
  "bachelorette",
  "survivor",
  "housewives",
  "kardashian",
  "the voice",
  "american idol",
  "dancing with the stars",
  "the traitors",
  "below deck",
  "90 day fiance",
  "married at first sight",
  "strictly",
  "khatron",
];

/** How many items to keep in the rolling cached feed. */
export const FEED_MAX_ITEMS = 500;

/** Max new articles to summarize per hourly run (controls DeepSeek cost + runtime). */
export const MAX_SUMMARIES_PER_RUN = Number(process.env.MAX_SUMMARIES_PER_RUN) || 40;

/** Max articles from a single publisher per run (stops one feed dominating). */
export const MAX_PER_SOURCE_PER_RUN = Number(process.env.MAX_PER_SOURCE_PER_RUN) || 2;

/**
 * User-selectable countries in onboarding — derived from the shows catalog so
 * the list always matches the countries we actually have shows for. Grouped by
 * continent; "Global / All" is appended last.
 */
export const USER_REGIONS: { slug: RegionSlug; label: string; group: string }[] = [
  ...getSelectableCountries().map((c) => ({ slug: c.region, label: c.label, group: c.group })),
  { slug: "global" as RegionSlug, label: COUNTRY_META.global.label, group: COUNTRY_META.global.group },
];

/** User-selectable show interests (topic slugs match tagging.ts). */
export const INTEREST_OPTIONS: { slug: string; label: string }[] = [
  { slug: "love-island", label: "Love Island" },
  { slug: "big-brother", label: "Big Brother" },
  { slug: "bigg-boss", label: "Bigg Boss" },
  { slug: "drag-race", label: "Drag Race" },
  { slug: "bachelor", label: "Bachelor / Bachelorette" },
  { slug: "survivor", label: "Survivor" },
  { slug: "housewives", label: "Real Housewives" },
  { slug: "masterchef", label: "MasterChef" },
  { slug: "traitors", label: "The Traitors" },
  { slug: "kardashians", label: "Kardashians" },
  { slug: "reality-general", label: "Other reality" },
];
