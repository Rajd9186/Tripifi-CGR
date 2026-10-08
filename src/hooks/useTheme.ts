"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocalStorage } from "./useLocalStorage";

export type Theme = "dark" | "light" | "system";

export function useTheme(): [Theme, (theme: Theme) => void, boolean] {
  const [theme, setTheme] = useLocalStorage<Theme>("tripifi-theme", "system");
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const updateResolvedTheme = () => {
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setResolvedTheme(systemTheme);
        document.documentElement.classList.toggle("dark", systemTheme === "dark");
      } else {
        setResolvedTheme(theme);
        document.documentElement.classList.toggle("dark", theme === "dark");
      }
    };

    updateResolvedTheme();

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", updateResolvedTheme);
      return () => mediaQuery.removeEventListener("change", updateResolvedTheme);
    }
  }, [theme]);

  const setThemeWithStorage = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, [setTheme]);

  return [theme, setThemeWithStorage, mounted];
}