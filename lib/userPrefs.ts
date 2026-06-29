"use client";

import type { RegionSlug, UserPrefs } from "./types";

const KEY = "realitea:prefs";

/** Map a browser-locale country subtag (e.g. "pt-BR" → "br") to our country bucket. */
const LOCALE_COUNTRY_TO_REGION: Record<string, RegionSlug> = {
  us: "us", ca: "canada", mx: "mexico", br: "brazil", ar: "argentina",
  gb: "uk", uk: "uk", es: "spain", de: "germany", fr: "france", it: "italy",
  se: "sweden", nl: "netherlands", ng: "nigeria", za: "south-africa",
  tr: "turkey", in: "india", kr: "korea", jp: "japan", id: "indonesia",
  ph: "philippines", th: "thailand", vn: "vietnam", my: "malaysia",
  au: "australia", nz: "australia",
};

/** Map a bare language code (no region) to a sensible default country. */
const LANG_TO_REGION: Record<string, RegionSlug> = {
  pt: "brazil", tr: "turkey", ko: "korea", ja: "japan", id: "indonesia",
  th: "thailand", vi: "vietnam", ms: "malaysia", de: "germany", sv: "sweden",
  nl: "netherlands", it: "italy", fr: "france", hi: "india",
};

export function guessRegionFromLocale(): RegionSlug {
  if (typeof navigator === "undefined") return "global";
  const lang = navigator.language.toLowerCase();
  const [base, country] = lang.split("-");
  if (country && LOCALE_COUNTRY_TO_REGION[country]) return LOCALE_COUNTRY_TO_REGION[country];
  if (LANG_TO_REGION[base]) return LANG_TO_REGION[base];
  if (base === "en") return "us";
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
