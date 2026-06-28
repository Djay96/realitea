import type { RawArticle, FetchResult } from "../types";
import { NEWS_QUERIES } from "../sources";
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

function buildUrl(query: string): string | null {
  if (!KEY) return null;
  const q = encodeURIComponent(query);
  if (PROVIDER === "gnews") {
    return `https://gnews.io/api/v4/search?q=${q}&lang=en&max=10&sortby=publishedAt&apikey=${KEY}`;
  }
  // default: newsapi.org
  return `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=10&apiKey=${KEY}`;
}

function normalize(a: NewsApiArticle): RawArticle | null {
  if (!a?.url || !a?.title) return null;
  return {
    id: idFromUrl(a.url),
    title: a.title.trim(),
    url: a.url.trim(),
    source: a.source?.name?.trim() || "News",
    publishedAt: a.publishedAt || new Date().toISOString(),
    content: stripHtml(a.description || a.content || ""),
    imageUrl: a.urlToImage || a.image || undefined,
  };
}

async function fetchQuery(
  query: string,
): Promise<{ articles: RawArticle[]; error?: string }> {
  const url = buildUrl(query);
  if (!url) return { articles: [] };
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "RealiTea/1.0" },
      // Avoid Next.js caching this on the server route.
      cache: "no-store",
    });
    if (!res.ok) {
      const msg = `HTTP ${res.status}`;
      console.warn(`[newsapi] ${query} -> ${msg}`);
      return { articles: [], error: msg };
    }
    const data = (await res.json()) as { articles?: NewsApiArticle[] };
    const articles = (data.articles ?? [])
      .map(normalize)
      .filter((x): x is RawArticle => x !== null);
    return { articles };
  } catch (err) {
    const msg = (err as Error).message;
    console.warn(`[newsapi] failed for "${query}":`, msg);
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
  const articles: RawArticle[] = [];
  const errors: string[] = [];
  // Sequential with a tiny gap to be gentle on free-tier rate limits.
  for (const q of NEWS_QUERIES) {
    const r = await fetchQuery(q);
    articles.push(...r.articles);
    if (r.error) errors.push(`${q}: ${r.error}`);
    await new Promise((r) => setTimeout(r, 250));
  }
  return {
    articles,
    stats: [
      {
        source: sourceName,
        type: "newsapi",
        fetched: articles.length,
        ok: errors.length < NEWS_QUERIES.length,
        error: errors.length ? errors.join("; ") : undefined,
      },
    ],
  };
}
