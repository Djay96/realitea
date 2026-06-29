import { getStore } from "@netlify/blobs";
import type { ShowStatus } from "./shows";
import { SHOWS } from "./shows";

/**
 * Runtime overlay of the weekly IMDb refresh.
 *
 * The scheduled function (netlify/functions/refresh-shows.mts) writes per-show
 * status/active overrides to a Netlify Blob. The hourly news job reads them so
 * that shows IMDb says have ended stop passing the relevance gate — applied
 * live, no redeploy. The committed SHOWS catalog is the seed/fallback.
 */

const STORE_NAME = "realitea";
const OVERRIDES_KEY = "shows-overrides.json";

export interface ShowOverride {
  status?: ShowStatus;
  active?: boolean;
  name?: string;
}

export async function readShowOverrides(): Promise<Record<string, ShowOverride>> {
  try {
    const store = getStore({ name: STORE_NAME, consistency: "strong" });
    const data = await store.get(OVERRIDES_KEY, { type: "json" });
    return data && typeof data === "object" ? (data as Record<string, ShowOverride>) : {};
  } catch (err) {
    console.warn("[showOverrides] read failed:", (err as Error).message);
    return {};
  }
}

/** Set of show ids that are active after applying the weekly IMDb overrides. */
export async function getActiveShowIds(): Promise<Set<string>> {
  const overrides = await readShowOverrides();
  const ids = new Set<string>();
  for (const show of SHOWS) {
    const active = overrides[show.id]?.active ?? show.active;
    if (active) ids.add(show.id);
  }
  return ids;
}
