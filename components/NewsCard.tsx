"use client";

import { useEffect, useRef } from "react";
import type { NewsItem } from "@/lib/types";
import CardImage from "./CardImage";

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export default function NewsCard({
  item,
  onRead,
}: {
  item: NewsItem;
  onRead: (id: string) => void;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          // Mark as read once the card is mostly in view.
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            onRead(item.id);
          }
        }
      },
      { threshold: [0.6] },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [item.id, onRead]);

  return (
    <article
      ref={ref}
      className="snap-card flex h-[100dvh] w-full items-center justify-center px-4 py-6"
    >
      <div className="relative flex h-full max-h-[680px] w-full max-w-md animate-fade-in flex-col overflow-hidden rounded-3xl border border-tea-200/60 bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <CardImage imageUrl={item.imageUrl} topics={item.topics} title={item.title} />
        <span className="absolute left-7 top-7 z-10 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white backdrop-blur">
          {item.source}
        </span>

        <div className="flex flex-1 flex-col p-5">
          <h2 className="text-xl font-bold leading-snug">{item.title}</h2>
          <p className="mt-3 flex-1 overflow-y-auto text-[15px] leading-relaxed text-neutral-700 no-scrollbar dark:text-neutral-300">
            {item.summary}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-tea-100 pt-3 text-sm dark:border-neutral-800">
            <span className="text-neutral-500">{timeAgo(item.publishedAt)}</span>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-tea-600 hover:text-tea-700"
            >
              Read full story →
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
