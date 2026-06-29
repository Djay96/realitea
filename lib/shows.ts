import type { RegionSlug } from "./types";
// Machine-maintained IMDb id corrections (id → "tt…"), written by
// `npm run resolve:ids` (OMDb title search). Merged over the inline `imdb`
// seeds below so ids stay anchored to IMDb without hand-editing this file.
import IMDB_OVERRIDES from "./shows.imdb.json";

/**
 * Curated, IMDb-keyed database of reality-TV shows, grouped by country.
 *
 * IMDb is the golden source: every show carries its IMDb id (`imdb`) and the
 * weekly refresh job (scripts/refresh-shows.ts → Netlify scheduled function)
 * re-checks each id against OMDb (IMDb-derived) to keep title/status/active
 * fresh. New shows are added by appending their IMDb id here.
 *
 * The app uses this catalog to (1) build per-show NewsAPI queries and (2) drop
 * any fetched article that doesn't mention an active show, then (3) hard-filter
 * the feed to the country the user selected — so a user sees ONLY the news of
 * the shows in their country.
 *
 * Alias-ownership discipline (critical for clean country feeds): a *bare*
 * franchise name that spans multiple countries (e.g. "Survivor", "The Voice",
 * "Love Island") lives ONLY on a region:"global" umbrella entry. Each national
 * version owns a *qualified* alias ("survivor south africa", "love island uk").
 * That way "Survivor South Africa" tags only South Africa (+ the global
 * umbrella), never leaking into the US feed; a country-agnostic "Survivor"
 * headline parks under Global / All.
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
  /** Country bucket (drives grouping, the NewsAPI country filter, and the feed filter). */
  region: RegionSlug;
  genre: ShowGenre;
  status: ShowStatus;
  /** Whether to fetch/show news. active === status !== "ended". */
  active: boolean;
  /** IMDb title id (golden key for the weekly refresh). */
  imdb?: string;
  /** Optional NewsAPI search query override (defaults to `name`). */
  query?: string;
}

/** Per-country display + news metadata. `news` is the ISO-2 code for the news API country filter. */
export const COUNTRY_META: Record<
  RegionSlug,
  { label: string; group: string; news?: string }
> = {
  us: { label: "United States", group: "North America", news: "us" },
  canada: { label: "Canada", group: "North America", news: "ca" },
  mexico: { label: "Mexico", group: "Latin America", news: "mx" },
  brazil: { label: "Brazil", group: "Latin America", news: "br" },
  argentina: { label: "Argentina", group: "Latin America", news: "ar" },
  latam: { label: "Latin America (Spanish)", group: "Latin America" },
  uk: { label: "United Kingdom", group: "Europe", news: "gb" },
  spain: { label: "Spain", group: "Europe", news: "es" },
  germany: { label: "Germany", group: "Europe", news: "de" },
  france: { label: "France", group: "Europe", news: "fr" },
  italy: { label: "Italy", group: "Europe", news: "it" },
  sweden: { label: "Sweden", group: "Europe", news: "se" },
  netherlands: { label: "Netherlands", group: "Europe", news: "nl" },
  nigeria: { label: "Nigeria", group: "Africa", news: "ng" },
  "south-africa": { label: "South Africa", group: "Africa", news: "za" },
  turkey: { label: "Türkiye", group: "Middle East", news: "tr" },
  mena: { label: "Middle East / Arab", group: "Middle East" },
  india: { label: "India", group: "Asia", news: "in" },
  korea: { label: "South Korea", group: "Asia", news: "kr" },
  japan: { label: "Japan", group: "Asia", news: "jp" },
  indonesia: { label: "Indonesia", group: "Asia", news: "id" },
  philippines: { label: "Philippines", group: "Asia", news: "ph" },
  thailand: { label: "Thailand", group: "Asia", news: "th" },
  vietnam: { label: "Vietnam", group: "Asia", news: "vn" },
  malaysia: { label: "Malaysia", group: "Asia", news: "my" },
  australia: { label: "Australia & NZ", group: "Oceania", news: "au" },
  global: { label: "Global / All", group: "Global" },
};

export const SHOWS: Show[] = [
  // ───────── Global franchise umbrellas (own the bare multi-country names) ─────────
  { id: "love-island", name: "Love Island (franchise)", aliases: ["love island"], network: "various", region: "global", genre: "dating", status: "returning", active: true },
  { id: "big-brother", name: "Big Brother (franchise)", aliases: ["big brother"], network: "various", region: "global", genre: "competition", status: "returning", active: true, query: "Big Brother reality TV" },
  { id: "the-traitors", name: "The Traitors (franchise)", aliases: ["the traitors"], network: "various", region: "global", genre: "competition", status: "returning", active: true, query: "The Traitors reality TV" },
  { id: "masterchef", name: "MasterChef (franchise)", aliases: ["masterchef", "master chef"], network: "various", region: "global", genre: "cooking", status: "returning", active: true },
  { id: "rupauls-drag-race", name: "RuPaul's Drag Race", aliases: ["rupaul's drag race", "drag race", "rupaul"], network: "MTV / WOW", region: "global", genre: "competition", status: "returning", active: true, imdb: "tt1353056" },
  { id: "survivor", name: "Survivor (franchise)", aliases: ["survivor"], network: "various", region: "global", genre: "survival", status: "returning", active: true, query: "Survivor reality TV" },
  { id: "the-voice", name: "The Voice (franchise)", aliases: ["the voice"], network: "various", region: "global", genre: "talent", status: "returning", active: true, query: "The Voice singing competition" },
  { id: "dancing-with-the-stars", name: "Dancing with the Stars (franchise)", aliases: ["dancing with the stars", "dwts"], network: "various", region: "global", genre: "talent", status: "returning", active: true },
  { id: "married-at-first-sight", name: "Married at First Sight (franchise)", aliases: ["married at first sight", "mafs"], network: "various", region: "global", genre: "dating", status: "returning", active: true },
  { id: "the-amazing-race", name: "The Amazing Race (franchise)", aliases: ["the amazing race", "amazing race"], network: "various", region: "global", genre: "competition", status: "returning", active: true },
  { id: "top-chef", name: "Top Chef (franchise)", aliases: ["top chef"], network: "various", region: "global", genre: "cooking", status: "returning", active: true },
  { id: "love-is-blind", name: "Love Is Blind (franchise)", aliases: ["love is blind"], network: "Netflix", region: "global", genre: "dating", status: "returning", active: true },
  { id: "temptation-island", name: "Temptation Island (franchise)", aliases: ["temptation island"], network: "various", region: "global", genre: "dating", status: "returning", active: true },
  { id: "are-you-the-one", name: "Are You the One? (franchise)", aliases: ["are you the one"], network: "MTV", region: "global", genre: "dating", status: "returning", active: true },
  { id: "exatlon", name: "Exatlón (franchise)", aliases: ["exatlon", "exatlón"], network: "various", region: "global", genre: "competition", status: "returning", active: true },
  { id: "gran-hermano", name: "Gran Hermano (franchise)", aliases: ["gran hermano"], network: "various", region: "global", genre: "docusoap", status: "returning", active: true },
  { id: "la-casa-de-los-famosos", name: "La Casa de los Famosos (franchise)", aliases: ["la casa de los famosos"], network: "Telemundo / various", region: "global", genre: "competition", status: "returning", active: true },

  // ───────────────────────────── United States ─────────────────────────────
  { id: "survivor-us", name: "Survivor (US)", aliases: ["survivor cbs", "survivor us", "survivor season"], network: "CBS", region: "us", genre: "survival", status: "returning", active: true, imdb: "tt0239195", query: "Survivor CBS" },
  { id: "big-brother-us", name: "Big Brother US", aliases: ["big brother us", "bbus", "big brother usa"], network: "CBS", region: "us", genre: "competition", status: "airing", active: true, imdb: "tt0258995", query: "Big Brother US CBS" },
  { id: "the-amazing-race-us", name: "The Amazing Race (US)", aliases: ["the amazing race us", "amazing race cbs"], network: "CBS", region: "us", genre: "competition", status: "returning", active: true, imdb: "tt0285335", query: "The Amazing Race CBS" },
  { id: "the-bachelor", name: "The Bachelor", aliases: ["the bachelor", "bachelor"], network: "ABC", region: "us", genre: "dating", status: "returning", active: true, imdb: "tt0313038", query: "The Bachelor ABC" },
  { id: "the-bachelorette", name: "The Bachelorette", aliases: ["the bachelorette", "bachelorette"], network: "ABC", region: "us", genre: "dating", status: "returning", active: true, imdb: "tt0364782" },
  { id: "bachelor-in-paradise", name: "Bachelor in Paradise", aliases: ["bachelor in paradise"], network: "ABC", region: "us", genre: "dating", status: "returning", active: true, imdb: "tt3777300" },
  { id: "golden-bachelor", name: "The Golden Bachelor", aliases: ["golden bachelor", "golden bachelorette"], network: "ABC", region: "us", genre: "dating", status: "returning", active: true, imdb: "tt28570113" },
  { id: "dancing-with-the-stars-us", name: "Dancing with the Stars (US)", aliases: ["dancing with the stars us", "dwts abc"], network: "ABC", region: "us", genre: "talent", status: "returning", active: true, imdb: "tt0463398" },
  { id: "american-idol", name: "American Idol", aliases: ["american idol"], network: "ABC", region: "us", genre: "talent", status: "returning", active: true, imdb: "tt0319931" },
  { id: "the-voice-us", name: "The Voice (US)", aliases: ["the voice us", "the voice nbc"], network: "NBC", region: "us", genre: "talent", status: "returning", active: true, imdb: "tt1839578", query: "The Voice NBC" },
  { id: "americas-got-talent", name: "America's Got Talent", aliases: ["america's got talent", "americas got talent"], network: "NBC", region: "us", genre: "talent", status: "airing", active: true, imdb: "tt0759364" },
  { id: "the-masked-singer", name: "The Masked Singer", aliases: ["the masked singer", "masked singer"], network: "Fox", region: "us", genre: "talent", status: "returning", active: true, imdb: "tt8268942" },
  { id: "hells-kitchen", name: "Hell's Kitchen", aliases: ["hell's kitchen", "hells kitchen"], network: "Fox", region: "us", genre: "cooking", status: "returning", active: true, imdb: "tt0437005" },
  { id: "masterchef-us", name: "MasterChef US", aliases: ["masterchef us", "masterchef fox"], network: "Fox", region: "us", genre: "cooking", status: "returning", active: true, imdb: "tt1641435" },
  { id: "top-chef-us", name: "Top Chef (US)", aliases: ["top chef us", "top chef bravo"], network: "Bravo", region: "us", genre: "cooking", status: "returning", active: true, imdb: "tt0473134" },
  { id: "the-mole", name: "The Mole", aliases: ["the mole"], network: "Netflix", region: "us", genre: "competition", status: "airing", active: true, imdb: "tt21822078" },
  { id: "claim-to-fame", name: "Claim to Fame", aliases: ["claim to fame"], network: "ABC", region: "us", genre: "competition", status: "returning", active: true, imdb: "tt18974548" },
  { id: "house-of-villains", name: "House of Villains", aliases: ["house of villains"], network: "E! / Peacock", region: "us", genre: "competition", status: "airing", active: true, imdb: "tt26695859" },
  { id: "the-anonymous", name: "The Anonymous", aliases: ["the anonymous"], network: "USA Network", region: "us", genre: "competition", status: "returning", active: true, imdb: "tt32124362" },
  { id: "special-forces", name: "Special Forces: World's Toughest Test", aliases: ["special forces world's toughest test", "special forces toughest test"], network: "Fox", region: "us", genre: "competition", status: "airing", active: true, imdb: "tt22003362" },
  { id: "the-floor", name: "The Floor", aliases: ["the floor fox", "the floor game show"], network: "Fox", region: "us", genre: "competition", status: "airing", active: true, imdb: "tt39282718", query: "The Floor Fox game show" },
  { id: "love-on-the-spectrum-us", name: "Love on the Spectrum U.S.", aliases: ["love on the spectrum"], network: "Netflix", region: "us", genre: "dating", status: "returning", active: true, imdb: "tt19037550" },
  { id: "million-dollar-secret", name: "Million Dollar Secret", aliases: ["million dollar secret"], network: "Netflix", region: "us", genre: "competition", status: "airing", active: true, imdb: "tt32491422" },
  { id: "love-island-games", name: "Love Island Games", aliases: ["love island games"], network: "Peacock", region: "us", genre: "dating", status: "returning", active: true, imdb: "tt29380987" },
  { id: "the-real-housewives", name: "The Real Housewives", aliases: ["real housewives", "housewives"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt0888622" },
  { id: "rhobh", name: "RHO Beverly Hills", aliases: ["real housewives of beverly hills", "rhobh"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt1720601" },
  { id: "rhony", name: "RHO New York", aliases: ["real housewives of new york", "rhony"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt1135300" },
  { id: "rhoa", name: "RHO Atlanta", aliases: ["real housewives of atlanta", "rhoa"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt1457117" },
  { id: "rhoslc", name: "RHO Salt Lake City", aliases: ["real housewives of salt lake city", "rhoslc"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt12831140" },
  { id: "rhonj", name: "RHO New Jersey", aliases: ["real housewives of new jersey", "rhonj"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt1442462" },
  { id: "rhoc", name: "RHO Orange County", aliases: ["real housewives of orange county", "rhoc"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt0496337" },
  { id: "rhop", name: "RHO Potomac", aliases: ["real housewives of potomac", "rhop"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt5345408" },
  { id: "vanderpump-rules", name: "Vanderpump Rules", aliases: ["vanderpump rules", "vanderpump", "vpr"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt2637294" },
  { id: "vanderpump-villa", name: "Vanderpump Villa", aliases: ["vanderpump villa"], network: "Hulu", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt27999118" },
  { id: "below-deck", name: "Below Deck", aliases: ["below deck"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt2655516" },
  { id: "the-valley", name: "The Valley", aliases: ["the valley bravo", "summer house the valley"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt30972594" },
  { id: "summer-house", name: "Summer House", aliases: ["summer house"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt5588550" },
  { id: "southern-charm", name: "Southern Charm", aliases: ["southern charm"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt2815522" },
  { id: "married-to-medicine", name: "Married to Medicine", aliases: ["married to medicine"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt2922786" },
  { id: "the-kardashians", name: "The Kardashians", aliases: ["the kardashians", "kardashians", "kardashian", "kuwtk"], network: "Hulu", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt18351912" },
  { id: "the-ultimatum", name: "The Ultimatum", aliases: ["the ultimatum"], network: "Netflix", region: "us", genre: "dating", status: "returning", active: true, imdb: "tt16429340" },
  { id: "perfect-match", name: "Perfect Match", aliases: ["perfect match netflix"], network: "Netflix", region: "us", genre: "dating", status: "returning", active: true, imdb: "tt24640474" },
  { id: "too-hot-to-handle", name: "Too Hot to Handle", aliases: ["too hot to handle"], network: "Netflix", region: "us", genre: "dating", status: "returning", active: true, imdb: "tt11772636" },
  { id: "the-circle-us", name: "The Circle (US)", aliases: ["the circle netflix", "the circle us"], network: "Netflix", region: "us", genre: "competition", status: "returning", active: true, imdb: "tt9418812", query: "The Circle Netflix" },
  { id: "selling-sunset", name: "Selling Sunset", aliases: ["selling sunset"], network: "Netflix", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt9817298" },
  { id: "selling-the-oc", name: "Selling the OC", aliases: ["selling the oc"], network: "Netflix", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt15907000" },
  { id: "selling-the-city", name: "Selling the City", aliases: ["selling the city"], network: "Netflix", region: "us", genre: "docusoap", status: "airing", active: true, imdb: "tt32501221" },
  { id: "million-dollar-listing-la", name: "Million Dollar Listing Los Angeles", aliases: ["million dollar listing"], network: "Bravo", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt0815063" },
  { id: "queer-eye", name: "Queer Eye", aliases: ["queer eye"], network: "Netflix", region: "us", genre: "makeover", status: "returning", active: true, imdb: "tt7378148" },
  { id: "90-day-fiance", name: "90 Day Fiancé", aliases: ["90 day fiance", "90 day fiancé", "90 day fiance"], network: "TLC", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt3589170" },
  { id: "sister-wives", name: "Sister Wives", aliases: ["sister wives"], network: "TLC", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt1716777" },
  { id: "1000-lb-sisters", name: "1000-lb Sisters", aliases: ["1000-lb sisters", "1000 lb sisters"], network: "TLC", region: "us", genre: "docusoap", status: "airing", active: true, imdb: "tt11617414" },
  { id: "welcome-to-plathville", name: "Welcome to Plathville", aliases: ["welcome to plathville"], network: "TLC", region: "us", genre: "docusoap", status: "airing", active: true, imdb: "tt11399498" },
  { id: "the-challenge", name: "The Challenge", aliases: ["the challenge mtv"], network: "MTV", region: "us", genre: "competition", status: "returning", active: true, imdb: "tt0290988", query: "The Challenge MTV" },
  { id: "jersey-shore", name: "Jersey Shore: Family Vacation", aliases: ["jersey shore"], network: "MTV", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt7211944" },
  { id: "married-at-first-sight-us", name: "Married at First Sight US", aliases: ["married at first sight us", "mafs us"], network: "Lifetime", region: "us", genre: "dating", status: "returning", active: true, imdb: "tt3922704" },
  { id: "love-and-hip-hop", name: "Love & Hip Hop", aliases: ["love & hip hop", "love and hip hop"], network: "VH1", region: "us", genre: "docusoap", status: "returning", active: true, imdb: "tt1982634" },
  { id: "the-traitors-us", name: "The Traitors US", aliases: ["the traitors us", "traitors us"], network: "Peacock", region: "us", genre: "competition", status: "returning", active: true, imdb: "tt21912886" },
  { id: "love-is-blind-us", name: "Love Is Blind (US)", aliases: ["love is blind us"], network: "Netflix", region: "us", genre: "dating", status: "returning", active: true, imdb: "tt10802170" },
  { id: "squid-game-the-challenge", name: "Squid Game: The Challenge", aliases: ["squid game the challenge", "squid game: the challenge"], network: "Netflix", region: "us", genre: "competition", status: "returning", active: true, imdb: "tt27668515" },

  // ───────────────────────────── United Kingdom ────────────────────────────
  { id: "love-island-uk", name: "Love Island UK", aliases: ["love island uk", "liuk"], network: "ITV", region: "uk", genre: "dating", status: "airing", active: true, imdb: "tt4837692" },
  { id: "love-island-all-stars", name: "Love Island: All Stars", aliases: ["love island all stars"], network: "ITV", region: "uk", genre: "dating", status: "returning", active: true },
  { id: "im-a-celebrity", name: "I'm a Celebrity… Get Me Out of Here!", aliases: ["i'm a celebrity", "im a celebrity", "i'm a celeb"], network: "ITV", region: "uk", genre: "survival", status: "returning", active: true, imdb: "tt0316549" },
  { id: "strictly-come-dancing", name: "Strictly Come Dancing", aliases: ["strictly come dancing", "strictly"], network: "BBC", region: "uk", genre: "talent", status: "returning", active: true, imdb: "tt0405037" },
  { id: "the-traitors-uk", name: "The Traitors UK", aliases: ["the traitors uk", "traitors uk"], network: "BBC", region: "uk", genre: "competition", status: "returning", active: true, imdb: "tt15557874" },
  { id: "big-brother-uk", name: "Big Brother UK", aliases: ["big brother uk", "bbuk"], network: "ITV", region: "uk", genre: "competition", status: "returning", active: true, imdb: "tt0218531" },
  { id: "celebrity-big-brother-uk", name: "Celebrity Big Brother UK", aliases: ["celebrity big brother"], network: "ITV", region: "uk", genre: "competition", status: "returning", active: true, imdb: "tt0349601" },
  { id: "great-british-bake-off", name: "The Great British Bake Off", aliases: ["great british bake off", "bake off", "gbbo"], network: "Channel 4", region: "uk", genre: "cooking", status: "returning", active: true, imdb: "tt1877368" },
  { id: "bake-off-the-professionals", name: "Bake Off: The Professionals", aliases: ["bake off the professionals"], network: "Channel 4", region: "uk", genre: "cooking", status: "airing", active: true, imdb: "tt15786284" },
  { id: "masterchef-uk", name: "MasterChef UK", aliases: ["masterchef uk"], network: "BBC", region: "uk", genre: "cooking", status: "returning", active: true, imdb: "tt0426697" },
  { id: "britains-got-talent", name: "Britain's Got Talent", aliases: ["britain's got talent", "britains got talent"], network: "ITV", region: "uk", genre: "talent", status: "returning", active: true, imdb: "tt0975162" },
  { id: "the-voice-uk", name: "The Voice UK", aliases: ["the voice uk"], network: "ITV", region: "uk", genre: "talent", status: "returning", active: true, imdb: "tt2206668" },
  { id: "drag-race-uk", name: "RuPaul's Drag Race UK", aliases: ["drag race uk", "rupaul's drag race uk"], network: "BBC Three", region: "uk", genre: "competition", status: "returning", active: true, imdb: "tt9780442" },
  { id: "drag-race-uk-vs-the-world", name: "RuPaul's Drag Race UK vs the World", aliases: ["drag race uk vs the world", "uk vs the world"], network: "BBC Three", region: "uk", genre: "competition", status: "airing", active: true, imdb: "tt16968320" },
  { id: "married-at-first-sight-uk", name: "Married at First Sight UK", aliases: ["married at first sight uk", "mafs uk"], network: "Channel 4", region: "uk", genre: "dating", status: "returning", active: true, imdb: "tt8716522" },
  { id: "gogglebox", name: "Gogglebox", aliases: ["gogglebox"], network: "Channel 4", region: "uk", genre: "docusoap", status: "airing", active: true, imdb: "tt3022098" },
  { id: "the-apprentice-uk", name: "The Apprentice UK", aliases: ["the apprentice uk"], network: "BBC", region: "uk", genre: "competition", status: "returning", active: true, imdb: "tt0497671", query: "The Apprentice UK BBC" },
  { id: "celebs-go-dating", name: "Celebs Go Dating", aliases: ["celebs go dating"], network: "E4", region: "uk", genre: "dating", status: "airing", active: true, imdb: "tt5993484" },
  { id: "first-dates-uk", name: "First Dates", aliases: ["first dates uk", "first dates hotel"], network: "Channel 4", region: "uk", genre: "dating", status: "returning", active: true, imdb: "tt2980110" },
  { id: "hunted-uk", name: "Hunted", aliases: ["hunted uk", "celebrity hunted"], network: "Channel 4", region: "uk", genre: "survival", status: "returning", active: true, imdb: "tt5038678" },
  { id: "great-british-sewing-bee", name: "The Great British Sewing Bee", aliases: ["great british sewing bee", "sewing bee"], network: "BBC One", region: "uk", genre: "competition", status: "upcoming", active: true, imdb: "tt3010856" },
  { id: "geordie-shore", name: "Geordie Shore", aliases: ["geordie shore"], network: "MTV UK", region: "uk", genre: "docusoap", status: "returning", active: true, imdb: "tt1969313" },
  { id: "made-in-chelsea", name: "Made in Chelsea", aliases: ["made in chelsea"], network: "E4", region: "uk", genre: "docusoap", status: "returning", active: true, imdb: "tt1900045" },
  { id: "towie", name: "The Only Way Is Essex", aliases: ["the only way is essex", "towie"], network: "ITVBe", region: "uk", genre: "docusoap", status: "returning", active: true, imdb: "tt1701701" },
  { id: "ex-on-the-beach-uk", name: "Celebrity Ex on the Beach", aliases: ["ex on the beach", "celebrity ex on the beach"], network: "MTV UK", region: "uk", genre: "dating", status: "upcoming", active: true, imdb: "tt26862164" },
  { id: "race-across-the-world", name: "Race Across the World", aliases: ["race across the world"], network: "BBC", region: "uk", genre: "competition", status: "returning", active: true, imdb: "tt9491546" },
  { id: "dancing-on-ice", name: "Dancing on Ice", aliases: ["dancing on ice"], network: "ITV", region: "uk", genre: "talent", status: "returning", active: true, imdb: "tt0488145" },
  { id: "sas-who-dares-wins", name: "SAS: Who Dares Wins", aliases: ["sas who dares wins"], network: "Channel 4", region: "uk", genre: "survival", status: "returning", active: true, imdb: "tt5172252" },

  // ───────────────────────────────── India ─────────────────────────────────
  { id: "bigg-boss", name: "Bigg Boss", aliases: ["bigg boss", "big boss", "bigg boss hindi"], network: "Colors / JioCinema", region: "india", genre: "competition", status: "returning", active: true, imdb: "tt1166091" },
  { id: "bigg-boss-ott", name: "Bigg Boss OTT", aliases: ["bigg boss ott"], network: "JioCinema", region: "india", genre: "competition", status: "returning", active: true },
  { id: "bigg-boss-tamil", name: "Bigg Boss Tamil", aliases: ["bigg boss tamil"], network: "Star Vijay", region: "india", genre: "competition", status: "returning", active: true },
  { id: "bigg-boss-telugu", name: "Bigg Boss Telugu", aliases: ["bigg boss telugu"], network: "Star Maa", region: "india", genre: "competition", status: "returning", active: true },
  { id: "bigg-boss-kannada", name: "Bigg Boss Kannada", aliases: ["bigg boss kannada"], network: "Colors Kannada", region: "india", genre: "competition", status: "returning", active: true },
  { id: "bigg-boss-marathi", name: "Bigg Boss Marathi", aliases: ["bigg boss marathi"], network: "Colors Marathi", region: "india", genre: "competition", status: "returning", active: true },
  { id: "bigg-boss-malayalam", name: "Bigg Boss Malayalam", aliases: ["bigg boss malayalam"], network: "Asianet", region: "india", genre: "competition", status: "returning", active: true },
  { id: "indian-idol", name: "Indian Idol", aliases: ["indian idol"], network: "Sony", region: "india", genre: "talent", status: "returning", active: true, imdb: "tt5707909" },
  { id: "khatron-ke-khiladi", name: "Khatron Ke Khiladi", aliases: ["khatron ke khiladi", "khatron"], network: "Colors", region: "india", genre: "survival", status: "returning", active: true, imdb: "tt1525023" },
  { id: "indias-best-dancer", name: "India's Best Dancer", aliases: ["india's best dancer", "indias best dancer"], network: "Sony", region: "india", genre: "talent", status: "returning", active: true },
  { id: "super-dancer", name: "Super Dancer", aliases: ["super dancer"], network: "Sony", region: "india", genre: "talent", status: "returning", active: true },
  { id: "saregamapa", name: "Sa Re Ga Ma Pa", aliases: ["sa re ga ma pa", "saregamapa"], network: "Zee TV", region: "india", genre: "talent", status: "returning", active: true },
  { id: "jhalak-dikhhla-jaa", name: "Jhalak Dikhhla Jaa", aliases: ["jhalak dikhhla jaa", "jhalak dikhla ja", "jhalak"], network: "Colors", region: "india", genre: "talent", status: "returning", active: true },
  { id: "masterchef-india", name: "MasterChef India", aliases: ["masterchef india"], network: "Sony", region: "india", genre: "cooking", status: "returning", active: true },
  { id: "roadies", name: "Roadies", aliases: ["mtv roadies", "roadies"], network: "MTV India", region: "india", genre: "competition", status: "returning", active: true },
  { id: "splitsvilla", name: "Splitsvilla", aliases: ["splitsvilla"], network: "MTV India", region: "india", genre: "dating", status: "returning", active: true },
  { id: "shark-tank-india", name: "Shark Tank India", aliases: ["shark tank india"], network: "Sony LIV", region: "india", genre: "other", status: "airing", active: true, imdb: "tt16385150" },
  { id: "the-traitors-india", name: "The Traitors India", aliases: ["the traitors india", "traitors india", "the traitors hindi"], network: "Prime Video", region: "india", genre: "competition", status: "returning", active: true, imdb: "tt33347879" },
  { id: "indias-got-latent", name: "India's Got Latent", aliases: ["india's got latent", "indias got latent", "igl"], network: "YouTube / Prime Video", region: "india", genre: "talent", status: "airing", active: true, imdb: "tt33094114" },
  { id: "indias-got-talent", name: "India's Got Talent", aliases: ["india's got talent", "indias got talent"], network: "Sony", region: "india", genre: "talent", status: "returning", active: true, imdb: "tt4197638" },
  { id: "mtv-hustle", name: "MTV Hustle", aliases: ["mtv hustle", "hip hop don't stop"], network: "MTV India", region: "india", genre: "talent", status: "returning", active: true, imdb: "tt10978626" },
  { id: "superstar-singer", name: "Superstar Singer", aliases: ["superstar singer"], network: "Sony", region: "india", genre: "talent", status: "returning", active: true, imdb: "tt10787082" },
  { id: "dance-deewane", name: "Dance Deewane", aliases: ["dance deewane"], network: "Colors", region: "india", genre: "talent", status: "returning", active: true, imdb: "tt8448644" },
  { id: "temptation-island-india", name: "Temptation Island India", aliases: ["temptation island india"], network: "JioCinema", region: "india", genre: "dating", status: "returning", active: true, imdb: "tt29418391" },
  { id: "laughter-chefs", name: "Laughter Chefs", aliases: ["laughter chefs"], network: "Colors", region: "india", genre: "other", status: "returning", active: true },

  // ─────────────────────────────── Australia & NZ ──────────────────────────
  { id: "mafs-australia", name: "Married at First Sight Australia", aliases: ["married at first sight australia", "mafs australia", "mafs au"], network: "Nine", region: "australia", genre: "dating", status: "returning", active: true, imdb: "tt4938404" },
  { id: "masterchef-australia", name: "MasterChef Australia", aliases: ["masterchef australia"], network: "Ten", region: "australia", genre: "cooking", status: "airing", active: true, imdb: "tt1399495" },
  { id: "australian-survivor", name: "Australian Survivor", aliases: ["australian survivor", "survivor australia"], network: "Ten", region: "australia", genre: "survival", status: "returning", active: true, imdb: "tt5712822" },
  { id: "the-block", name: "The Block", aliases: ["the block australia", "the block nine"], network: "Nine", region: "australia", genre: "makeover", status: "returning", active: true, imdb: "tt0405957", query: "The Block Australia renovation" },
  { id: "big-brother-australia", name: "Big Brother Australia", aliases: ["big brother australia", "bbau"], network: "Seven", region: "australia", genre: "competition", status: "returning", active: true, imdb: "tt0290985" },
  { id: "love-island-australia", name: "Love Island Australia", aliases: ["love island australia", "love island au"], network: "Nine", region: "australia", genre: "dating", status: "returning", active: true, imdb: "tt8434752" },
  { id: "the-bachelor-australia", name: "The Bachelor Australia", aliases: ["the bachelor australia", "bachelor australia"], network: "Ten", region: "australia", genre: "dating", status: "returning", active: true, imdb: "tt3155242" },
  { id: "im-a-celebrity-australia", name: "I'm a Celebrity Australia", aliases: ["i'm a celebrity australia", "im a celebrity australia"], network: "Ten", region: "australia", genre: "survival", status: "returning", active: true, imdb: "tt4280412" },
  { id: "the-voice-australia", name: "The Voice Australia", aliases: ["the voice australia"], network: "Seven", region: "australia", genre: "talent", status: "returning", active: true, imdb: "tt2272863" },
  { id: "australian-idol", name: "Australian Idol", aliases: ["australian idol"], network: "Seven", region: "australia", genre: "talent", status: "returning", active: true, imdb: "tt0382400" },
  { id: "my-kitchen-rules", name: "My Kitchen Rules", aliases: ["my kitchen rules", "mkr"], network: "Seven", region: "australia", genre: "cooking", status: "returning", active: true, imdb: "tt1657505" },
  { id: "farmer-wants-a-wife-au", name: "Farmer Wants a Wife", aliases: ["farmer wants a wife"], network: "Seven", region: "australia", genre: "dating", status: "returning", active: true, imdb: "tt1037884" },
  { id: "sas-australia", name: "SAS Australia", aliases: ["sas australia"], network: "Seven", region: "australia", genre: "survival", status: "returning", active: true, imdb: "tt13328280" },
  { id: "lego-masters-australia", name: "Lego Masters Australia", aliases: ["lego masters australia"], network: "Nine", region: "australia", genre: "competition", status: "returning", active: true, imdb: "tt10285320" },
  { id: "gogglebox-australia", name: "Gogglebox Australia", aliases: ["gogglebox australia"], network: "Ten / Foxtel", region: "australia", genre: "docusoap", status: "airing", active: true, imdb: "tt4437104" },
  { id: "travel-guides", name: "Travel Guides", aliases: ["travel guides australia"], network: "Nine", region: "australia", genre: "docusoap", status: "returning", active: true, imdb: "tt6740738" },
  { id: "the-summit-au", name: "The Summit", aliases: ["the summit australia"], network: "Nine", region: "australia", genre: "survival", status: "returning", active: true, imdb: "tt27710439" },
  { id: "the-traitors-australia", name: "The Traitors Australia", aliases: ["the traitors australia", "traitors australia"], network: "Ten", region: "australia", genre: "competition", status: "returning", active: true, imdb: "tt28088954" },
  { id: "celebrity-treasure-island-nz", name: "Celebrity Treasure Island (NZ)", aliases: ["celebrity treasure island", "treasure island nz"], network: "TVNZ 2", region: "australia", genre: "survival", status: "airing", active: true, imdb: "tt0281500" },
  { id: "the-traitors-nz", name: "The Traitors NZ", aliases: ["the traitors nz", "the traitors new zealand"], network: "Three", region: "australia", genre: "competition", status: "returning", active: true },

  // ──────────────────────────────── Canada ─────────────────────────────────
  { id: "big-brother-canada", name: "Big Brother Canada", aliases: ["big brother canada", "bbcan"], network: "Global", region: "canada", genre: "competition", status: "returning", active: true, imdb: "tt2545458" },
  { id: "the-traitors-canada", name: "The Traitors Canada", aliases: ["the traitors canada", "traitors canada"], network: "CTV", region: "canada", genre: "competition", status: "returning", active: true, imdb: "tt27708328" },
  { id: "masterchef-canada", name: "MasterChef Canada", aliases: ["masterchef canada"], network: "CTV", region: "canada", genre: "cooking", status: "returning", active: true, imdb: "tt3551096" },
  { id: "canadas-got-talent", name: "Canada's Got Talent", aliases: ["canada's got talent", "canadas got talent"], network: "Citytv", region: "canada", genre: "talent", status: "returning", active: true, imdb: "tt2098883" },
  { id: "canadas-drag-race", name: "Canada's Drag Race", aliases: ["canada's drag race", "canadas drag race"], network: "Crave", region: "canada", genre: "competition", status: "returning", active: true, imdb: "tt11772846" },
  { id: "top-chef-canada", name: "Top Chef Canada", aliases: ["top chef canada"], network: "Food Network", region: "canada", genre: "cooking", status: "returning", active: true, imdb: "tt1826764" },
  { id: "amazing-race-canada", name: "The Amazing Race Canada", aliases: ["the amazing race canada", "amazing race canada"], network: "CTV", region: "canada", genre: "competition", status: "returning", active: true, imdb: "tt2960280" },

  // ───────────────────────────────── Brazil ────────────────────────────────
  { id: "big-brother-brasil", name: "Big Brother Brasil", aliases: ["big brother brasil", "big brother brazil", "bbb"], network: "Globo", region: "brazil", genre: "competition", status: "airing", active: true, imdb: "tt0315288" },
  { id: "a-fazenda", name: "A Fazenda", aliases: ["a fazenda", "the farm brazil"], network: "Record", region: "brazil", genre: "competition", status: "upcoming", active: true, imdb: "tt1842561" },
  { id: "masterchef-brasil", name: "MasterChef Brasil", aliases: ["masterchef brasil", "masterchef brazil"], network: "Band", region: "brazil", genre: "cooking", status: "airing", active: true, imdb: "tt5037502" },
  { id: "masterchef-confeitaria", name: "MasterChef Confeitaria", aliases: ["masterchef confeitaria"], network: "Band", region: "brazil", genre: "cooking", status: "returning", active: true, imdb: "tt33225527" },
  { id: "casamento-as-cegas-brasil", name: "Casamento às Cegas: Brasil", aliases: ["casamento às cegas brasil", "love is blind brazil"], network: "Netflix Brasil", region: "brazil", genre: "dating", status: "returning", active: true, imdb: "tt15018224" },
  { id: "estrela-da-casa", name: "Estrela da Casa", aliases: ["estrela da casa"], network: "Globo", region: "brazil", genre: "talent", status: "returning", active: true, imdb: "tt29565262" },
  { id: "de-ferias-com-o-ex-brasil", name: "De Férias com o Ex Brasil", aliases: ["de férias com o ex", "ex on the beach brazil"], network: "MTV Brasil", region: "brazil", genre: "dating", status: "returning", active: true, imdb: "tt8470764" },
  { id: "tunel-do-amor", name: "Túnel do Amor", aliases: ["túnel do amor", "tunel do amor"], network: "Multishow", region: "brazil", genre: "dating", status: "airing", active: true, imdb: "tt21922614" },
  { id: "largados-e-pelados-brasil", name: "Largados e Pelados Brasil", aliases: ["largados e pelados", "naked and afraid brazil"], network: "Discovery+ / Max", region: "brazil", genre: "survival", status: "returning", active: true, imdb: "tt16174892" },

  // ───────────────────────────────── Mexico ────────────────────────────────
  { id: "la-casa-de-los-famosos-mexico", name: "La Casa de los Famosos México", aliases: ["la casa de los famosos méxico", "la casa de los famosos mexico", "lcdlfmx"], network: "TelevisaUnivision / ViX", region: "mexico", genre: "competition", status: "upcoming", active: true, imdb: "tt27786984" },
  { id: "masterchef-mexico", name: "MasterChef México", aliases: ["masterchef méxico", "masterchef mexico"], network: "TV Azteca", region: "mexico", genre: "cooking", status: "airing", active: true, imdb: "tt4959092" },
  { id: "exatlon-mexico", name: "Exatlón México", aliases: ["exatlón méxico", "exatlon mexico"], network: "TV Azteca", region: "mexico", genre: "competition", status: "airing", active: true, imdb: "tt8060752" },
  { id: "survivor-mexico", name: "Survivor México", aliases: ["survivor méxico", "survivor mexico"], network: "TV Azteca", region: "mexico", genre: "survival", status: "upcoming", active: true, imdb: "tt14403694" },
  { id: "la-voz-mexico", name: "La Voz México", aliases: ["la voz méxico", "la voz mexico"], network: "TV Azteca", region: "mexico", genre: "talent", status: "returning", active: true, imdb: "tt13777486" },
  { id: "quien-es-la-mascara", name: "¿Quién es la máscara?", aliases: ["quién es la máscara", "quien es la mascara", "the masked singer mexico"], network: "TelevisaUnivision", region: "mexico", genre: "talent", status: "returning", active: true, imdb: "tt10912522" },
  { id: "mazatlan-shore", name: "Mazatlán Shore", aliases: ["mazatlán shore", "mazatlan shore"], network: "MTV / Paramount+", region: "mexico", genre: "docusoap", status: "airing", active: true, imdb: "tt29248161" },

  // ─────────────────────────────── Argentina ───────────────────────────────
  { id: "gran-hermano-argentina", name: "Gran Hermano Argentina", aliases: ["gran hermano argentina", "big brother argentina"], network: "Telefe", region: "argentina", genre: "competition", status: "airing", active: true, imdb: "tt0281446" },
  { id: "masterchef-celebrity-argentina", name: "MasterChef Celebrity Argentina", aliases: ["masterchef celebrity argentina", "masterchef celebrity"], network: "Telefe", region: "argentina", genre: "cooking", status: "airing", active: true, imdb: "tt13398890" },
  { id: "cuestion-de-peso", name: "Cuestión de Peso", aliases: ["cuestión de peso", "cuestion de peso"], network: "eltrece", region: "argentina", genre: "makeover", status: "airing", active: true, imdb: "tt0840834" },

  // ───────────────────── Latin America (Spanish, pan-regional) ──────────────
  { id: "la-casa-de-los-famosos-telemundo", name: "La Casa de los Famosos (Telemundo)", aliases: ["la casa de los famosos telemundo", "lcdlf telemundo", "la casa de los famosos all-stars"], network: "Telemundo", region: "latam", genre: "competition", status: "returning", active: true, imdb: "tt16022138" },
  { id: "la-casa-de-los-famosos-colombia", name: "La Casa de los Famosos Colombia", aliases: ["la casa de los famosos colombia"], network: "Canal RCN", region: "latam", genre: "competition", status: "returning", active: true, imdb: "tt30308872" },
  { id: "exatlon-estados-unidos", name: "Exatlón Estados Unidos", aliases: ["exatlón estados unidos", "exatlon estados unidos", "exatlon eeuu"], network: "Telemundo", region: "latam", genre: "competition", status: "returning", active: true, imdb: "tt8692550" },
  { id: "top-chef-vip", name: "Top Chef VIP", aliases: ["top chef vip"], network: "Telemundo", region: "latam", genre: "cooking", status: "returning", active: true, imdb: "tt21959284" },

  // ───────────────────────────────── Spain ─────────────────────────────────
  { id: "gran-hermano-duo", name: "Gran Hermano Dúo", aliases: ["gran hermano dúo", "gran hermano duo", "big brother spain"], network: "Telecinco", region: "spain", genre: "docusoap", status: "returning", active: true, imdb: "tt9473208" },
  { id: "la-isla-de-las-tentaciones", name: "La Isla de las Tentaciones", aliases: ["la isla de las tentaciones", "temptation island spain"], network: "Telecinco", region: "spain", genre: "dating", status: "airing", active: true, imdb: "tt10225276" },
  { id: "got-talent-espana", name: "Got Talent España", aliases: ["got talent españa", "got talent espana", "spain's got talent"], network: "Telecinco", region: "spain", genre: "talent", status: "returning", active: true, imdb: "tt5651816" },
  { id: "drag-race-espana", name: "Drag Race España", aliases: ["drag race españa", "drag race espana", "drag race spain"], network: "Atresplayer", region: "spain", genre: "competition", status: "returning", active: true, imdb: "tt13606528" },

  // ──────────────────────────────── Germany ────────────────────────────────
  { id: "germanys-next-topmodel", name: "Germany's Next Topmodel", aliases: ["germany's next topmodel", "germanys next topmodel", "gntm"], network: "ProSieben", region: "germany", genre: "competition", status: "returning", active: true, imdb: "tt0764947" },
  { id: "promi-big-brother", name: "Promi Big Brother", aliases: ["promi big brother", "celebrity big brother germany"], network: "Sat.1", region: "germany", genre: "docusoap", status: "upcoming", active: true, imdb: "tt3231552" },
  { id: "die-bachelors", name: "Die Bachelors", aliases: ["die bachelors", "der bachelor", "the bachelor germany"], network: "RTL", region: "germany", genre: "dating", status: "airing", active: true, imdb: "tt2235521" },

  // ───────────────────────────────── France ────────────────────────────────
  { id: "drag-race-france", name: "Drag Race France", aliases: ["drag race france"], network: "France.tv", region: "france", genre: "competition", status: "airing", active: true, imdb: "tt20871052" },

  // ───────────────────────────────── Italy ─────────────────────────────────
  { id: "temptation-island-italia", name: "Temptation Island Italia", aliases: ["temptation island italia"], network: "Canale 5", region: "italy", genre: "dating", status: "airing", active: true },
  { id: "drag-race-italia", name: "Drag Race Italia", aliases: ["drag race italia", "drag race italy"], network: "Paramount+", region: "italy", genre: "competition", status: "returning", active: true, imdb: "tt15940712" },

  // ───────────────────────── Sweden / Netherlands ──────────────────────────
  { id: "love-island-sverige", name: "Love Island Sverige", aliases: ["love island sverige", "love island sweden"], network: "TV4", region: "sweden", genre: "dating", status: "airing", active: true, imdb: "tt8877640" },
  { id: "de-mol", name: "De Mol", aliases: ["de mol", "wie is de mol"], network: "Play4 / NPO", region: "netherlands", genre: "competition", status: "returning", active: true },

  // ───────────────────────────────── Nigeria ───────────────────────────────
  { id: "big-brother-naija", name: "Big Brother Naija", aliases: ["big brother naija", "bbnaija", "big brother nigeria"], network: "Africa Magic / DStv", region: "nigeria", genre: "competition", status: "returning", active: true, imdb: "tt0843319" },
  { id: "nigerian-idol", name: "Nigerian Idol", aliases: ["nigerian idol"], network: "Africa Magic / DStv", region: "nigeria", genre: "talent", status: "returning", active: true, imdb: "tt6020598" },
  { id: "the-voice-nigeria", name: "The Voice Nigeria", aliases: ["the voice nigeria"], network: "Africa Magic / DStv", region: "nigeria", genre: "talent", status: "returning", active: true, imdb: "tt8227608" },
  { id: "masterchef-nigeria", name: "MasterChef Nigeria", aliases: ["masterchef nigeria"], network: "Africa Magic", region: "nigeria", genre: "cooking", status: "airing", active: true },

  // ─────────────────────────────── South Africa ────────────────────────────
  { id: "big-brother-mzansi", name: "Big Brother Mzansi", aliases: ["big brother mzansi", "bbmzansi", "big brother south africa"], network: "Mzansi Magic / DStv", region: "south-africa", genre: "competition", status: "airing", active: true, imdb: "tt11790136" },
  { id: "survivor-south-africa", name: "Survivor South Africa", aliases: ["survivor south africa", "survivor sa"], network: "M-Net / DStv", region: "south-africa", genre: "survival", status: "returning", active: true, imdb: "tt5917270" },
  { id: "masterchef-south-africa", name: "MasterChef South Africa", aliases: ["masterchef south africa", "masterchef sa"], network: "e.tv", region: "south-africa", genre: "cooking", status: "airing", active: true, imdb: "tt2605196" },
  { id: "date-my-family", name: "Date My Family", aliases: ["date my family"], network: "Mzansi Magic / DStv", region: "south-africa", genre: "dating", status: "returning", active: true, imdb: "tt32089786" },
  { id: "young-famous-and-african", name: "Young, Famous & African", aliases: ["young famous & african", "young famous and african"], network: "Netflix", region: "south-africa", genre: "docusoap", status: "returning", active: true, imdb: "tt15302054" },

  // ───────────────────────────────── Türkiye ───────────────────────────────
  { id: "survivor-turkey", name: "Survivor Türkiye", aliases: ["survivor türkiye", "survivor turkiye", "survivor all star"], network: "TV8", region: "turkey", genre: "survival", status: "airing", active: true, imdb: "tt38990552" },
  { id: "masterchef-turkey", name: "MasterChef Türkiye", aliases: ["masterchef türkiye", "masterchef turkiye", "masterchef turkey"], network: "TV8", region: "turkey", genre: "cooking", status: "airing", active: true, imdb: "tt9035628" },
  { id: "o-ses-turkiye", name: "O Ses Türkiye", aliases: ["o ses türkiye", "o ses turkiye", "the voice turkey"], network: "TV8", region: "turkey", genre: "talent", status: "returning", active: true, imdb: "tt8960548" },
  { id: "yetenek-sizsiniz", name: "Yetenek Sizsiniz Türkiye", aliases: ["yetenek sizsiniz", "turkey's got talent"], network: "TV8", region: "turkey", genre: "talent", status: "returning", active: true, imdb: "tt9089698" },
  { id: "exatlon-turkey", name: "Exatlon Türkiye", aliases: ["exatlon türkiye", "exatlon turkiye"], network: "TV8", region: "turkey", genre: "competition", status: "returning", active: true, imdb: "tt11286902" },
  { id: "kismetse-olur", name: "Kısmetse Olur", aliases: ["kısmetse olur", "kismetse olur"], network: "TV8.5", region: "turkey", genre: "dating", status: "airing", active: true, imdb: "tt24060116" },

  // ─────────────────────────── Middle East / Arab ──────────────────────────
  { id: "mbc-the-voice", name: "MBC The Voice (Ahla Sawt)", aliases: ["the voice ahla sawt", "the voice arabia", "mbc the voice"], network: "MBC", region: "mena", genre: "talent", status: "airing", active: true, imdb: "tt5442458" },
  { id: "arabs-got-talent", name: "Arabs' Got Talent", aliases: ["arabs got talent", "arabs' got talent"], network: "MBC", region: "mena", genre: "talent", status: "returning", active: true, imdb: "tt3240080" },
  { id: "top-chef-middle-east", name: "Top Chef Middle East", aliases: ["top chef middle east", "top chef arabia"], network: "MBC", region: "mena", genre: "cooking", status: "returning", active: true, imdb: "tt13944898" },
  { id: "arab-idol", name: "Arab Idol", aliases: ["arab idol"], network: "MBC", region: "mena", genre: "talent", status: "upcoming", active: true, imdb: "tt2318873" },

  // ───────────────────────────── South Korea ───────────────────────────────
  { id: "singles-inferno", name: "Single's Inferno", aliases: ["single's inferno", "singles inferno"], network: "Netflix", region: "korea", genre: "dating", status: "airing", active: true, imdb: "tt16283666" },
  { id: "physical-100", name: "Physical: 100", aliases: ["physical 100", "physical: 100"], network: "Netflix", region: "korea", genre: "survival", status: "returning", active: true, imdb: "tt25274446" },
  { id: "culinary-class-wars", name: "Culinary Class Wars", aliases: ["culinary class wars", "black & white chef"], network: "Netflix", region: "korea", genre: "cooking", status: "returning", active: true, imdb: "tt33040785" },
  { id: "the-devils-plan", name: "The Devil's Plan", aliases: ["the devil's plan", "devils plan"], network: "Netflix", region: "korea", genre: "competition", status: "returning", active: true, imdb: "tt27995115" },
  { id: "i-am-solo", name: "I Am Solo", aliases: ["i am solo", "i'm solo", "na honja solo"], network: "SBS Plus / ENA", region: "korea", genre: "dating", status: "airing", active: true, imdb: "tt31956936" },
  { id: "exchange", name: "EXchange", aliases: ["exchange transit love", "transit love", "hwanseung yeonae"], network: "TVING", region: "korea", genre: "dating", status: "returning", active: true, imdb: "tt28893202" },
  { id: "better-late-than-single", name: "Better Late Than Single", aliases: ["better late than single", "motae-solo"], network: "Netflix", region: "korea", genre: "dating", status: "returning", active: true, imdb: "tt35668156" },

  // ───────────────────────────────── Japan ─────────────────────────────────
  { id: "love-village", name: "Love Village", aliases: ["love village"], network: "Netflix", region: "japan", genre: "docusoap", status: "returning", active: true, imdb: "tt19106798" },

  // ─────────────────────────────── Indonesia ───────────────────────────────
  { id: "masterchef-indonesia", name: "MasterChef Indonesia", aliases: ["masterchef indonesia"], network: "RCTI", region: "indonesia", genre: "cooking", status: "returning", active: true, imdb: "tt2277854" },
  { id: "x-factor-indonesia", name: "The X Factor Indonesia", aliases: ["x factor indonesia"], network: "RCTI", region: "indonesia", genre: "talent", status: "returning", active: true, imdb: "tt2658396" },

  // ─────────────────────────────── Philippines ─────────────────────────────
  { id: "pinoy-big-brother", name: "Pinoy Big Brother", aliases: ["pinoy big brother", "pbb"], network: "ABS-CBN / Kapamilya", region: "philippines", genre: "docusoap", status: "returning", active: true, imdb: "tt0479336" },
  { id: "drag-race-philippines", name: "Drag Race Philippines", aliases: ["drag race philippines", "drag race ph"], network: "HBO / WOW", region: "philippines", genre: "competition", status: "returning", active: true, imdb: "tt15245094" },

  // ───────────────────────────────── Thailand ──────────────────────────────
  { id: "drag-race-thailand", name: "Drag Race Thailand", aliases: ["drag race thailand"], network: "WOW / Fullhouse", region: "thailand", genre: "competition", status: "returning", active: true, imdb: "tt7939808" },

  // ───────────────────────────────── Vietnam ───────────────────────────────
  { id: "vietnam-idol", name: "Vietnam Idol", aliases: ["vietnam idol"], network: "VTV3", region: "vietnam", genre: "talent", status: "returning", active: true, imdb: "tt1245442" },
  { id: "2-days-1-night-vietnam", name: "2 Days 1 Night Vietnam", aliases: ["2 days 1 night vietnam", "2 ngày 1 đêm", "2 ngay 1 dem"], network: "HTV7 / Vie", region: "vietnam", genre: "survival", status: "returning", active: true, imdb: "tt39385751" },

  // ───────────────────────────────── Malaysia ──────────────────────────────
  { id: "gegar-vaganza", name: "Gegar Vaganza", aliases: ["gegar vaganza"], network: "Astro Ria", region: "malaysia", genre: "talent", status: "returning", active: true, imdb: "tt35434010" },
];

// Re-anchor IMDb ids to the resolver's corrections (golden source) where present.
for (const s of SHOWS) {
  const corrected = (IMDB_OVERRIDES as Record<string, string>)[s.id];
  if (corrected) s.imdb = corrected;
}

export const SHOW_BY_ID: Map<string, Show> = new Map(SHOWS.map((s) => [s.id, s]));

const STATUS_PRIORITY: Record<ShowStatus, number> = {
  airing: 0,
  upcoming: 1,
  returning: 2,
  ended: 3,
};

/** Shows we actively fetch/show news for. */
export function getActiveShows(): Show[] {
  return SHOWS.filter((s) => s.active);
}

/** Active shows in a given country. */
export function showsInRegion(region: RegionSlug): Show[] {
  return getActiveShows().filter((s) => s.region === region);
}

/**
 * Selectable countries for onboarding: every country (not "global") that has at
 * least one active show, ordered by continent group then label. "Global / All"
 * is appended by the caller.
 */
export function getSelectableCountries(): {
  region: RegionSlug;
  label: string;
  group: string;
}[] {
  const withShows = new Set<RegionSlug>();
  for (const s of getActiveShows()) {
    if (s.region !== "global") withShows.add(s.region);
  }
  return Array.from(withShows)
    .map((region) => ({ region, ...COUNTRY_META[region] }))
    .sort((a, b) => a.group.localeCompare(b.group) || a.label.localeCompare(b.label));
}

/** Best show to label an article with: prefer a specific country over the umbrella. */
export function primaryShow(ids: string[] | undefined): Show | null {
  if (!ids?.length) return null;
  const shows = ids.map((id) => SHOW_BY_ID.get(id)).filter((s): s is Show => Boolean(s));
  if (shows.length === 0) return null;
  return shows.find((s) => s.region !== "global") ?? shows[0];
}

/** Distinct country regions for a set of matched show ids (excludes "global"). */
export function regionsForShows(ids: string[] | undefined): RegionSlug[] {
  if (!ids?.length) return [];
  const out = new Set<RegionSlug>();
  for (const id of ids) {
    const r = SHOW_BY_ID.get(id)?.region;
    if (r && r !== "global") out.add(r);
  }
  return Array.from(out);
}

/**
 * News-search queries derived from active shows, ordered so airing/upcoming
 * shows are searched first in the hourly rotation.
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
      country: COUNTRY_META[s.region]?.news,
    }));
}

// ── Article ↔ show matching ────────────────────────────────────────────────
const MIN_ALIAS_LEN = 4;

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

interface ShowMatcher {
  id: string;
  re: RegExp;
}

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
