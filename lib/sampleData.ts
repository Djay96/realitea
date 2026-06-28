import type { NewsItem } from "./types";

/**
 * Demo content so the frontend renders fully on its own — no backend,
 * Netlify Blobs, DeepSeek, or news-API keys required. Used as a fallback
 * whenever the cached feed is empty (e.g. local UI dev or pre-warm deploy).
 */
const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();

const RAW: Omit<NewsItem, "content">[] = [
  {
    id: "sample-1",
    title: "Love Island Returns With Its Most International Cast Yet",
    url: "https://example.com/love-island-returns",
    source: "Demo Wire",
    publishedAt: minutesAgo(12),
    ingestedAt: minutesAgo(12),
    summary:
      "Love Island is back with contestants from five continents, signalling the franchise's biggest global push to date. Producers promise new twists, a redesigned villa, and a live-vote format that lets international audiences influence couplings in real time. Early teasers have already racked up millions of views across social platforms ahead of the premiere.",
    imageUrl: undefined,
  },
  {
    id: "sample-2",
    title: "Bigg Boss Crowns a Surprise Winner in Record-Breaking Finale",
    url: "https://example.com/bigg-boss-finale",
    source: "Demo Wire",
    publishedAt: minutesAgo(34),
    ingestedAt: minutesAgo(34),
    summary:
      "The latest Bigg Boss season ended with an underdog lifting the trophy after a finale that drew the show's highest-ever viewership. The result stunned fans who had backed the early favourite, sparking lively debate online. Hosts teased an all-stars edition, hinting that several eliminated contestants could return for a future crossover season.",
    imageUrl: undefined,
  },
  {
    id: "sample-3",
    title: "RuPaul's Drag Race Announces Global All-Stars Crossover",
    url: "https://example.com/drag-race-global",
    source: "Demo Wire",
    publishedAt: minutesAgo(58),
    ingestedAt: minutesAgo(58),
    summary:
      "Queens from the UK, US, Brazil, and the Philippines will compete together in a new worldwide All-Stars edition. The format pits regional winners against one another for a global crown, with challenges filmed across multiple countries. Producers say it is the most ambitious international collaboration in the show's history.",
    imageUrl: undefined,
  },
  {
    id: "sample-4",
    title: "MasterChef Judges Shake Up the Rules for the New Season",
    url: "https://example.com/masterchef-rules",
    source: "Demo Wire",
    publishedAt: minutesAgo(96),
    ingestedAt: minutesAgo(96),
    summary:
      "MasterChef is overhauling its elimination format, introducing surprise immunity rounds and a new audience-tasting panel. The judges say the changes reward consistency over single standout dishes. Critics are split on whether the tweaks add drama or dilute the cooking, but contestants report the new pressure has already produced some of the tensest service nights yet.",
    imageUrl: undefined,
  },
  {
    id: "sample-5",
    title: "The Traitors Sets Streaming Record in Its Third Season",
    url: "https://example.com/the-traitors-record",
    source: "Demo Wire",
    publishedAt: minutesAgo(140),
    ingestedAt: minutesAgo(140),
    summary:
      "Psychological strategy game The Traitors has become the most-streamed reality title of the quarter, with multiple national versions trending simultaneously. Fans credit the show's mix of betrayal and round-table drama. Several countries have fast-tracked new editions, and a celebrity spin-off is reportedly in development for release later this year.",
    imageUrl: undefined,
  },
  {
    id: "sample-6",
    title: "Survivor Veterans Return for a Landmark Anniversary Edition",
    url: "https://example.com/survivor-anniversary",
    source: "Demo Wire",
    publishedAt: minutesAgo(180),
    ingestedAt: minutesAgo(180),
    summary:
      "To mark a major milestone, Survivor is bringing back fan-favourite veterans for an anniversary season filmed on a remote new island. The cast spans multiple generations of players, setting up old rivalries and fresh alliances. Producers promise classic challenges reimagined with modern twists, plus a record-setting prize for the sole survivor.",
    imageUrl: undefined,
  },
];

// The raw `content` (summarization input) isn't meaningful for demo items,
// so we reuse the summary text to satisfy the NewsItem shape.
export const SAMPLE_ITEMS: NewsItem[] = RAW.map((item) => ({
  ...item,
  content: item.summary,
}));
