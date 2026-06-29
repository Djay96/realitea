# RealiTea — API Reference

All endpoints are Next.js route handlers deployed on Netlify. See [ARCHITECTURE.md](ARCHITECTURE.md) for how each maps to the system's data input/output points.

Base URL (local prod): `http://localhost:3000`
Base URL (deployed): `https://realitea.netlify.app`

| Endpoint | Method | Auth | Calls AI / news sources? | I/O point |
| --- | --- | --- | --- | --- |
| `/api/news` | GET | none | No (reads cache) | OUT-5 |
| `/api/status` | GET | none | No (reads cache) | OUT-6 |
| `/api/refresh` | POST | `REFRESH_TOKEN` | Yes (full pipeline) | IN-1..OUT-3 |
| scheduled `refresh-news` | cron | Netlify | Yes (full pipeline) | IN-1..OUT-3 |

---

## GET /api/news

Returns the cached feed. This is what the UI calls on refresh — it never triggers summarization or source fetches. Falls back to built-in demo items when the cache is empty.

### Query params

| Param | Type | Default | Notes |
| --- | --- | --- | --- |
| `limit` | number | 200 | Max items, capped at 500 |

### Response `200`

```json
{
  "updatedAt": "2026-06-28T19:00:00.000Z",
  "count": 2,
  "isDemo": false,
  "items": [
    {
      "id": "a1b2c3d4e5f60718",
      "title": "Love Island Returns With Its Most International Cast Yet",
      "url": "https://example.com/love-island-returns",
      "source": "Reality Blurred",
      "publishedAt": "2026-06-28T18:48:00.000Z",
      "ingestedAt": "2026-06-28T19:00:00.000Z",
      "content": "raw snippet used as summarization input",
      "summary": "Love Island is back with contestants from five continents...",
      "imageUrl": "https://.../thumb.jpg",
      "regions": ["uk", "global"],
      "topics": ["love-island"]
    }
  ]
}
```

| Field | Meaning |
| --- | --- |
| `updatedAt` | When the feed cache was last written by the pipeline |
| `count` | Number of items returned |
| `isDemo` | `true` when serving built-in sample data (cache empty) |
| `items[]` | `NewsItem` records (client ranks by user prefs) |
| `items[].regions` | Region slugs: `us`, `uk`, `india`, `australia`, `canada`, `global` |
| `items[].topics` | Show topic slugs for personalization (e.g. `love-island`, `bigg-boss`) |

### Example

```bash
curl "http://localhost:3000/api/news?limit=20"
```

Caching: responds with `Cache-Control: public, max-age=60, s-maxage=300, stale-while-revalidate=600` so repeated refreshes are cheap.

---

## GET /api/status

Observability endpoint. Surfaces the last aggregation run's input/output metrics plus current cache state. Use it to verify the hourly job is healthy and to trace data flow.

### Response `200`

```json
{
  "status": "healthy",
  "cache": {
    "itemCount": 312,
    "updatedAt": "2026-06-28T19:00:00.000Z",
    "newestPublishedAt": "2026-06-28T18:48:00.000Z"
  },
  "lastRun": {
    "trigger": "scheduled",
    "startedAt": "2026-06-28T19:00:00.000Z",
    "finishedAt": "2026-06-28T19:00:21.512Z",
    "durationMs": 21512,
    "sources": [
      { "source": "Reality Blurred", "type": "rss", "fetched": 14, "ok": true },
      { "source": "News API (newsapi)", "type": "newsapi", "fetched": 37, "ok": true }
    ],
    "totalFetched": 121,
    "deduped": 96,
    "newArticles": 18,
    "summarized": 18,
    "summaryFailures": 0,
    "totalItems": 312,
    "ok": true
  },
  "history": [ "...up to 20 previous RunStats..." ]
}
```

| Field | Meaning | I/O point |
| --- | --- | --- |
| `status` | `healthy` / `degraded` / `uninitialized` | derived |
| `cache.itemCount` | Items currently cached | OUT-2 |
| `lastRun.sources[]` | Per-source fetch counts + errors | IN-1, IN-2 |
| `lastRun.totalFetched` -> `deduped` | Volume in vs after dedupe | IN-1/IN-2 -> IN-3 |
| `lastRun.newArticles` | Unseen articles selected for summarization | IN-3 |
| `lastRun.summarized` / `summaryFailures` | DeepSeek successes / fallbacks | OUT-1 |
| `lastRun.totalItems` | Items written to cache | OUT-2 |

### Example

```bash
curl "http://localhost:3000/api/status"
```

---

## POST /api/refresh

Manually runs the full aggregation pipeline (fetch -> summarize -> store). Intended to warm the cache immediately after deploy without waiting for the hourly cron. **Triggers DeepSeek and news-source calls**, so it is token-protected.

### Auth

Provide the token via either:

- Header: `x-refresh-token: <REFRESH_TOKEN>`
- Query: `?token=<REFRESH_TOKEN>`

### Response `200` (or `500` if the run failed)

Returns the full `RunStats` object (same shape as `lastRun` above).

```json
{
  "trigger": "manual",
  "startedAt": "...",
  "finishedAt": "...",
  "durationMs": 18342,
  "sources": [ ... ],
  "totalFetched": 121,
  "deduped": 96,
  "newArticles": 18,
  "summarized": 18,
  "summaryFailures": 0,
  "totalItems": 312,
  "ok": true
}
```

### Response `401`

```json
{ "error": "unauthorized" }
```

### Example

```bash
curl -X POST "https://<your-site>.netlify.app/api/refresh" \
  -H "x-refresh-token: $REFRESH_TOKEN"
```

---

## Scheduled function: `refresh-news`

Not an HTTP endpoint you call directly — Netlify invokes it on the `@hourly` cron defined in [netlify/functions/refresh-news.mts](../netlify/functions/refresh-news.mts). It runs the same pipeline as `/api/refresh` with `trigger: "scheduled"` and logs the resulting `RunStats`.

Inspect its output in the Netlify dashboard under **Functions -> refresh-news -> logs**, or via `/api/status`.
