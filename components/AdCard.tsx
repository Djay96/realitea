"use client";

import { useEffect, useRef } from "react";

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const SLOT = process.env.NEXT_PUBLIC_ADSENSE_SLOT;

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export default function AdCard({ slotKey }: { slotKey: string }) {
  const pushed = useRef(false);

  useEffect(() => {
    pushed.current = false;
    if (!CLIENT || !SLOT) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // adsbygoogle not ready yet
    }
  }, [slotKey]);

  return (
    <section className="snap-card flex h-[100dvh] w-full items-center justify-center px-4 py-6">
      <div className="flex h-full max-h-[680px] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-tea-200/60 bg-white/80 shadow-xl backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/80">
        <div className="flex items-center justify-between px-5 pt-5">
          <span className="text-xs font-semibold uppercase tracking-widest text-tea-600">
            Sponsored
          </span>
        </div>
        <div className="flex flex-1 items-center justify-center p-5">
          {CLIENT && SLOT ? (
            <ins
              key={slotKey}
              className="adsbygoogle"
              style={{ display: "block", width: "100%", height: "100%" }}
              data-ad-client={CLIENT}
              data-ad-slot={SLOT}
              data-ad-format="auto"
              data-full-width-responsive="true"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center rounded-2xl border border-dashed border-tea-300 text-center text-sm text-tea-700/70 dark:border-neutral-700 dark:text-neutral-400">
              <span className="text-3xl">📺</span>
              <p className="mt-2 px-6">
                Ad space — set <code>NEXT_PUBLIC_ADSENSE_CLIENT</code> and{" "}
                <code>NEXT_PUBLIC_ADSENSE_SLOT</code> to show real ads here.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
