import type { RawArticle, FetchResult } from "../types";
import { getNewsApiQueriesForRun } from "../sources";
import type { NewsApiQueryConfig } from "../sources";
import { idFromUrl, stripHtml } from "../util";

const PROVIDER = process.env.NEWS_API_PROVIDER || "newsapi";
const KEY = process.env.NEWS_API_KEY;

interface NewsApiArticle {
  title: string;
  url: string;
  description?: string;
  content?: string;
  publishedAt?: string;
  urlToImage?: string;
  image?: string;
  source?: { name?: string };
}

function buildUrl(config: NewsApiQueryConfig): string | null {
  if (!KEY) return null;
  const q = encodeURIComponent(config.query);
  if (PROVIDER === "gnews") {
    const country = config.country ? `&country=${config.country}` : "";
    return `https://gnews.io/api/v4/search?q=${q}&lang=en&max=10&sortby=publishedAt${country}&apikey=${KEY}`;
  }
  const country = config.country ? `&country=${config.country}` : "";
  return `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=10${country}&apiKey=${KEY}`;
}

function normalize(a: NewsApiArticle, config: NewsApiQueryConfig): RawArticle | null {
  if (!a?.url || !a?.title) return null;
  return {
    id: idFromUrl(a.url),
    title: a.title.trim(),
    url: a.url.trim(),
    source: a.source?.name?.trim() || "News",
    publishedAt: a.publishedAt || new Date().toISOString(),
    content: stripHtml(a.description || a.content || ""),
    imageUrl: a.urlToImage || a.image || undefined,
    sourceRegion: config.region,
  };
}

async function fetchQuery(
  config: NewsApiQueryConfig,
): Promise<{ articles: RawArticle[]; error?: string }> {
  const url = buildUrl(config);
  if (!url) return { articles: [] };
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "RealiTea/1.0" },
      cache: "no-store",
    });
    if (!res.ok) {
      const msg = `HTTP ${res.status}`;
      console.warn(`[newsapi] ${config.query} -> ${msg}`);
      return { articles: [], error: msg };
    }
    const data = (await res.json()) as { articles?: NewsApiArticle[] };
    const articles = (data.articles ?? [])
      .map((a) => normalize(a, config))
      .filter((x): x is RawArticle => x !== null);
    return { articles };
  } catch (err) {
    const msg = (err as Error).message;
    console.warn(`[newsapi] failed for "${config.query}":`, msg);
    return { articles: [], error: msg };
  }
}

export async function fetchNewsApiArticles(): Promise<FetchResult> {
  const sourceName = `News API (${PROVIDER})`;
  if (!KEY) {
    console.info("[newsapi] NEWS_API_KEY not set, skipping news API source.");
    return {
      articles: [],
      stats: [
        { source: sourceName, type: "newsapi", fetched: 0, ok: false, error: "no API key" },
      ],
    };
  }

  const queries = getNewsApiQueriesForRun();
  const articles: RawArticle[] = [];
  const errors: string[] = [];

  for (const q of queries) {
    const r = await fetchQuery(q);
    articles.push(...r.articles);
    if (r.error) errors.push(`${q.query}: ${r.error}`);
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  return {
    articles,
    stats: [
      {
        source: `${sourceName} (batch ${queries.length})`,
        type: "newsapi",
        fetched: articles.length,
        ok: errors.length < queries.length,
        error: errors.length ? errors.join("; ") : undefined,
      },
    ],
  };
}
