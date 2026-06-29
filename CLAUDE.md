# RealiTea — project notes

Inshorts-style worldwide reality-TV news app. Next.js 14 (App Router) on Netlify,
DeepSeek for summaries, Netlify Blobs for the cached feed.

## News pipeline (how the feed stays on-topic)

- `lib/shows.ts` is the **single source of truth** for which reality shows we cover
  (~105 curated, worldwide, with `aliases`/`network`/`region`/`genre`/`status`/`active`).
- Two ways it drives the pipeline:
  1. `getShowNewsQueries()` builds the NewsAPI query list from active shows
     (`lib/sources.ts` → `NEWS_API_QUERIES`), rotated 8/run by UTC hour.
  2. `matchShowsInText()` tags each article with the shows it mentions; `refresh.ts`
     **drops any article that matches no active show** — the authoritative relevance
     gate. `REALITY_KEYWORDS` is now only a cheap pre-filter for broad RSS feeds.
- `tagArticle()` (`lib/tagging.ts`) sets `shows`, and a matched show's home region
  reinforces the `regions` tag. `topics` (coarse buckets) is still produced for
  onboarding/ranking UI compatibility.
- To add/retire a show: edit `SHOWS` in `lib/shows.ts`. Keep `active === status !== "ended"`.
  Aliases must reflect how **headlines** write the show (MAFS, RHOBH, LIUK, BBCAN).

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

### Tooling / env quirks
- **Workflow subagents can hit an account-level "session limit"** (e.g. "You've hit
  your session limit · resets <time>"). When that happens every agent fails and the
  workflow returns empty — fall back to doing the work solo, don't keep retrying.
- zsh: quote grep globs — `--include="*.ts"` (unquoted `--include=*.ts` → "no matches found").
- zsh pipe exit codes: use `${pipestatus[1]}` (lowercase, 1-indexed), not `${PIPESTATUS[0]}`.
- Verify lib logic fast with `npx tsx <file>.ts` using the `@/` alias from inside the
  repo root (tsx respects tsconfig paths); relative paths into the repo from /tmp fail.
