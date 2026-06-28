"use client";

const KEY = "realitea:read";
const MAX_TRACKED = 2000;

function load(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function save(ids: string[]): void {
  if (typeof window === "undefined") return;
  try {
    // Keep the list bounded so it doesn't grow forever.
    const trimmed = ids.slice(-MAX_TRACKED);
    window.localStorage.setItem(KEY, JSON.stringify(trimmed));
  } catch {
    // ignore quota errors
  }
}

export function getReadSet(): Set<string> {
  return new Set(load());
}

export function markRead(id: string): void {
  const set = new Set(load());
  if (set.has(id)) return;
  set.add(id);
  save(Array.from(set));
}

export function markManyRead(ids: string[]): void {
  if (ids.length === 0) return;
  const set = new Set(load());
  let changed = false;
  for (const id of ids) {
    if (!set.has(id)) {
      set.add(id);
      changed = true;
    }
  }
  if (changed) save(Array.from(set));
}

export function clearRead(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}
