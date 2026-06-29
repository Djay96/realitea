"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NewsItem, RegionSlug, UserPrefs } from "@/lib/types";
import { getReadSet, markRead } from "@/lib/readState";
import { loadPrefs, savePrefs } from "@/lib/userPrefs";
import { adsEnabled } from "@/lib/ads";
import { rankFeed } from "@/lib/rankFeed";
import NewsCard from "./NewsCard";
import AdCard from "./AdCard";
import Onboarding from "./Onboarding";

const ADS_EVERY = 4;

export default function Feed({
  initialItems,
  initialUpdatedAt,
  initialIsDemo = false,
}: {
  initialItems: NewsItem[];
  initialUpdatedAt: string;
  initialIsDemo?: boolean;
}) {
  const [allItems, setAllItems] = useState<NewsItem[]>(initialItems);
  const [deck, setDeck] = useState<NewsItem[]>([]);
  const [readSet, setReadSet] = useState<Set<string>>(new Set());
  const [showingAll, setShowingAll] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(initialUpdatedAt);
  const [isDemo, setIsDemo] = useState(initialIsDemo);
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  const personalize = useCallback(
    (items: NewsItem[], userPrefs: UserPrefs | null) => rankFeed(items, userPrefs),
    [],
  );

  const buildDeck = useCallback(
    (items: NewsItem[], read: Set<string>, all: boolean, userPrefs: UserPrefs | null) => {
      const ranked = personalize(items, userPrefs);
      return all ? ranked : ranked.filter((i) => !read.has(i.id));
    },
    [personalize],
  );

  useEffect(() => {
    const read = getReadSet();
    const userPrefs = loadPrefs();
    setReadSet(read);
    setPrefs(userPrefs);
    setShowOnboarding(!userPrefs);
    setDeck(buildDeck(initialItems, read, false, userPrefs));
  }, [initialItems, buildDeck]);

  const handleRead = useCallback((id: string) => {
    markRead(id);
    setReadSet((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const applyPrefs = useCallback(
    (region: RegionSlug, interests: string[]) => {
      const saved = savePrefs({ region, interests });
      setPrefs(saved);
      setShowOnboarding(false);
      const read = getReadSet();
      setDeck(buildDeck(allItems, read, showingAll, saved));
      scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    },
    [allItems, buildDeck, showingAll],
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/news?limit=300", { cache: "no-store" });
      const data = (await res.json()) as {
        items: NewsItem[];
        updatedAt: string;
        isDemo?: boolean;
      };
      const items = data.items ?? [];
      const userPrefs = loadPrefs();
      setAllItems(items);
      setUpdatedAt(data.updatedAt ?? updatedAt);
      setIsDemo(Boolean(data.isDemo));
      const read = getReadSet();
      setReadSet(read);
      setShowingAll(false);
      setDeck(buildDeck(items, read, false, userPrefs));
      scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  }, [buildDeck, updatedAt]);

  const showAll = useCallback(() => {
    setShowingAll(true);
    setDeck(buildDeck(allItems, readSet, true, prefs));
    scrollerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }, [allItems, readSet, prefs, buildDeck]);

  const unreadCount = useMemo(
    () => allItems.filter((i) => !readSet.has(i.id)).length,
    [allItems, readSet],
  );

  const rendered = useMemo(() => {
    const out: Array<{ type: "news"; item: NewsItem } | { type: "ad"; key: string }> = [];
    deck.forEach((item, idx) => {
      out.push({ type: "news", item });
      if (adsEnabled && (idx + 1) % ADS_EVERY === 0) {
        out.push({ type: "ad", key: `ad-slot-${idx}` });
      }
    });
    return out;
  }, [deck]);

  return (
    <div className="relative h-[100dvh] w-full">
      {showOnboarding ? (
        <Onboarding
          onComplete={applyPrefs}
          onClose={() => setShowOnboarding(false)}
        />
      ) : null}

      <Header
        unreadCount={unreadCount}
        updatedAt={updatedAt}
        loading={loading}
        onRefresh={refresh}
        isDemo={isDemo}
        personalized={Boolean(prefs)}
        onEditPrefs={() => setShowOnboarding(true)}
      />

      <div
        ref={scrollerRef}
        className="snap-feed no-scrollbar h-[100dvh] overflow-y-scroll"
      >
        {rendered.length === 0 ? (
          <CaughtUp
            hasItems={allItems.length > 0}
            loading={loading}
            onRefresh={refresh}
            onShowAll={showAll}
          />
        ) : (
          <>
            {rendered.map((entry) =>
              entry.type === "news" ? (
                <NewsCard
                  key={entry.item.id}
                  item={entry.item}
                  onRead={handleRead}
                />
              ) : (
                <AdCard key={entry.key} slotKey={entry.key} />
              ),
            )}
            <CaughtUp
              hasItems={allItems.length > 0}
              loading={loading}
              onRefresh={refresh}
              onShowAll={showingAll ? undefined : showAll}
              end
            />
          </>
        )}
      </div>
    </div>
  );
}

function Header({
  unreadCount,
  updatedAt,
  loading,
  onRefresh,
  isDemo,
  personalized,
  onEditPrefs,
}: {
  unreadCount: number;
  updatedAt: string;
  loading: boolean;
  onRefresh: () => void;
  isDemo: boolean;
  personalized: boolean;
  onEditPrefs: () => void;
}) {
  const updated =
    updatedAt && new Date(updatedAt).getTime() > 0
      ? new Date(updatedAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";

  return (
    <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 shadow backdrop-blur dark:bg-neutral-900/80">
        <span className="text-lg">🍵</span>
        <span className="font-extrabold tracking-tight">
          Reali<span className="text-tea-500">Tea</span>
        </span>
        {personalized ? (
          <span className="ml-1 rounded-full bg-tea-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-tea-700 dark:text-tea-300">
            For you
          </span>
        ) : null}
        {unreadCount > 0 ? (
          <span className="ml-1 rounded-full bg-tea-500 px-2 py-0.5 text-xs font-bold text-white">
            {unreadCount}
          </span>
        ) : null}
        {isDemo ? (
          <span
            title="Showing built-in sample stories. Run the aggregator to load live news."
            className="ml-1 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white"
          >
            Demo
          </span>
        ) : null}
      </div>
      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          onClick={onEditPrefs}
          className="rounded-full bg-white/80 px-3 py-1.5 text-sm font-medium shadow backdrop-blur hover:bg-white dark:bg-neutral-900/80"
          title="Edit your region and interests"
        >
          ⚙️
        </button>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-full bg-tea-500 px-3 py-1.5 text-sm font-semibold text-white shadow transition hover:bg-tea-600 disabled:opacity-60"
        >
          <span className={loading ? "inline-block animate-spin" : ""}>↻</span>
          <span className="hidden text-xs opacity-90 sm:inline">{updated}</span>
          Refresh
        </button>
      </div>
    </header>
  );
}

function CaughtUp({
  hasItems,
  loading,
  onRefresh,
  onShowAll,
  end,
}: {
  hasItems: boolean;
  loading: boolean;
  onRefresh: () => void;
  onShowAll?: () => void;
  end?: boolean;
}) {
  return (
    <section className="snap-card flex h-[100dvh] w-full items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <div className="text-6xl">{end ? "🎬" : "✨"}</div>
        <h2 className="mt-4 text-2xl font-bold">
          {end ? "That's all the tea for now" : "You're all caught up"}
        </h2>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          {hasItems
            ? "New reality-TV stories are summarized every hour. Check back soon or refresh for the latest."
            : "No stories yet. The hourly job will fill this up shortly — or trigger a refresh."}
        </p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="rounded-full bg-tea-500 px-6 py-2.5 font-semibold text-white shadow transition hover:bg-tea-600 disabled:opacity-60"
          >
            {loading ? "Refreshing…" : "Refresh feed"}
          </button>
          {onShowAll ? (
            <button
              onClick={onShowAll}
              className="text-sm font-medium text-tea-600 hover:text-tea-700"
            >
              Re-read earlier stories
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
