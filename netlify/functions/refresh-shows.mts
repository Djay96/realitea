import type { Config } from "@netlify/functions";
import { getStore } from "@netlify/blobs";
import { refreshShowsFromOmdb } from "../../lib/refreshShows";

const STORE_NAME = "realitea";
const OVERRIDES_KEY = "shows-overrides.json";
const META_KEY = "shows-overrides-meta.json";

/**
 * Weekly IMDb (OMDb) refresh of the shows catalog.
 *
 * Re-checks every show's IMDb id, derives status/active, and writes the changes
 * as overrides to a Netlify Blob. The hourly news job (lib/showOverrides.ts)
 * reads these so ended shows drop out live — "auto-apply" without a redeploy.
 */
export default async function handler() {
  const start = Date.now();
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) {
    console.warn("[refresh-shows] OMDB_API_KEY not set; skipping.");
    return new Response(JSON.stringify({ skipped: "no OMDB_API_KEY" }), {
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const result = await refreshShowsFromOmdb(apiKey);
    const store = getStore({ name: STORE_NAME, consistency: "strong" });

    // Merge over any prior overrides so manual/earlier changes persist.
    const prev = ((await store
      .get(OVERRIDES_KEY, { type: "json" })
      .catch(() => null)) as Record<string, unknown> | null) ?? {};
    const merged = { ...prev, ...result.overrides };
    await store.setJSON(OVERRIDES_KEY, merged);
    await store.setJSON(META_KEY, {
      ranAt: new Date().toISOString(),
      durationMs: Date.now() - start,
      checked: result.checked,
      failed: result.failed,
      skipped: result.skipped,
      changed: result.updates.length,
      updates: result.updates,
    });

    console.log("[refresh-shows] done", {
      checked: result.checked,
      failed: result.failed,
      changed: result.updates.length,
      ms: Date.now() - start,
    });
    return new Response(
      JSON.stringify({
        checked: result.checked,
        failed: result.failed,
        changed: result.updates.length,
        updates: result.updates,
      }),
      { headers: { "content-type": "application/json" } },
    );
  } catch (err) {
    console.error("[refresh-shows] failed:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

// Mondays at 06:00 UTC.
export const config: Config = {
  schedule: "0 6 * * 1",
};
