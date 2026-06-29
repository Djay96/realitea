import type { Show, ShowStatus } from "./shows";
import { SHOWS } from "./shows";

/**
 * Weekly IMDb refresh — IMDb is the golden source.
 *
 * For every show that carries an IMDb id we ask OMDb (omdbapi.com, an
 * IMDb-derived API) for the title's current state and re-derive its status /
 * active flag from IMDb's year range. The result is a set of *overrides* the
 * app applies on top of the committed seed catalog, so an ended show stops
 * appearing without a redeploy.
 *
 * Limitation: OMDb looks up by id; it can't browse IMDb by genre, so this keeps
 * KNOWN shows fresh (ended ↔ ongoing) but does not discover brand-new shows.
 * New shows are added by appending their IMDb id to SHOWS in lib/shows.ts.
 */

export interface OmdbResponse {
  Response: string;
  Title?: string;
  Year?: string; // e.g. "2009–" (ongoing), "2014–2023" (ended), "2023" (single)
  Type?: string; // "series"
  totalSeasons?: string;
  Error?: string;
}

export interface ShowUpdate {
  id: string;
  name: string;
  imdb: string;
  year?: string;
  before: { status: ShowStatus; active: boolean };
  after: { status: ShowStatus; active: boolean };
  reason: string;
}

export interface ShowMismatch {
  id: string;
  name: string;
  imdb: string;
  imdbTitle?: string;
  year?: string;
}

export interface RefreshResult {
  checked: number;
  failed: number;
  skipped: number;
  updates: ShowUpdate[];
  /** Ids whose OMDb title doesn't match our name (likely a wrong IMDb id) — reported, never applied. */
  mismatches: ShowMismatch[];
  /** id → override to persist (only for shows whose status/active changed). */
  overrides: Record<string, { status: ShowStatus; active: boolean; name: string }>;
}

/** Loose title match to guard against a wrong IMDb id resolving to another show. */
function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\(.*?\)/g, " ")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\b(the|of|a|and|reality|tv|show|us|uk)\b/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/** 0–1 distinct-token-overlap score between our name and a candidate title. */
export function titleScore(ourName: string, candidate: string | undefined): number {
  if (!candidate) return 0;
  const a = new Set(tokenize(ourName));
  const b = new Set(tokenize(candidate));
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const t of b) if (a.has(t)) shared += 1;
  return shared / Math.min(a.size, b.size);
}

/** True when our name and a candidate title are the SAME set of significant tokens. */
function exactTitle(ourName: string, candidate: string | undefined): boolean {
  if (!candidate) return false;
  const a = new Set(tokenize(ourName));
  const b = new Set(tokenize(candidate));
  if (a.size === 0 || a.size !== b.size) return false;
  for (const t of a) if (!b.has(t)) return false;
  return true;
}

export function titleMatches(ourName: string, omdbTitle: string | undefined): boolean {
  if (!omdbTitle) return false;
  if (tokenize(ourName).length === 0) return true; // nothing to compare on → don't block
  return titleScore(ourName, omdbTitle) >= 0.5;
}

interface OmdbSearchHit {
  Title: string;
  Year?: string;
  imdbID: string;
  Type?: string;
}

function startYear(year: string | undefined): number {
  const m = year?.match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : 0;
}

/**
 * Resolve the correct IMDb id for a show by searching OMDb by title.
 *
 * Conservative on purpose: only an EXACT significant-token title match counts,
 * and among exact matches we pick the OLDEST (the canonical original, not a
 * newer "…: Reunion"/"…: All Stars"/wrong-country spin-off). Returns null when
 * there's no exact match, so a fuzzy guess never overwrites a curated seed.
 */
export async function resolveImdbId(
  apiKey: string,
  name: string,
): Promise<{ imdb: string; title: string; year?: string; score: number } | null> {
  const query = name.replace(/\(.*?\)/g, " ").replace(/\s+/g, " ").trim();
  const url = `https://www.omdbapi.com/?apikey=${encodeURIComponent(apiKey)}&type=series&s=${encodeURIComponent(query)}`;
  let hits: OmdbSearchHit[] = [];
  try {
    const res = await fetch(url, { headers: { "User-Agent": "RealiTea/1.0" } });
    if (!res.ok) return null;
    const data = (await res.json()) as { Response: string; Search?: OmdbSearchHit[] };
    if (data.Response !== "True" || !data.Search?.length) return null;
    hits = data.Search;
  } catch {
    return null;
  }

  const exact = hits.filter((h) => exactTitle(name, h.Title));
  if (exact.length === 0) return null;
  exact.sort((a, b) => startYear(a.Year) - startYear(b.Year)); // oldest = canonical original
  const best = exact[0];
  return { imdb: best.imdbID, title: best.Title, year: best.Year, score: titleScore(name, best.Title) };
}

async function fetchOmdb(apiKey: string, imdb: string): Promise<OmdbResponse | null> {
  const url = `https://www.omdbapi.com/?apikey=${encodeURIComponent(apiKey)}&i=${encodeURIComponent(imdb)}&type=series`;
  try {
    const res = await fetch(url, { headers: { "User-Agent": "RealiTea/1.0" } });
    if (!res.ok) return null;
    return (await res.json()) as OmdbResponse;
  } catch {
    return null;
  }
}

/**
 * Derive our status/active from IMDb's "Year" string.
 *
 * IMPORTANT: OMDb is unreliable about end years — for many ongoing series it
 * returns only the START year ("2015", no trailing dash). So a SINGLE year is
 * treated as ambiguous and never flips a show to "ended". We only retire a show
 * when IMDb gives an explicit END year that is ≥2 years stale.
 * - "2009–"       ongoing → keep airing/upcoming/returning, active
 * - "2014–2023"   explicit end ≥2y stale → ended/inactive; recent end → returning
 * - "2023"        single year → AMBIGUOUS, keep current (never auto-end)
 */
export function deriveStatus(
  year: string | undefined,
  current: ShowStatus,
  nowYear: number,
): { status: ShowStatus; active: boolean } {
  if (!year) return { status: current, active: current !== "ended" };

  const ranged = year.match(/(\d{4})\s*[–-]\s*(\d{4})/);
  if (ranged) {
    const end = parseInt(ranged[2], 10);
    if (end <= nowYear - 2) return { status: "ended", active: false };
    return { status: "returning", active: true };
  }

  // Trailing-dash range ("2015– ") or bare single year → ongoing/ambiguous: keep active.
  return { status: current === "ended" ? "returning" : current, active: current !== "ended" };
}

export async function refreshShowsFromOmdb(
  apiKey: string,
  opts?: { shows?: Show[]; nowYear?: number; delayMs?: number },
): Promise<RefreshResult> {
  const shows = opts?.shows ?? SHOWS;
  const nowYear = opts?.nowYear ?? new Date().getFullYear();
  const delayMs = opts?.delayMs ?? 120;

  const updates: ShowUpdate[] = [];
  const mismatches: ShowMismatch[] = [];
  const overrides: RefreshResult["overrides"] = {};
  let checked = 0;
  let failed = 0;
  let skipped = 0;

  for (const s of shows) {
    if (!s.imdb) {
      skipped += 1;
      continue;
    }
    const resp = await fetchOmdb(apiKey, s.imdb);
    if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
    if (!resp || resp.Response !== "True") {
      failed += 1;
      continue;
    }
    checked += 1;

    // Guard: a wrong IMDb id resolves to a different title — report it, never act on it.
    if (!titleMatches(s.name, resp.Title)) {
      mismatches.push({ id: s.id, name: s.name, imdb: s.imdb, imdbTitle: resp.Title, year: resp.Year });
      continue;
    }

    const { status, active } = deriveStatus(resp.Year, s.status, nowYear);
    if (status !== s.status || active !== s.active) {
      updates.push({
        id: s.id,
        name: s.name,
        imdb: s.imdb,
        year: resp.Year,
        before: { status: s.status, active: s.active },
        after: { status, active },
        reason: `IMDb Year="${resp.Year ?? "?"}"`,
      });
      overrides[s.id] = { status, active, name: resp.Title || s.name };
    }
  }

  return { checked, failed, skipped, updates, mismatches, overrides };
}
