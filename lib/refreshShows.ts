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

export interface RefreshResult {
  checked: number;
  failed: number;
  skipped: number;
  updates: ShowUpdate[];
  /** id → override to persist (only for shows whose status/active changed). */
  overrides: Record<string, { status: ShowStatus; active: boolean; name: string }>;
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
 * - "2009–"        ongoing  → keep airing/upcoming/returning, active
 * - "2014–2023"    ended N years ago → ended/inactive once ≥2 years stale
 *                   ended recently → "returning" (likely an annual gap)
 * - "2023"         single year, stale → ended; recent → keep
 */
export function deriveStatus(
  year: string | undefined,
  current: ShowStatus,
  nowYear: number,
): { status: ShowStatus; active: boolean } {
  if (!year) return { status: current, active: current !== "ended" };

  const ranged = year.match(/(\d{4})\s*[–-]\s*(\d{4})?/);
  if (ranged) {
    const end = ranged[2] ? parseInt(ranged[2], 10) : null;
    if (end === null) {
      // Ongoing per IMDb. Don't downgrade a known airing/upcoming label.
      return { status: current === "ended" ? "returning" : current, active: true };
    }
    if (end <= nowYear - 2) return { status: "ended", active: false };
    return { status: "returning", active: true };
  }

  const single = year.match(/^(\d{4})$/);
  if (single) {
    const y = parseInt(single[1], 10);
    if (y <= nowYear - 2) return { status: "ended", active: false };
    return { status: current === "ended" ? "returning" : current, active: true };
  }

  return { status: current, active: current !== "ended" };
}

export async function refreshShowsFromOmdb(
  apiKey: string,
  opts?: { shows?: Show[]; nowYear?: number; delayMs?: number },
): Promise<RefreshResult> {
  const shows = opts?.shows ?? SHOWS;
  const nowYear = opts?.nowYear ?? new Date().getFullYear();
  const delayMs = opts?.delayMs ?? 120;

  const updates: ShowUpdate[] = [];
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

  return { checked, failed, skipped, updates, overrides };
}
