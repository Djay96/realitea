/**
 * SUGGESTION tool: for each show, search OMDb by title and propose the IMDb id
 * of the exact-title match. DRY BY DEFAULT — it only prints suggestions, because
 * OMDb search can't reliably distinguish a revival from its defunct original or
 * a franchise spin-off, so ids must be eyeballed before trusting them.
 *
 *   OMDB_API_KEY=xxxx npm run resolve:ids            # preview suggestions
 *   OMDB_API_KEY=xxxx npm run resolve:ids -- --write # persist to lib/shows.imdb.json
 *
 * Review the suggestions, then either pass --write to accept ALL of them, or
 * hand-edit lib/shows.imdb.json with just the ones you've verified. Entries here
 * are merged over the inline `imdb` seeds in lib/shows.ts at load.
 */
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { SHOWS } from "../lib/shows";
import { resolveImdbId, titleMatches } from "../lib/refreshShows";
import EXISTING from "../lib/shows.imdb.json";

const OUT = resolve(process.cwd(), "lib/shows.imdb.json");
const WRITE = process.argv.includes("--write");

async function main() {
  const apiKey = process.env.OMDB_API_KEY;
  if (!apiKey) {
    console.error("Set OMDB_API_KEY (free key: https://www.omdbapi.com/apikey.aspx)");
    process.exit(1);
  }

  const overrides: Record<string, string> = { ...(EXISTING as Record<string, string>) };
  let resolved = 0;
  let unresolved = 0;
  let unchanged = 0;

  for (const s of SHOWS) {
    // Already has an id that genuinely matches its title → leave it.
    // (Seeds were verified by the title guard in refresh:shows.)
    const found = await resolveImdbId(apiKey, s.name);
    await new Promise((r) => setTimeout(r, 120));

    if (!found) {
      unresolved += 1;
      console.log(`✗ ${s.name} — no confident OMDb match`);
      continue;
    }
    if (found.imdb === s.imdb) {
      unchanged += 1;
      continue;
    }
    overrides[s.id] = found.imdb;
    resolved += 1;
    const note = s.imdb && !titleMatches(s.name, found.title) ? "" : "";
    console.log(
      `→ ${s.name}: ${s.imdb ?? "(none)"} ⇒ ${found.imdb}  "${found.title}" (${found.year}) score=${found.score.toFixed(2)}${note}`,
    );
  }

  console.log(`\nsuggested/changed=${resolved}  unchanged=${unchanged}  unresolved=${unresolved}`);

  if (!WRITE) {
    console.log("\nPreview only. Re-run with --write to accept ALL suggestions,");
    console.log("or hand-edit lib/shows.imdb.json with just the verified ones.");
    return;
  }
  const sorted = Object.fromEntries(Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b)));
  await writeFile(OUT, JSON.stringify(sorted, null, 2) + "\n");
  console.log(`\nWrote ${Object.keys(sorted).length} id(s) to lib/shows.imdb.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
