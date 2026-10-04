"use client";

import { useState, useEffect, useCallback } from "react";

export type SearchType = "flight" | "train" | "hotel" | "cab";

export interface SearchHistoryEntry {
  type: SearchType;
  label: string;
  params: Record<string, string>;
  created_at: string;
}

const STORAGE_KEY = "tripifi_search_history";
const MAX_HISTORY = 10;

function readHistory(): SearchHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeHistory(history: SearchHistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // ignore quota exceeded
  }
}

export function addSearchToHistory(entry: Omit<SearchHistoryEntry, "created_at">): void {
  const history = readHistory();
  // Remove duplicate (same type + similar params)
  const filtered = history.filter(
    (h) => !(h.type === entry.type && JSON.stringify(h.params) === JSON.stringify(entry.params))
  );
  const newEntry: SearchHistoryEntry = { ...entry, created_at: new Date().toISOString() };
  const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);
  writeHistory(updated);
}

export function getSearchHistory(type?: SearchType): SearchHistoryEntry[] {
  const history = readHistory();
  if (!type) return history;
  return history.filter((h) => h.type === type);
}

export function clearSearchHistory(type?: SearchType): void {
  if (typeof window === "undefined") return;
  if (!type) {
    window.localStorage.removeItem(STORAGE_KEY);
  } else {
    const history = readHistory().filter((h) => h.type !== type);
    writeHistory(history);
  }
}

export function useSearchHistory(type?: SearchType) {
  const [history, setHistory] = useState<SearchHistoryEntry[]>([]);

  useEffect(() => {
    setHistory(getSearchHistory(type));
    const handleStorage = () => setHistory(getSearchHistory(type));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [type]);

  const add = useCallback(
    (entry: Omit<SearchHistoryEntry, "created_at">) => {
      addSearchToHistory(entry);
      setHistory(getSearchHistory(type));
    },
    [type]
  );

  const clear = useCallback(() => {
    clearSearchHistory(type);
    setHistory([]);
  }, [type]);

  return { history, add, clear };
}