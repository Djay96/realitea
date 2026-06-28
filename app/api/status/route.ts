import { NextResponse } from "next/server";
import { readFeed, readMeta } from "@/lib/feedStore";

// Observability endpoint: reports the last aggregation run's input/output
// metrics plus current cache state. Never calls DeepSeek or news sources.
export const dynamic = "force-dynamic";

export async function GET() {
  const [feed, meta] = await Promise.all([readFeed(), readMeta()]);

  const lastRun = meta.lastRun;
  return NextResponse.json(
    {
      status: lastRun ? (lastRun.ok ? "healthy" : "degraded") : "uninitialized",
      cache: {
        itemCount: feed.items.length,
        updatedAt: feed.updatedAt,
        newestPublishedAt: feed.items[0]?.publishedAt ?? null,
      },
      lastRun,
      history: meta.history,
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
