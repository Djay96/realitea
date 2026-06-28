# 🍵 RealiTea

An **Inshorts-style web app for worldwide reality-TV news**. Stories are aggregated from RSS feeds + a news API, summarized into ~60-word cards by **DeepSeek**, cached, and served as a swipeable feed. Read state is tracked per-device (no login), and ads are monetized via **Google AdSense**. Built with Next.js, deployed on **Netlify**.

## How it works

```
Hourly Netlify Scheduled Function
  → fetch RSS feeds + News API
  → keep only unseen articles (dedupe by URL hash)
  → summarize each with DeepSeek (~60 words)
  → store rolling feed.json in Netlify Blobs

User opens app
  → reads the cached feed (no AI / news-API calls per visit)
  → "unread" computed in the browser (localStorage)
  → refresh just re-reads the cheap cached JSON
```

DeepSeek and the news sources are only hit by the **hourly job**, never by user refreshes — so refreshing the feed costs nothing and stays fast.

> The frontend also works **standalone with zero backend setup**: when the cache is empty it serves built-in demo stories (`isDemo: true`) so you can develop and preview the UI before wiring keys.

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — full system map, end-to-end data flow diagrams, and the table of **every data input/output point**.
- [docs/API.md](docs/API.md) — all endpoints, payloads, and I/O contracts.

## Tech stack

- **Next.js (App Router)** + TypeScript + Tailwind CSS
- **Netlify Scheduled Functions** (`@hourly`) for aggregation
- **Netlify Blobs** for the zero-config cached feed store
- **DeepSeek** (OpenAI-compatible API) for summarization
- **Google AdSense** for monetization

## Project structure

| Path | Purpose |
| --- | --- |
| `netlify/functions/refresh-news.mts` | Hourly scheduled job |
| `lib/refresh.ts` | Core fetch → dedupe → summarize → store pipeline |
| `lib/sources.ts` | RSS feed list + news API queries + tuning constants |
| `lib/fetchers/rss.ts` | RSS/Atom feed fetcher |
| `lib/fetchers/newsapi.ts` | NewsAPI.org / GNews fetcher |
| `lib/deepseek.ts` | DeepSeek summarization client |
| `lib/feedStore.ts` | Netlify Blobs read/write + merge + run-stats |
| `lib/getFeed.ts` | Cache-or-sample fallback (demo mode) |
| `lib/sampleData.ts` | Built-in demo stories |
| `lib/readState.ts` | localStorage read-tracking |
| `app/api/news/route.ts` | Serves the cached feed |
| `app/api/status/route.ts` | Observability: last-run metrics + cache state |
| `app/api/refresh/route.ts` | Manual refresh trigger (token-protected) |
| `components/Feed.tsx` | Card feed, refresh, unread logic, ad interleaving |
| `components/NewsCard.tsx` | Single news card |
| `components/AdCard.tsx` | AdSense in-feed unit |

## Local development

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env vars and fill them in:
   ```bash
   cp .env.example .env
   ```
3. Run with the Netlify dev server (needed for Netlify Blobs + functions):
   ```bash
   npx netlify dev
   ```
   App runs at http://localhost:8888.
4. Populate the feed immediately (in another terminal):
   ```bash
   npm run refresh:local
   ```

> Plain `npm run dev` works for UI, but Netlify Blobs is only available under `netlify dev` or on Netlify.

## Environment variables

See [`.env.example`](.env.example). Summary:

| Variable | Required | Notes |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | yes | Your DeepSeek key |
| `DEEPSEEK_MODEL` | no | Defaults to `deepseek-chat`; set to your "v4 fast" slug |
| `DEEPSEEK_BASE_URL` | no | Defaults to `https://api.deepseek.com` |
| `NEWS_API_KEY` | optional | Enables the news API source (RSS still works without it) |
| `NEWS_API_PROVIDER` | no | `newsapi` (default) or `gnews` |
| `REFRESH_TOKEN` | yes | Protects the manual `/api/refresh` endpoint |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | optional | AdSense publisher id; blank = ad placeholders |
| `NEXT_PUBLIC_ADSENSE_SLOT` | optional | AdSense in-feed slot id |

## Deploy to Netlify

1. Push this repo to GitHub.
2. In Netlify: **Add new site → Import from Git**, pick the repo.
3. Build settings are auto-detected from `netlify.toml` (the Next.js plugin is included).
4. Add the environment variables above under **Site settings → Environment variables**.
5. Deploy. The hourly function registers automatically.
6. Warm the feed immediately:
   ```bash
   curl -X POST https://<your-site>.netlify.app/api/refresh \
     -H "x-refresh-token: <REFRESH_TOKEN>"
   ```

### AdSense note

AdSense requires approval against a live domain with real content. Until your account + ad unit are approved, the app shows styled ad placeholders. Once approved, set `NEXT_PUBLIC_ADSENSE_CLIENT` and `NEXT_PUBLIC_ADSENSE_SLOT` and redeploy.

## Observability

Check pipeline health and trace data flow at any time:

```bash
curl https://<your-site>.netlify.app/api/status
```

It reports the last run's per-source fetch counts, dedupe volume, summaries vs. fallbacks, total cached items, and the last 20 runs. See the I/O mapping in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#5-data-input--output-points-the-tracking-map).

## Customizing sources

Edit [`lib/sources.ts`](lib/sources.ts) to add RSS feeds, change news-API search terms, tune `FEED_MAX_ITEMS`, or cap `MAX_SUMMARIES_PER_RUN` (controls DeepSeek cost per hour).
