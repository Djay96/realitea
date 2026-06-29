import type { RegionSlug } from "./types";

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

/** All news API queries — rotated per hourly run to stay within free-tier limits. */
export const NEWS_API_QUERIES: NewsApiQueryConfig[] = [
  // US
  { query: "Survivor reality", region: "us", country: "us" },
  { query: "The Bachelor Bachelorette", region: "us", country: "us" },
  { query: "Real Housewives", region: "us", country: "us" },
  { query: "RuPaul Drag Race", region: "us", country: "us" },
  // UK
  { query: "Love Island UK", region: "uk", country: "gb" },
  { query: "I'm A Celebrity", region: "uk", country: "gb" },
  { query: "Strictly Come Dancing", region: "uk", country: "gb" },
  // India
  { query: "Bigg Boss", region: "india", country: "in" },
  { query: "Indian Idol reality", region: "india", country: "in" },
  { query: "Khatron Ke Khiladi", region: "india", country: "in" },
  // Australia
  { query: "MasterChef Australia", region: "australia", country: "au" },
  { query: "Married At First Sight Australia", region: "australia", country: "au" },
  { query: "Love Island Australia", region: "australia", country: "au" },
  // Canada
  { query: "Big Brother Canada", region: "canada", country: "ca" },
  { query: "The Traitors Canada", region: "canada", country: "ca" },
  // Global
  { query: "reality TV show", region: "global" },
  { query: "The Traitors reality", region: "global" },
  { query: "Love Island", region: "global" },
];

/** Queries per hourly run (rotate batches to cover all regions over time). */
export const NEWS_API_QUERIES_PER_RUN = 8;

/** Return the news API query batch for the current UTC hour. */
export function getNewsApiQueriesForRun(): NewsApiQueryConfig[] {
  const batchSize = NEWS_API_QUERIES_PER_RUN;
  const batchIndex =
    Math.floor(Date.now() / 3_600_000) % Math.ceil(NEWS_API_QUERIES.length / batchSize);
  const start = batchIndex * batchSize;
  return NEWS_API_QUERIES.slice(start, start + batchSize);
}

/** Keywords used to keep only reality-TV-relevant articles from broad feeds. */
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
  "celebrity",
  "strictly",
  "khatron",
];

/** How many items to keep in the rolling cached feed. */
export const FEED_MAX_ITEMS = 500;

/** Max new articles to summarize per hourly run (controls DeepSeek cost + runtime). */
export const MAX_SUMMARIES_PER_RUN = Number(process.env.MAX_SUMMARIES_PER_RUN) || 40;

/** Max articles from a single publisher per run (stops one feed dominating). */
export const MAX_PER_SOURCE_PER_RUN = Number(process.env.MAX_PER_SOURCE_PER_RUN) || 2;

/** User-selectable regions in onboarding. */
export const USER_REGIONS: { slug: RegionSlug; label: string }[] = [
  { slug: "us", label: "United States" },
  { slug: "uk", label: "United Kingdom" },
  { slug: "india", label: "India" },
  { slug: "australia", label: "Australia" },
  { slug: "canada", label: "Canada" },
  { slug: "global", label: "Global / All regions" },
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
