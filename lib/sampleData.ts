import type { NewsItem, RegionSlug } from "./types";

const now = Date.now();
const minutesAgo = (m: number) => new Date(now - m * 60_000).toISOString();

const RAW: Array<
  Omit<NewsItem, "content"> & { regions: RegionSlug[]; topics: string[]; shows: string[] }
> = [
  {
    id: "sample-1",
    title: "Love Island Returns With Its Most International Cast Yet",
    url: "https://example.com/love-island-returns",
    source: "Demo Wire UK",
    publishedAt: minutesAgo(12),
    ingestedAt: minutesAgo(12),
    regions: ["uk", "global"],
    topics: ["love-island"],
    shows: ["love-island"],
    summary:
      "Love Island is back with contestants from five continents, signalling the franchise's biggest global push to date. Producers promise new twists, a redesigned villa, and a live-vote format that lets international audiences influence couplings in real time. Early teasers have already racked up millions of views across social platforms ahead of the premiere.",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&q=80",
  },
  {
    id: "sample-2",
    title: "Bigg Boss Crowns a Surprise Winner in Record-Breaking Finale",
    url: "https://example.com/bigg-boss-finale",
    source: "Demo Wire India",
    publishedAt: minutesAgo(34),
    ingestedAt: minutesAgo(34),
    regions: ["india"],
    topics: ["bigg-boss"],
    shows: ["bigg-boss"],
    summary:
      "The latest Bigg Boss season ended with an underdog lifting the trophy after a finale that drew the show's highest-ever viewership. The result stunned fans who had backed the early favourite, sparking lively debate online. Hosts teased an all-stars edition, hinting that several eliminated contestants could return for a future crossover season.",
    imageUrl: "https://images.unsplash.com/photo-1522868195643-b478d150bd1c?w=800&q=80",
  },
  {
    id: "sample-3",
    title: "RuPaul's Drag Race Announces Global All-Stars Crossover",
    url: "https://example.com/drag-race-global",
    source: "Demo Wire US",
    publishedAt: minutesAgo(58),
    ingestedAt: minutesAgo(58),
    regions: ["us", "global"],
    topics: ["drag-race"],
    shows: ["rupauls-drag-race"],
    summary:
      "Queens from the UK, US, Brazil, and the Philippines will compete together in a new worldwide All-Stars edition. The format pits regional winners against one another for a global crown, with challenges filmed across multiple countries. Producers say it is the most ambitious international collaboration in the show's history.",
    imageUrl: "https://images.unsplash.com/photo-1574263867127-a8b107f5621f?w=800&q=80",
  },
  {
    id: "sample-4",
    title: "MasterChef Australia Judges Shake Up the Rules",
    url: "https://example.com/masterchef-rules",
    source: "Demo Wire AU",
    publishedAt: minutesAgo(96),
    ingestedAt: minutesAgo(96),
    regions: ["australia"],
    topics: ["masterchef"],
    shows: ["masterchef-australia"],
    summary:
      "MasterChef Australia is overhauling its elimination format, introducing surprise immunity rounds and a new audience-tasting panel. The judges say the changes reward consistency over single standout dishes. Critics are split on whether the tweaks add drama or dilute the cooking, but contestants report the new pressure has already produced tense service nights.",
    imageUrl: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&q=80",
  },
  {
    id: "sample-5",
    title: "The Traitors Canada Sets Streaming Record in Season Three",
    url: "https://example.com/the-traitors-record",
    source: "Demo Wire CA",
    publishedAt: minutesAgo(140),
    ingestedAt: minutesAgo(140),
    regions: ["canada"],
    topics: ["traitors"],
    shows: ["the-traitors-canada"],
    summary:
      "The Traitors Canada has become the most-streamed reality title of the quarter in the country. Fans credit the show's mix of betrayal and round-table drama. Producers have fast-tracked a celebrity spin-off reportedly in development for release later this year.",
    imageUrl: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80",
  },
  {
    id: "sample-6",
    title: "Survivor Veterans Return for a Landmark Anniversary Edition",
    url: "https://example.com/survivor-anniversary",
    source: "Demo Wire US",
    publishedAt: minutesAgo(180),
    ingestedAt: minutesAgo(180),
    regions: ["us"],
    topics: ["survivor"],
    shows: ["survivor"],
    summary:
      "To mark a major milestone, Survivor is bringing back fan-favourite veterans for an anniversary season filmed on a remote new island. The cast spans multiple generations of players, setting up old rivalries and fresh alliances. Producers promise classic challenges reimagined with modern twists, plus a record-setting prize for the sole survivor.",
    imageUrl: "https://images.unsplash.com/photo-1540574163026-d643ea20ade2?w=800&q=80",
  },
];

export const SAMPLE_ITEMS: NewsItem[] = RAW.map((item) => ({
  ...item,
  content: item.summary,
}));
