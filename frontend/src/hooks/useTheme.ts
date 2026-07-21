import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "sp-theme";

/** Ermittelt das Start-Theme: gespeicherte Wahl vor System-Praeferenz. */
function getInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/**
 * Verwaltet das Farbschema.
 *
 * Der eigentliche Umschalt-Mechanismus ist nur das data-theme-Attribut auf
 * <html> – die Tokens in GlobalStyle reagieren darauf, ganz ohne React-Re-Render
 * des Komponentenbaums. Der State hier dient nur dazu, den Toggle-Button
 * korrekt darzustellen und die Wahl in localStorage zu persistieren.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  function toggleTheme() {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  }

  return { theme, toggleTheme };
}
