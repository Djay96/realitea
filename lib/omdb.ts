import { primaryShow } from "./shows";

const API_KEY = process.env.OMDB_API_KEY;
const BASE = "http://www.omdbapi.com/";

/** Topic slugs (tagging.ts) → OMDb series title for poster lookup. */
const TOPIC_OMDB_TITLES: Record<string, string> = {
  "love-island": "Love Island",
  "big-brother": "Big Brother",
  "bigg-boss": "Bigg Boss",
  "drag-race": "RuPaul's Drag Race",
  bachelor: "The Bachelor",
  survivor: "Survivor",
  housewives: "The Real Housewives of Beverly Hills",
  masterchef: "MasterChef",
  traitors: "The Traitors",
  kardashians: "Keeping Up with the Kardashians",
};

interface OmdbResponse {
  Response: string;
  Poster?: string;
  Error?: string;
}

function validPoster(poster: string | undefined): string | undefined {
  if (!poster || poster === "N/A") return undefined;
  return poster.startsWith("http") ? poster : undefined;
}

/** Best single series title to search OMDb for this article. */
export function omdbSearchTitle(article: {
  topics?: string[];
  shows?: string[];
}): string | undefined {
  const show = primaryShow(article.shows);
  if (show) return show.name;

  const topic = article.topics?.find((t) => t !== "reality-general");
  if (topic && TOPIC_OMDB_TITLES[topic]) return TOPIC_OMDB_TITLES[topic];

  return undefined;
}

/** Fetch a series poster from OMDb by exact title (one API call). */
export async function fetchOmdbPoster(article: {
  topics?: string[];
  shows?: string[];
}): Promise<string | undefined> {
  if (!API_KEY) return undefined;

  const title = omdbSearchTitle(article);
  if (!title) return undefined;

  try {
    const url = new URL(BASE);
    url.searchParams.set("apikey", API_KEY);
    url.searchParams.set("t", title);
    url.searchParams.set("type", "series");

    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return undefined;

    const data = (await res.json()) as OmdbResponse;
    if (data.Response !== "True") return undefined;
    return validPoster(data.Poster);
  } catch {
    return undefined;
  }
}
