import Feed from "@/components/Feed";
import { getDisplayFeed } from "@/lib/getFeed";

// Re-read the cached blob on each request (cheap; no AI/news calls here).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const feed = await getDisplayFeed();
  return (
    <main className="w-full overflow-x-hidden">
      <Feed
        initialItems={feed.items}
        initialUpdatedAt={feed.updatedAt}
        initialIsDemo={feed.isDemo}
      />
    </main>
  );
}
