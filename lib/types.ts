export interface RawArticle {
  /** Stable id derived from the canonical URL. */
  id: string;
  title: string;
  url: string;
  source: string;
  /** ISO timestamp of publication (best effort). */
  publishedAt: string;
  /** Raw description / content snippet used as input for summarization. */
  content: string;
  imageUrl?: string;
}

export interface NewsItem extends RawArticle {
  /** AI-generated ~60-word Inshorts-style summary. */
  summary: string;
  /** ISO timestamp of when this item was summarized & stored. */
  ingestedAt: string;
}

export interface FeedData {
  updatedAt: string;
  items: NewsItem[];
}

/** Per-source result of one fetch (an INPUT point we track). */
export interface SourceStat {
  source: string;
  type: "rss" | "newsapi";
  fetched: number;
  ok: boolean;
  error?: string;
}

/** Result of a fetcher: the articles plus per-source input stats. */
export interface FetchResult {
  articles: RawArticle[];
  stats: SourceStat[];
}

/** Full record of one aggregation run (start-to-finish I/O tracking). */
export interface RunStats {
  trigger: "scheduled" | "manual";
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  /** INPUT: per-source fetch counts. */
  sources: SourceStat[];
  totalFetched: number;
  deduped: number;
  /** Articles not previously seen (candidates for summarization). */
  newArticles: number;
  /** OUTPUT of DeepSeek: successfully summarized. */
  summarized: number;
  /** DeepSeek calls that fell back (failure/empty). */
  summaryFailures: number;
  /** OUTPUT to store: total items in the feed after merge. */
  totalItems: number;
  ok: boolean;
  error?: string;
}

/** Stored aggregation metadata: last run plus a short history. */
export interface FeedMeta {
  lastRun: RunStats | null;
  history: RunStats[];
}
