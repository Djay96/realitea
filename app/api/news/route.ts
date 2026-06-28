import { NextRequest, NextResponse } from "next/server";
import { getDisplayFeed } from "@/lib/getFeed";

// Always read the latest cached blob; this route does NOT call DeepSeek or news sources.
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get("limit")) || 200, 500);

  const feed = await getDisplayFeed(limit);
  const items = feed.items;

  return NextResponse.json(
    { updatedAt: feed.updatedAt, count: items.length, isDemo: feed.isDemo, items },
    {
      headers: {
        // Cheap CDN caching so user refreshes don't re-run anything heavy.
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
