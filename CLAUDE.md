# RealiTea — project notes

Inshorts-style worldwide reality-TV news app. Next.js 14 (App Router) on Netlify,
DeepSeek for summaries, Netlify Blobs for the cached feed.

## News pipeline (how the feed stays on-topic + per country)

- `lib/shows.ts` is the **single source of truth** — ~227 IMDb-keyed shows grouped by
  country (`COUNTRY_META` defines the ~26 country buckets). Each show has
  `aliases`/`network`/`region`/`genre`/`status`/`active`/`imdb`/optional `query`.
- It drives the pipeline:
  1. `getShowNewsQueries()` builds the NewsAPI query list from active shows
     (`lib/sources.ts` → `NEWS_API_QUERIES`), rotated 8/run by UTC hour.
  2. `matchShowsInText()` tags each article with the shows it mentions; `refresh.ts`
     **drops any article whose shows are all inactive** (seed `active` ∪ weekly IMDb
     override) — the authoritative relevance gate. `REALITY_KEYWORDS` is only a cheap
     pre-filter for broad RSS feeds.
  3. `tagArticle()` sets `regions` = the matched shows' **home countries**
     (`regionsForShows`), falling back to keyword/sourceRegion only when just a global
     umbrella matched. This is the precise signal the country filter uses.
- **Hard country filter**: `filterByRegion()` (`lib/rankFeed.ts`) keeps only items whose
  `regions` include the user's chosen country; `Feed.tsx` applies it before ranking.
  `region: "global"` = show everything. Onboarding country list = `USER_REGIONS`
  (derived from `getSelectableCountries()`, grouped by continent).
- To add/retire a show: append to `SHOWS` with its IMDb id. Keep
  `active === status !== "ended"`. Aliases must reflect **headline** forms (MAFS, RHOBH,
  LIUK, BBCAN). `topics` (coarse buckets) still produced for ranking UI compatibility.

## Weekly IMDb refresh (golden source)

- IMDb is the golden source. `lib/refreshShows.ts` (`refreshShowsFromOmdb`) looks up each
  show's `imdb` id via **OMDb** (omdbapi.com, reuses `OMDB_API_KEY`) and re-derives
  status/active from IMDb's `Year` (`deriveStatus`): ongoing → active; ended ≥2 yrs → inactive.
- Runner: **Netlify scheduled function** `netlify/functions/refresh-shows.mts` (`schedule
  "0 6 * * 1"`, Mondays 06:00 UTC). It writes per-show overrides to Netlify Blob
  `shows-overrides.json` (+ `…-meta.json` changelog). `lib/showOverrides.ts` reads them in
  the hourly gate → ended shows drop out **live, no redeploy** ("auto-apply").
- Preview locally: `OMDB_API_KEY=… npm run refresh:shows` (read-only, prints changes).
- **OMDb can't browse IMDb by genre** → the weekly job keeps KNOWN shows fresh but does
  NOT discover new shows. Add new shows by appending their IMDb id to `SHOWS`.
- A Netlify scheduled function can't `git commit`; "auto-apply" = write the override blob
  the app reads live. The committed `SHOWS` catalog is the seed/fallback.

## Learnings log

### Show matching
- Alias matcher uses one alternation regex per show with alnum lookaround
  `(?<![a-z0-9])…(?![a-z0-9])` so short aliases don't fire inside words
  ("bb" won't match ABBA/BBC). Aliases < `MIN_ALIAS_LEN` (4) are ignored — always
  pair a short alias with a longer distinctive phrase.
- Bare franchise aliases ("love island", "big brother", "the traitors", "masterchef",
  "drag race", "mafs", "survivor", "bachelor") are each owned by ONE entry (a global
  umbrella or the flagship region) to avoid messy cross-region tags. Region variants
  own the disambiguated form ("love island uk"). Multi-tagging franchise+variant is
  expected and harmless (article kept if ≥1 match).
- Known minor over-tag: bare "mafs" on `married-at-first-sight-us` also fires on
  "MAFS Australia". Low impact; refine later if it matters.
- Single-word generic aliases (e.g. "survivor") can match non-reality copy
  ("war survivor film"); accepted tradeoff for coverage.

### Country attribution / leak-free filtering
- Bare multi-country franchise names ("survivor", "the voice", "love island", "big brother")
  live ONLY on `region:"global"` umbrella entries; each national version owns a *qualified*
  alias ("survivor south africa", "love island uk"). So "Survivor South Africa" tags only
  south-africa, never leaking into the US feed.
- Cost of that rule: a bare-name origin headline ("Survivor 48") matches only the umbrella
  (→ global). Recovered via `tagArticle`'s fallback: when no country-specific show matched,
  `matchRegions(text, sourceRegion)` attributes the country from network keywords / the RSS
  feed's `sourceRegion` (US feeds → us). Verified end-to-end.

### Tooling / env quirks
- `Date.now()`/`new Date()` are fine in regular Node scripts and Netlify functions — the
  ban is ONLY inside Workflow tool scripts. `lib/refreshShows.ts` uses `new Date()` freely.
- **Workflow subagents can hit an account-level "session limit"** (e.g. "You've hit
  your session limit · resets <time>"). When that happens every agent fails and the
  workflow returns empty — fall back to doing the work solo, don't keep retrying.
- zsh: quote grep globs — `--include="*.ts"` (unquoted `--include=*.ts` → "no matches found").
- zsh pipe exit codes: use `${pipestatus[1]}` (lowercase, 1-indexed), not `${PIPESTATUS[0]}`.
- Verify lib logic fast with `npx tsx <file>.ts` using the `@/` alias from inside the
  repo root (tsx respects tsconfig paths); relative paths into the repo from /tmp fail.
