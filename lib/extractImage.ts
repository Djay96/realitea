/** Extract the first image URL from HTML content. */
export function firstImageFromHtml(html: string | undefined): string | undefined {
  if (!html) return undefined;
  const patterns = [
    /<img[^>]+src=["']([^"']+)["']/i,
    /<img[^>]+src=([^\s>]+)/i,
    /property=["']og:image["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:image["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      const url = cleanImageUrl(m[1]);
      if (url) return url;
    }
  }
  return undefined;
}

function cleanImageUrl(raw: string): string | undefined {
  let url = raw.trim().replace(/&amp;/g, "&").replace(/^['"]|['"]$/g, "");
  if (url.startsWith("//")) url = `https:${url}`;
  if (!/^https?:\/\//i.test(url)) return undefined;
  try {
    const u = new URL(url);
    if (u.protocol !== "http:" && u.protocol !== "https:") return undefined;
    return u.toString();
  } catch {
    return undefined;
  }
}

type RssLikeItem = {
  enclosure?: { url?: string; type?: string };
  content?: string;
  contentSnippet?: string;
  ["content:encoded"]?: string;
  ["media:content"]?: { $?: { url?: string; medium?: string } } | { $?: { url?: string } };
  ["media:thumbnail"]?: { $?: { url?: string } };
  ["itunes:image"]?: string | { $?: { href?: string } };
};

/** Best-effort image URL from an RSS/Atom item. */
export function extractRssImage(item: RssLikeItem): string | undefined {
  const enclosure = item.enclosure?.url;
  if (enclosure && (!item.enclosure?.type || item.enclosure.type.startsWith("image"))) {
    const cleaned = cleanImageUrl(enclosure);
    if (cleaned) return cleaned;
  }

  const media =
    item["media:content"]?.$?.url ||
    item["media:thumbnail"]?.$?.url;
  if (media) {
    const cleaned = cleanImageUrl(media);
    if (cleaned) return cleaned;
  }

  const itunes = item["itunes:image"];
  if (typeof itunes === "string") {
    const cleaned = cleanImageUrl(itunes);
    if (cleaned) return cleaned;
  }
  if (itunes && typeof itunes === "object" && itunes.$?.href) {
    const cleaned = cleanImageUrl(itunes.$.href);
    if (cleaned) return cleaned;
  }

  const html = item["content:encoded"] || item.content || item.contentSnippet || "";
  return firstImageFromHtml(html);
}

/** Fetch og:image from article page (best-effort, short timeout). */
export async function fetchOgImage(pageUrl: string, timeoutMs = 4000): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(pageUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RealiTea/1.0; +https://realitea.netlify.app)",
        Accept: "text/html",
      },
      signal: controller.signal,
      redirect: "follow",
    });
    clearTimeout(timer);
    if (!res.ok) return undefined;
    const html = await res.text();
    return firstImageFromHtml(html);
  } catch {
    return undefined;
  }
}

/** Topic-based placeholder when no image is available. */
export function topicPlaceholder(topic?: string): { gradient: string; emoji: string } {
  const map: Record<string, { gradient: string; emoji: string }> = {
    "love-island": { gradient: "from-rose-400 via-pink-500 to-orange-400", emoji: "🏝️" },
    "big-brother": { gradient: "from-violet-600 via-purple-600 to-indigo-700", emoji: "🏠" },
    "bigg-boss": { gradient: "from-orange-500 via-amber-500 to-yellow-500", emoji: "👑" },
    "drag-race": { gradient: "from-fuchsia-500 via-pink-500 to-rose-500", emoji: "💃" },
    "bachelor": { gradient: "from-red-400 via-rose-500 to-pink-400", emoji: "🌹" },
    "survivor": { gradient: "from-emerald-600 via-green-600 to-teal-700", emoji: "🔥" },
    "housewives": { gradient: "from-pink-400 via-rose-400 to-fuchsia-500", emoji: "💎" },
    "masterchef": { gradient: "from-amber-400 via-orange-500 to-red-500", emoji: "👨‍🍳" },
    "traitors": { gradient: "from-slate-700 via-zinc-800 to-neutral-900", emoji: "🗡️" },
    "kardashians": { gradient: "from-neutral-800 via-stone-700 to-amber-900", emoji: "✨" },
  };
  return map[topic ?? ""] ?? { gradient: "from-tea-300 via-tea-500 to-amber-600", emoji: "🍵" };
}
