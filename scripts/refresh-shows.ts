/**
 * Manual / local IMDb refresh of the shows catalog.
 *
 *   OMDB_API_KEY=xxxx npm run refresh:shows
 *
 * Prints the status changes IMDb (via OMDb) implies for the catalog. This is
 * the same logic the weekly Netlify scheduled function runs; use it to preview
 * what the next weekly run will change. It does NOT write anything.
 */
import { refreshShowsFromOmdb } from "../lib/refreshShows";

async function main() {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) {
    console.error("Set OMDB_API_KEY (free key: https://www.omdbapi.com/apikey.aspx)");
    process.exit(1);
  }

  console.log("Checking every show with an IMDb id against OMDb…\n");
  const { checked, failed, skipped, updates, mismatches } = await refreshShowsFromOmdb(apiKey);

  if (updates.length === 0) {
    console.log("No status changes — catalog matches IMDb.");
  } else {
    console.log(`${updates.length} status change(s) (would auto-apply):\n`);
    for (const u of updates) {
      console.log(
        ` - ${u.name} [${u.imdb}]: ${u.before.status}/${u.before.active ? "active" : "inactive"}` +
          ` → ${u.after.status}/${u.after.active ? "active" : "inactive"}  (${u.reason})`,
      );
    }
  }

  if (mismatches.length > 0) {
    console.log(`\n⚠ ${mismatches.length} wrong/mismatched IMDb id(s) — FIX in lib/shows.ts (never auto-applied):\n`);
    for (const m of mismatches) {
      console.log(` - ${m.name} [${m.imdb}] resolves to "${m.imdbTitle}" (${m.year})`);
    }
  }

  console.log(`\nchecked=${checked}  failed=${failed}  mismatched=${mismatches.length}  skipped(no imdb)=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
