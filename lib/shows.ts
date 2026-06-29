import type { RegionSlug } from "./types";

/**
 * Curated database of reality-TV shows the app actually targets.
 *
 * This is the single source of truth for "which shows do we cover". The news
 * pipeline (1) builds its NewsAPI queries from the active shows here and
 * (2) drops any fetched article that does not mention at least one active show.
 * That is what keeps the feed on-topic instead of "random entertainment news".
 *
 * Maintenance: this is a hand-curated list. To add/retire a show, edit the
 * SHOWS array below. Set `status` to reflect reality and `active` accordingly
 * (active === status !== "ended"). Headlines rarely use a show's full legal
 * name, so `aliases` should include the abbreviations / bare franchise names
 * that actually appear in news copy (MAFS, RHOBH, LIUK, BBCAN, …).
 *
 * Alias matching note: aliases shorter than MIN_ALIAS_LEN characters are
 * ignored by the matcher (too ambiguous, e.g. "BB", "AGT"), so always pair a
 * short alias with at least one longer distinctive phrase.
 */

export type ShowGenre =
  | "dating"
  | "competition"
  | "docusoap"
  | "talent"
  | "cooking"
  | "survival"
  | "makeover"
  | "other";

export type ShowStatus = "airing" | "upcoming" | "returning" | "ended";

export interface Show {
  /** Stable kebab-case id used as the article tag. */
  id: string;
  /** Canonical display name. */
  name: string;
  /** Alternate names / abbreviations as they appear in headlines. */
  aliases: string[];
  /** Broadcaster or streamer. */
  network: string;
  /** Primary region (drives the NewsAPI country filter + region tagging). */
  region: RegionSlug;
  genre: ShowGenre;
  /**
   * airing   – episodes airing right now
   * upcoming – premiering within ~3 months
   * returning – ongoing franchise between seasons (still in the news)
   * ended    – concluded/cancelled with no announced return (excluded)
   */
  status: ShowStatus;
  /** Whether to fetch news for this show. Keep in sync: active === status !== "ended". */
  active: boolean;
  /** Optional NewsAPI search query override (defaults to `name`). */
  query?: string;
}

export const SHOWS: Show[] = [
  // ───────────────────────────── United States ─────────────────────────────
  { id: "survivor", name: "Survivor", aliases: ["survivor"], network: "CBS", region: "us", genre: "survival", status: "returning", active: true, query: "Survivor CBS reality" },
  { id: "big-brother-us", name: "Big Brother US", aliases: ["big brother us", "bbus", "big brother usa"], network: "CBS", region: "us", genre: "competition", status: "airing", active: true, query: "Big Brother US CBS" },
  { id: "the-amazing-race", name: "The Amazing Race", aliases: ["the amazing race", "amazing race"], network: "CBS", region: "us", genre: "competition", status: "returning", active: true },
  { id: "the-bachelor", name: "The Bachelor", aliases: ["the bachelor", "bachelor"], network: "ABC", region: "us", genre: "dating", status: "returning", active: true, query: "The Bachelor ABC" },
  { id: "the-bachelorette", name: "The Bachelorette", aliases: ["the bachelorette", "bachelorette"], network: "ABC", region: "us", genre: "dating", status: "returning", active: true },
  { id: "bachelor-in-paradise", name: "Bachelor in Paradise", aliases: ["bachelor in paradise"], network: "ABC", region: "us", genre: "dating", status: "returning", active: true },
  { id: "golden-bachelor", name: "The Golden Bachelor", aliases: ["golden bachelor", "golden bachelorette"], network: "ABC", region: "us", genre: "dating", status: "returning", active: true },
  { id: "dancing-with-the-stars", name: "Dancing with the Stars", aliases: ["dancing with the stars", "dwts"], network: "ABC", region: "us", genre: "talent", status: "returning", active: true },
  { id: "american-idol", name: "American Idol", aliases: ["american idol"], network: "ABC", region: "us", genre: "talent", status: "returning", active: true },
  { id: "the-voice", name: "The Voice", aliases: ["the voice"], network: "NBC", region: "us", genre: "talent", status: "returning", active: true, query: "The Voice NBC" },
  { id: "americas-got-talent", name: "America's Got Talent", aliases: ["america's got talent", "americas got talent"], network: "NBC", region: "us", genre: "talent", status: "airing", active: true },
  { id: "the-masked-singer", name: "The Masked Singer", aliases: ["the masked singer", "masked singer"], network: "Fox", region: "us", genre: "talent", status: "returning", active: true },
  { id: "hells-kitchen", name: "Hell's Kitchen", aliases: ["hell's kitchen", "hells kitchen"], network: "Fox", region: "us", genre: "cooking", status: "returning", active: true },
  { id: "masterchef-us", name: "MasterChef US", aliases: ["masterchef us"], network: "Fox", region: "us", genre: "cooking", status: "returning", active: true },
  { id: "top-chef", name: "Top Chef", aliases: ["top chef"], network: "Bravo", region: "us", genre: "cooking", status: "returning", active: true },
  { id: "real-housewives", name: "The Real Housewives", aliases: ["real housewives", "housewives"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "rhobh", name: "RHO Beverly Hills", aliases: ["real housewives of beverly hills", "rhobh"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "rhony", name: "RHO New York", aliases: ["real housewives of new york", "rhony"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "rhoa", name: "RHO Atlanta", aliases: ["real housewives of atlanta", "rhoa"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "rhoslc", name: "RHO Salt Lake City", aliases: ["real housewives of salt lake city", "rhoslc"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "rhonj", name: "RHO New Jersey", aliases: ["real housewives of new jersey", "rhonj"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "rhoc", name: "RHO Orange County", aliases: ["real housewives of orange county", "rhoc"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "rhop", name: "RHO Potomac", aliases: ["real housewives of potomac", "rhop"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "vanderpump-rules", name: "Vanderpump Rules", aliases: ["vanderpump rules", "vanderpump"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "below-deck", name: "Below Deck", aliases: ["below deck"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "summer-house", name: "Summer House", aliases: ["summer house"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "the-kardashians", name: "The Kardashians", aliases: ["the kardashians", "kardashians", "kardashian", "kuwtk"], network: "Hulu", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "love-is-blind", name: "Love Is Blind", aliases: ["love is blind"], network: "Netflix", region: "us", genre: "dating", status: "returning", active: true },
  { id: "love-island-usa", name: "Love Island USA", aliases: ["love island usa", "love island us"], network: "Peacock", region: "us", genre: "dating", status: "airing", active: true },
  { id: "the-ultimatum", name: "The Ultimatum", aliases: ["the ultimatum"], network: "Netflix", region: "us", genre: "dating", status: "returning", active: true },
  { id: "perfect-match", name: "Perfect Match", aliases: ["perfect match"], network: "Netflix", region: "us", genre: "dating", status: "returning", active: true },
  { id: "too-hot-to-handle", name: "Too Hot to Handle", aliases: ["too hot to handle"], network: "Netflix", region: "us", genre: "dating", status: "returning", active: true },
  { id: "the-circle", name: "The Circle", aliases: ["the circle"], network: "Netflix", region: "us", genre: "competition", status: "returning", active: true, query: "The Circle Netflix reality" },
  { id: "selling-sunset", name: "Selling Sunset", aliases: ["selling sunset"], network: "Netflix", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "queer-eye", name: "Queer Eye", aliases: ["queer eye"], network: "Netflix", region: "us", genre: "makeover", status: "returning", active: true },
  { id: "90-day-fiance", name: "90 Day Fiancé", aliases: ["90 day fiance", "90 day fiancé", "90 day fiancé"], network: "TLC", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "sister-wives", name: "Sister Wives", aliases: ["sister wives"], network: "TLC", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "the-challenge", name: "The Challenge", aliases: ["the challenge"], network: "MTV", region: "us", genre: "competition", status: "returning", active: true, query: "The Challenge MTV" },
  { id: "jersey-shore", name: "Jersey Shore: Family Vacation", aliases: ["jersey shore"], network: "MTV", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "married-at-first-sight-us", name: "Married at First Sight US", aliases: ["married at first sight", "mafs"], network: "Lifetime", region: "us", genre: "dating", status: "returning", active: true },
  { id: "love-and-hip-hop", name: "Love & Hip Hop", aliases: ["love & hip hop", "love and hip hop"], network: "VH1", region: "us", genre: "docusoap", status: "returning", active: true },
  { id: "the-traitors-us", name: "The Traitors US", aliases: ["the traitors us", "traitors us"], network: "Peacock", region: "us", genre: "competition", status: "returning", active: true },
  { id: "squid-game-the-challenge", name: "Squid Game: The Challenge", aliases: ["squid game the challenge", "squid game: the challenge"], network: "Netflix", region: "us", genre: "competition", status: "returning", active: true },

  // ───────────────────────────── United Kingdom ────────────────────────────
  { id: "love-island-uk", name: "Love Island UK", aliases: ["love island uk", "liuk"], network: "ITV", region: "uk", genre: "dating", status: "airing", active: true },
  { id: "love-island-all-stars", name: "Love Island: All Stars", aliases: ["love island all stars"], network: "ITV", region: "uk", genre: "dating", status: "returning", active: true },
  { id: "im-a-celebrity", name: "I'm a Celebrity… Get Me Out of Here!", aliases: ["i'm a celebrity", "im a celebrity", "i'm a celeb"], network: "ITV", region: "uk", genre: "survival", status: "returning", active: true },
  { id: "strictly-come-dancing", name: "Strictly Come Dancing", aliases: ["strictly come dancing", "strictly"], network: "BBC", region: "uk", genre: "talent", status: "returning", active: true },
  { id: "the-traitors-uk", name: "The Traitors UK", aliases: ["the traitors uk", "traitors uk"], network: "BBC", region: "uk", genre: "competition", status: "returning", active: true },
  { id: "big-brother-uk", name: "Big Brother UK", aliases: ["big brother uk", "bbuk"], network: "ITV", region: "uk", genre: "competition", status: "returning", active: true },
  { id: "celebrity-big-brother-uk", name: "Celebrity Big Brother UK", aliases: ["celebrity big brother"], network: "ITV", region: "uk", genre: "competition", status: "returning", active: true },
  { id: "great-british-bake-off", name: "The Great British Bake Off", aliases: ["great british bake off", "bake off", "gbbo"], network: "Channel 4", region: "uk", genre: "cooking", status: "returning", active: true },
  { id: "masterchef-uk", name: "MasterChef UK", aliases: ["masterchef uk"], network: "BBC", region: "uk", genre: "cooking", status: "returning", active: true },
  { id: "britains-got-talent", name: "Britain's Got Talent", aliases: ["britain's got talent", "britains got talent"], network: "ITV", region: "uk", genre: "talent", status: "returning", active: true },
  { id: "the-voice-uk", name: "The Voice UK", aliases: ["the voice uk"], network: "ITV", region: "uk", genre: "talent", status: "returning", active: true },
  { id: "married-at-first-sight-uk", name: "Married at First Sight UK", aliases: ["married at first sight uk", "mafs uk"], network: "Channel 4", region: "uk", genre: "dating", status: "returning", active: true },
  { id: "gogglebox", name: "Gogglebox", aliases: ["gogglebox"], network: "Channel 4", region: "uk", genre: "docusoap", status: "airing", active: true },
  { id: "the-apprentice-uk", name: "The Apprentice UK", aliases: ["the apprentice"], network: "BBC", region: "uk", genre: "competition", status: "returning", active: true, query: "The Apprentice UK BBC" },
  { id: "geordie-shore", name: "Geordie Shore", aliases: ["geordie shore"], network: "MTV UK", region: "uk", genre: "docusoap", status: "returning", active: true },
  { id: "made-in-chelsea", name: "Made in Chelsea", aliases: ["made in chelsea"], network: "E4", region: "uk", genre: "docusoap", status: "returning", active: true },
  { id: "towie", name: "The Only Way Is Essex", aliases: ["the only way is essex", "towie"], network: "ITVBe", region: "uk", genre: "docusoap", status: "returning", active: true },
  { id: "race-across-the-world", name: "Race Across the World", aliases: ["race across the world"], network: "BBC", region: "uk", genre: "competition", status: "returning", active: true },
  { id: "dancing-on-ice", name: "Dancing on Ice", aliases: ["dancing on ice"], network: "ITV", region: "uk", genre: "talent", status: "returning", active: true },
  { id: "sas-who-dares-wins", name: "SAS: Who Dares Wins", aliases: ["sas who dares wins"], network: "Channel 4", region: "uk", genre: "survival", status: "returning", active: true },

  // ───────────────────────────────── India ─────────────────────────────────
  { id: "bigg-boss", name: "Bigg Boss", aliases: ["bigg boss", "big boss", "bigg boss hindi"], network: "Colors / JioCinema", region: "india", genre: "competition", status: "returning", active: true },
  { id: "bigg-boss-ott", name: "Bigg Boss OTT", aliases: ["bigg boss ott"], network: "JioCinema", region: "india", genre: "competition", status: "returning", active: true },
  { id: "bigg-boss-tamil", name: "Bigg Boss Tamil", aliases: ["bigg boss tamil"], network: "Star Vijay", region: "india", genre: "competition", status: "returning", active: true },
  { id: "bigg-boss-telugu", name: "Bigg Boss Telugu", aliases: ["bigg boss telugu"], network: "Star Maa", region: "india", genre: "competition", status: "returning", active: true },
  { id: "bigg-boss-kannada", name: "Bigg Boss Kannada", aliases: ["bigg boss kannada"], network: "Colors Kannada", region: "india", genre: "competition", status: "returning", active: true },
  { id: "bigg-boss-marathi", name: "Bigg Boss Marathi", aliases: ["bigg boss marathi"], network: "Colors Marathi", region: "india", genre: "competition", status: "returning", active: true },
  { id: "bigg-boss-malayalam", name: "Bigg Boss Malayalam", aliases: ["bigg boss malayalam"], network: "Asianet", region: "india", genre: "competition", status: "returning", active: true },
  { id: "indian-idol", name: "Indian Idol", aliases: ["indian idol"], network: "Sony", region: "india", genre: "talent", status: "returning", active: true },
  { id: "khatron-ke-khiladi", name: "Khatron Ke Khiladi", aliases: ["khatron ke khiladi", "khatron"], network: "Colors", region: "india", genre: "survival", status: "returning", active: true },
  { id: "indias-best-dancer", name: "India's Best Dancer", aliases: ["india's best dancer", "indias best dancer"], network: "Sony", region: "india", genre: "talent", status: "returning", active: true },
  { id: "super-dancer", name: "Super Dancer", aliases: ["super dancer"], network: "Sony", region: "india", genre: "talent", status: "returning", active: true },
  { id: "saregamapa", name: "Sa Re Ga Ma Pa", aliases: ["sa re ga ma pa", "saregamapa"], network: "Zee TV", region: "india", genre: "talent", status: "returning", active: true },
  { id: "jhalak-dikhhla-jaa", name: "Jhalak Dikhhla Jaa", aliases: ["jhalak dikhhla jaa", "jhalak dikhla ja", "jhalak"], network: "Colors", region: "india", genre: "talent", status: "returning", active: true },
  { id: "masterchef-india", name: "MasterChef India", aliases: ["masterchef india"], network: "Sony", region: "india", genre: "cooking", status: "returning", active: true },
  { id: "roadies", name: "Roadies", aliases: ["mtv roadies", "roadies"], network: "MTV India", region: "india", genre: "competition", status: "returning", active: true },
  { id: "splitsvilla", name: "Splitsvilla", aliases: ["splitsvilla"], network: "MTV India", region: "india", genre: "dating", status: "returning", active: true },
  { id: "laughter-chefs", name: "Laughter Chefs", aliases: ["laughter chefs"], network: "Colors", region: "india", genre: "other", status: "returning", active: true },

  // ─────────────────────────────── Australia ───────────────────────────────
  { id: "mafs-australia", name: "Married at First Sight Australia", aliases: ["married at first sight australia", "mafs australia", "mafs au"], network: "Nine", region: "australia", genre: "dating", status: "returning", active: true },
  { id: "masterchef-australia", name: "MasterChef Australia", aliases: ["masterchef australia"], network: "Ten", region: "australia", genre: "cooking", status: "airing", active: true },
  { id: "australian-survivor", name: "Australian Survivor", aliases: ["australian survivor", "survivor australia"], network: "Ten", region: "australia", genre: "survival", status: "returning", active: true },
  { id: "the-block", name: "The Block", aliases: ["the block"], network: "Nine", region: "australia", genre: "makeover", status: "returning", active: true, query: "The Block Channel Nine renovation" },
  { id: "big-brother-australia", name: "Big Brother Australia", aliases: ["big brother australia", "bbau"], network: "Seven", region: "australia", genre: "competition", status: "returning", active: true },
  { id: "love-island-australia", name: "Love Island Australia", aliases: ["love island australia", "love island au"], network: "Nine", region: "australia", genre: "dating", status: "returning", active: true },
  { id: "the-bachelor-australia", name: "The Bachelor Australia", aliases: ["the bachelor australia", "bachelor australia"], network: "Ten", region: "australia", genre: "dating", status: "returning", active: true },
  { id: "im-a-celebrity-australia", name: "I'm a Celebrity Australia", aliases: ["i'm a celebrity australia", "im a celebrity australia"], network: "Ten", region: "australia", genre: "survival", status: "returning", active: true },
  { id: "the-voice-australia", name: "The Voice Australia", aliases: ["the voice australia"], network: "Seven", region: "australia", genre: "talent", status: "returning", active: true },
  { id: "australian-idol", name: "Australian Idol", aliases: ["australian idol"], network: "Seven", region: "australia", genre: "talent", status: "returning", active: true },
  { id: "my-kitchen-rules", name: "My Kitchen Rules", aliases: ["my kitchen rules", "mkr"], network: "Seven", region: "australia", genre: "cooking", status: "returning", active: true },
  { id: "farmer-wants-a-wife", name: "Farmer Wants a Wife", aliases: ["farmer wants a wife"], network: "Seven", region: "australia", genre: "dating", status: "returning", active: true },
  { id: "dancing-with-the-stars-australia", name: "Dancing with the Stars Australia", aliases: ["dancing with the stars australia"], network: "Seven", region: "australia", genre: "talent", status: "returning", active: true },

  // ──────────────────────────────── Canada ─────────────────────────────────
  { id: "big-brother-canada", name: "Big Brother Canada", aliases: ["big brother canada", "bbcan"], network: "Global", region: "canada", genre: "competition", status: "returning", active: true },
  { id: "the-traitors-canada", name: "The Traitors Canada", aliases: ["the traitors canada", "traitors canada"], network: "CTV", region: "canada", genre: "competition", status: "returning", active: true },
  { id: "masterchef-canada", name: "MasterChef Canada", aliases: ["masterchef canada"], network: "CTV", region: "canada", genre: "cooking", status: "returning", active: true },
  { id: "canadas-got-talent", name: "Canada's Got Talent", aliases: ["canada's got talent", "canadas got talent"], network: "Citytv", region: "canada", genre: "talent", status: "returning", active: true },
  { id: "canadas-drag-race", name: "Canada's Drag Race", aliases: ["canada's drag race", "canadas drag race"], network: "Crave", region: "canada", genre: "competition", status: "returning", active: true },
  { id: "top-chef-canada", name: "Top Chef Canada", aliases: ["top chef canada"], network: "Food Network", region: "canada", genre: "cooking", status: "returning", active: true },
  { id: "amazing-race-canada", name: "The Amazing Race Canada", aliases: ["the amazing race canada", "amazing race canada"], network: "CTV", region: "canada", genre: "competition", status: "returning", active: true },

  // ───────────────────── Global / international franchises ──────────────────
  // These own the bare franchise alias so a country-agnostic headline still
  // matches (and is tagged "global"); region-specific rows above own the
  // disambiguated forms ("love island uk", "big brother canada", …).
  { id: "love-island", name: "Love Island (franchise)", aliases: ["love island"], network: "ITV / various", region: "global", genre: "dating", status: "returning", active: true },
  { id: "big-brother", name: "Big Brother (franchise)", aliases: ["big brother"], network: "various", region: "global", genre: "competition", status: "returning", active: true, query: "Big Brother reality TV" },
  { id: "the-traitors", name: "The Traitors (franchise)", aliases: ["the traitors"], network: "various", region: "global", genre: "competition", status: "returning", active: true, query: "The Traitors reality TV" },
  { id: "masterchef", name: "MasterChef (franchise)", aliases: ["masterchef", "master chef"], network: "various", region: "global", genre: "cooking", status: "returning", active: true },
  { id: "rupauls-drag-race", name: "RuPaul's Drag Race", aliases: ["rupaul's drag race", "drag race", "rupaul"], network: "MTV / WOW", region: "global", genre: "competition", status: "returning", active: true },
];

export const SHOW_BY_ID: Map<string, Show> = new Map(SHOWS.map((s) => [s.id, s]));

/** Country code per region for the NewsAPI `country` filter. */
const COUNTRY_BY_REGION: Record<RegionSlug, string | undefined> = {
  us: "us",
  uk: "gb",
  india: "in",
  australia: "au",
  canada: "ca",
  global: undefined,
};

const STATUS_PRIORITY: Record<ShowStatus, number> = {
  airing: 0,
  upcoming: 1,
  returning: 2,
  ended: 3,
};

/** Shows we actively fetch news for. */
export function getActiveShows(): Show[] {
  return SHOWS.filter((s) => s.active);
}

/**
 * Best single show to label an article with: prefer a specific region variant
 * (e.g. "Love Island UK") over the bare franchise umbrella ("Love Island").
 */
export function primaryShow(ids: string[] | undefined): Show | null {
  if (!ids?.length) return null;
  const shows = ids
    .map((id) => SHOW_BY_ID.get(id))
    .filter((s): s is Show => Boolean(s));
  if (shows.length === 0) return null;
  return shows.find((s) => s.region !== "global") ?? shows[0];
}

/**
 * News-search queries derived from the active shows, ordered so currently
 * airing / upcoming shows are searched first in the hourly rotation.
 */
export function getShowNewsQueries(): {
  query: string;
  region: RegionSlug;
  country?: string;
}[] {
  return getActiveShows()
    .slice()
    .sort((a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status])
    .map((s) => ({
      query: s.query ?? s.name,
      region: s.region,
      country: COUNTRY_BY_REGION[s.region],
    }));
}

// ── Article ↔ show matching ────────────────────────────────────────────────
// Aliases shorter than this are ignored (too ambiguous to match safely).
const MIN_ALIAS_LEN = 4;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface ShowMatcher {
  id: string;
  re: RegExp;
}

// One alternation regex per active show, compiled once at module load.
// Boundaries use alnum lookaround so "bbuk" matches in "BBUK" but "the voice"
// does not match inside "thevoiceover", and short aliases inside longer words
// (e.g. "bb" in "abba") never fire.
const MATCHERS: ShowMatcher[] = getActiveShows().map((show) => {
  const phrases = Array.from(
    new Set(
      [show.name, ...show.aliases]
        .map((a) => a.trim().toLowerCase())
        .filter((a) => a.length >= MIN_ALIAS_LEN),
    ),
  ).sort((a, b) => b.length - a.length);
  const alt = phrases.map(escapeRegExp).join("|");
  return {
    id: show.id,
    re: new RegExp(`(?<![a-z0-9])(?:${alt})(?![a-z0-9])`, "i"),
  };
});

/** Ids of active shows mentioned in the given text (title + content + source). */
export function matchShowsInText(text: string): string[] {
  if (!text) return [];
  const lower = text.toLowerCase();
  const out: string[] = [];
  for (const m of MATCHERS) {
    if (m.re.test(lower)) out.push(m.id);
  }
  return out;
}
