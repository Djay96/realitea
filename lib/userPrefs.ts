"use client";

import type { RegionSlug, UserPrefs } from "./types";

const KEY = "realitea:prefs";

export function guessRegionFromLocale(): RegionSlug {
  if (typeof navigator === "undefined") return "global";
  const lang = navigator.language.toLowerCase();
  if (lang.includes("in")) return "india";
  if (lang.includes("au")) return "australia";
  if (lang.includes("ca")) return "canada";
  if (lang.includes("gb") || lang.endsWith("-uk")) return "uk";
  if (lang.startsWith("en")) return "us";
  return "global";
}

export function loadPrefs(): UserPrefs | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const prefs = JSON.parse(raw) as UserPrefs;
    if (!prefs.region || !Array.isArray(prefs.interests) || prefs.interests.length === 0) {
      return null;
    }
    return prefs;
  } catch {
    return null;
  }
}

export function savePrefs(prefs: Omit<UserPrefs, "onboardedAt">): UserPrefs {
  const full: UserPrefs = { ...prefs, onboardedAt: new Date().toISOString() };
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, JSON.stringify(full));
  }
  return full;
}

export function clearPrefs(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
}
