/**
 * Configuration for where raw reality-TV news comes from.
 * DeepSeek only summarizes; these sources provide the raw stories.
 */

/** RSS / Atom feeds focused on reality TV and entertainment (free, no key). */
export const RSS_FEEDS: { name: string; url: string }[] = [
  { name: "Reality Blurred", url: "https://www.realityblurred.com/realitytv/feed/" },
  { name: "Reality Tea", url: "https://www.realitytea.com/feed/" },
  { name: "EW Reality TV", url: "https://ew.com/feed/" },
  { name: "TVLine", url: "https://tvline.com/feed/" },
  { name: "Digital Spy Reality", url: "https://www.digitalspy.com/rss/reality-tv/" },
];

/**
 * Search queries used against the news API for worldwide coverage.
 * Mixes the generic term with specific marquee franchises across regions.
 */
export const NEWS_QUERIES: string[] = [
  "reality TV show",
  "Big Brother",
  "Love Island",
  "Bigg Boss",
  "MasterChef",
  "RuPaul's Drag Race",
  "The Bachelor",
  "Survivor reality",
  "Real Housewives",
  "Kardashians",
];

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
];

/** How many items to keep in the rolling cached feed. */
export const FEED_MAX_ITEMS = 500;

/** Max new articles to summarize per hourly run (controls DeepSeek cost). */
export const MAX_SUMMARIES_PER_RUN = 40;
