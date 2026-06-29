"use client";

import { useMemo, useState } from "react";
import type { RegionSlug } from "@/lib/types";
import { INTEREST_OPTIONS, USER_REGIONS } from "@/lib/sources";
import { guessRegionFromLocale } from "@/lib/userPrefs";

/** Countries grouped by continent for the picker (order preserved from catalog). */
function useGroupedRegions() {
  return useMemo(() => {
    const groups: { group: string; regions: typeof USER_REGIONS }[] = [];
    for (const r of USER_REGIONS) {
      let g = groups.find((x) => x.group === r.group);
      if (!g) {
        g = { group: r.group, regions: [] };
        groups.push(g);
      }
      g.regions.push(r);
    }
    return groups;
  }, []);
}

interface OnboardingProps {
  onComplete: (region: RegionSlug, interests: string[]) => void;
  onClose?: () => void;
}

export default function Onboarding({ onComplete, onClose }: OnboardingProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [region, setRegion] = useState<RegionSlug>(() => guessRegionFromLocale());
  const [interests, setInterests] = useState<string[]>([]);
  const groupedRegions = useGroupedRegions();

  const toggleInterest = (slug: string) => {
    setInterests((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div className="w-full max-w-md animate-fade-in rounded-3xl bg-white p-6 shadow-2xl dark:bg-neutral-900">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-tea-600">
              Step {step} of 2
            </p>
            <h2 className="mt-1 text-2xl font-bold">
              {step === 1 ? "Pick your country" : "What do you watch?"}
            </h2>
          </div>
          {onClose ? (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-3 py-1 text-sm text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Later
            </button>
          ) : null}
        </div>

        {step === 1 ? (
          <>
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
              You'll see news only for the reality shows in the country you pick.
            </p>
            <div className="max-h-72 space-y-4 overflow-y-auto pr-1">
              {groupedRegions.map((g) => (
                <div key={g.group}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400">
                    {g.group}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {g.regions.map((r) => (
                      <button
                        key={r.slug}
                        type="button"
                        onClick={() => setRegion(r.slug)}
                        className={`rounded-2xl border px-3 py-3 text-left text-sm font-medium transition ${
                          region === r.slug
                            ? "border-tea-500 bg-tea-50 text-tea-800 dark:bg-tea-900/30 dark:text-tea-200"
                            : "border-neutral-200 hover:border-tea-300 dark:border-neutral-700"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="mt-6 w-full rounded-full bg-tea-500 py-3 font-semibold text-white hover:bg-tea-600"
            >
              Next
            </button>
          </>
        ) : (
          <>
            <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
              Select at least one show — we'll personalize your feed.
            </p>
            <div className="flex max-h-64 flex-wrap gap-2 overflow-y-auto">
              {INTEREST_OPTIONS.map((opt) => {
                const active = interests.includes(opt.slug);
                return (
                  <button
                    key={opt.slug}
                    type="button"
                    onClick={() => toggleInterest(opt.slug)}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                      active
                        ? "border-tea-500 bg-tea-500 text-white"
                        : "border-neutral-200 hover:border-tea-400 dark:border-neutral-700"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              disabled={interests.length === 0}
              onClick={() => onComplete(region, interests)}
              className="mt-6 w-full rounded-full bg-tea-500 py-3 font-semibold text-white hover:bg-tea-600 disabled:opacity-50"
            >
              Get my tea
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-2 w-full py-2 text-sm text-neutral-500"
            >
              Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
