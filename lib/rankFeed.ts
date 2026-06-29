import type { NewsItem, RegionSlug, UserPrefs } from "./types";

/**
 * Hard country filter: keep ONLY items whose matched shows belong to the
 * selected country. "global" means no filter (show everything). An item with no
 * country tag (e.g. only a global franchise umbrella matched) shows just under
 * "global". This is what makes "select a country → see only that country's
 * shows' news" literal.
 */
export function filterByRegion(items: NewsItem[], region: RegionSlug | null): NewsItem[] {
  if (!region || region === "global") return items;
  return items.filter((i) => (i.regions ?? []).includes(region));
}

function recencyScore(publishedAt: string): number {
  const ageHours = (Date.now() - new Date(publishedAt).getTime()) / 3_600_000;
  if (ageHours < 1) return 1;
  if (ageHours < 6) return 0.8;
  if (ageHours < 24) return 0.5;
  if (ageHours < 72) return 0.25;
  return 0.1;
}

/** Score and sort items for the user's region + interests (client-side, no API cost). */
export function rankFeed(items: NewsItem[], prefs: UserPrefs | null): NewsItem[] {
  if (!prefs) return items;

  const scored = items.map((item) => {
    let score = 0;
    const regions = item.regions ?? ["global"];
    if (regions.includes(prefs.region) || regions.includes("global") || prefs.region === "global") {
      score += 3;
    }
    const topics = item.topics ?? [];
    for (const interest of prefs.interests) {
      if (topics.includes(interest)) score += 2;
    }
    score += recencyScore(item.publishedAt);
    return { item, score };
  });

  return scored
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(b.item.publishedAt).getTime() - new Date(a.item.publishedAt).getTime();
    })
    .map((s) => s.item);
}
