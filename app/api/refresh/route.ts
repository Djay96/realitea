import { NextRequest, NextResponse } from "next/server";
import { refreshNews } from "@/lib/refresh";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Manual "warm" trigger so the feed can be populated immediately
 * (e.g. right after deploy) without waiting for the hourly cron.
 * Protected by REFRESH_TOKEN.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.REFRESH_TOKEN;
  const provided =
    req.headers.get("x-refresh-token") ||
    new URL(req.url).searchParams.get("token");

  if (!expected || provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const run = await refreshNews("manual");
    return NextResponse.json(run, { status: run.ok ? 200 : 500 });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: (err as Error).message },
      { status: 500 },
    );
  }
}
