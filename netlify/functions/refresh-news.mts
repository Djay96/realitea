import type { Config } from "@netlify/functions";
import { refreshNews } from "../../lib/refresh";

export default async function handler() {
  const start = Date.now();
  try {
    const result = await refreshNews("scheduled");
    console.log("[refresh-news] done", { ...result, ms: Date.now() - start });
    return new Response(JSON.stringify(result), {
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("[refresh-news] failed:", err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
}

// Runs at the top of every hour.
export const config: Config = {
  schedule: "@hourly",
};
