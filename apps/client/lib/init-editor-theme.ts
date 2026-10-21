/**
 * Editor theme utility that manages Monaco editor themes.
 * Features:
 * - Theme initialization and persistence
 * - Theme application to editor and UI
 * - CSS variable handling for consistent theming
 * - System/dark mode synchronization
 *
 * By Dulapah Vibulsanti (https://dulapahv.dev)
 */

import type { Monaco } from "@monaco-editor/react";
import themeList from "monaco-themes/themes/themelist.json";

const DEFAULT_THEMES = {
  "vs-dark": {
    name: "Dark (Visual Studio)",
    variables: {
      "--toolbar-bg-secondary": "#2a1b12",
      "--panel-background": "#1b120d",
      "--toolbar-foreground": "#fff",
      "--toolbar-bg-primary": "#c2410c",
      "--toolbar-accent": "#c2410c",
      "--panel-text-accent": "#fff",
    },
  },
  light: {
    name: "Light (Visual Studio)",
    variables: {
      "--toolbar-bg-secondary": "#fff7ed",
      "--panel-background": "#fffcf8",
      "--toolbar-foreground": "#000",
      "--toolbar-bg-primary": "#c2410c",
      "--toolbar-accent": "#c2410c",
      "--panel-text-accent": "#fff",
    },
  },
};

const setCSSVariables = (variables: Record<string, string>) => {
  if (typeof document === "undefined") {
    return; // Check for SSR
  }

  const root = document.documentElement;
  for (const [key, value] of Object.entries(variables)) {
    root.style.setProperty(key, value);
  }
};

const CODEX_DARK_THEME = "codex-ember-dark";
export const getMonacoThemeName = (theme: string) =>
  theme === "vs-dark" ? CODEX_DARK_THEME : theme;

// Global Monaco instance reference
let globalMonaco: Monaco | null = null;

// Function to register Monaco
export const registerMonaco = (monaco: Monaco) => {
  globalMonaco = monaco;
  globalMonaco.editor.defineTheme(CODEX_DARK_THEME, {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "A8795E", fontStyle: "italic" },
      { token: "string", foreground: "FBBF8A" },
      { token: "number", foreground: "FDBA74" },
      { token: "keyword", foreground: "FB923C" },
      { token: "type", foreground: "FCD34D" },
      { token: "function", foreground: "FFEDD5" },
    ],
    colors: {
      "editor.background": "#1B120D",
      "editor.foreground": "#F7E9DC",
      "editorLineNumber.foreground": "#8F705E",
      "editorLineNumber.activeForeground": "#FDBA74",
      "editorCursor.foreground": "#FB923C",
      "editor.selectionBackground": "#9A431F66",
      "editor.inactiveSelectionBackground": "#6B341F55",
      "editor.lineHighlightBackground": "#2A1B12",
      "editorIndentGuide.background": "#432D1D",
      "editorIndentGuide.activeBackground": "#9A5A32",
      "editorWidget.background": "#2A1B12",
      "editorWidget.border": "#704321",
      "editorBracketMatch.background": "#9A431F44",
      "editorBracketMatch.border": "#FB923C",
      focusBorder: "#FB923C",
    },
  });

  // Apply the current theme to Monaco if it exists
  const savedTheme =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("editorTheme")
      : null;
  if (savedTheme && globalMonaco) {
    globalMonaco.editor.setTheme(getMonacoThemeName(savedTheme));
  } else if (globalMonaco) {
    // If no saved theme, check system preference
    const systemPrefersDark =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const defaultTheme = systemPrefersDark ? "vs-dark" : "light";
    globalMonaco.editor.setTheme(getMonacoThemeName(defaultTheme));
  }
};

// Function to check system preference for dark mode
const getSystemPreference = (): "dark" | "light" => {
  if (typeof window === "undefined") {
    return "dark"; // Default for SSR
  }

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// biome-ignore lint/complexity/noExcessiveCognitiveComplexity: theme initialization handles many CSS variable mappings
export const initEditorTheme = () => {
  if (typeof window === "undefined") {
    return; // Skip during SSR
  }

  const savedTheme = localStorage.getItem("editorTheme");

  if (savedTheme) {
    // Apply saved theme variables
    if (savedTheme in DEFAULT_THEMES) {
      // For default themes
      const themeConfig =
        DEFAULT_THEMES[savedTheme as keyof typeof DEFAULT_THEMES];
      setCSSVariables(themeConfig.variables);
      setCSSVariables({ "--status-bar-text": "#fff" });

      // Set document classes for dark mode
      if (savedTheme === "vs-dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }
    } else {
      // For custom themes
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const themeData = require(
          `monaco-themes/themes/${themeList[savedTheme as keyof typeof themeList]}.json`
        );

        // Set document classes for dark mode
        if (themeData.base === "vs-dark") {
          document.documentElement.classList.add("dark");
          document.documentElement.classList.remove("light");
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.classList.add("light");
        }

        setCSSVariables({
          "--toolbar-bg-primary": "#c2410c",
          "--toolbar-bg-secondary":
            themeData.base === "vs-dark" ? "#2a1b12" : "#fff7ed",
          "--toolbar-foreground": themeData.colors["editor.foreground"].slice(
            0,
            7
          ),
          "--toolbar-accent": "#c2410c",
          "--panel-text-accent": "#fff",
          "--panel-background":
            themeData.base === "vs-dark" ? "#1b120d" : "#fffcf8",
          "--status-bar-text": "#fff",
        });
      } catch (error) {
        console.error("Failed to load theme:", error);
      }
    }
  } else {
    // No saved theme, check system preference and apply appropriate default theme
    const systemPreference = getSystemPreference();
    const defaultTheme = systemPreference === "dark" ? "vs-dark" : "light";

    // Store in localStorage to maintain consistency
    localStorage.setItem("editorTheme", defaultTheme);

    // Apply default theme based on system preference
    const themeConfig =
      DEFAULT_THEMES[defaultTheme as keyof typeof DEFAULT_THEMES];
    setCSSVariables(themeConfig.variables);
    setCSSVariables({ "--status-bar-text": "#fff" });

    // Set document classes
    if (defaultTheme === "vs-dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  }

  // Apply theme to Monaco if it's available
  if (globalMonaco) {
    const theme =
      localStorage.getItem("editorTheme") ||
      (getSystemPreference() === "dark" ? "vs-dark" : "light");
    globalMonaco.editor.setTheme(getMonacoThemeName(theme));
  }
};

// Run initialization immediately
if (typeof window !== "undefined") {
  // Use setTimeout to ensure this runs after the browser has fully loaded
  setTimeout(initEditorTheme, 0);
}

// Export a utility function that components can use to apply a theme
export const applyEditorTheme = (key: string, value: string) => {
  localStorage.setItem("editorTheme", key);

  if (key in DEFAULT_THEMES) {
    const themeConfig = DEFAULT_THEMES[key as keyof typeof DEFAULT_THEMES];
    setCSSVariables(themeConfig.variables);
    setCSSVariables({ "--status-bar-text": "#fff" });

    // Set document classes
    if (key === "vs-dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.classList.add("light");
    }
  } else {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const themeData = require(`monaco-themes/themes/${value}.json`);

      // Set document classes
      if (themeData.base === "vs-dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("light");
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
      }

      setCSSVariables({
        "--toolbar-bg-primary": "#ea580c",
        "--toolbar-bg-secondary":
          themeData.base === "vs-dark" ? "#2a1b12" : "#fff7ed",
        "--toolbar-foreground": themeData.colors["editor.foreground"].slice(
          0,
          7
        ),
        "--toolbar-accent": "#f97316",
        "--panel-text-accent": "#fff",
        "--panel-background":
          themeData.base === "vs-dark" ? "#1b120d" : "#fffcf8",
        "--status-bar-text": "#fff",
      });
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  }

  if (globalMonaco) {
    globalMonaco.editor.setTheme(getMonacoThemeName(key));
  }

  // Return the appropriate next-themes value
  if (key === "vs-dark") {
    return "dark";
  }
  if (key in DEFAULT_THEMES) {
    return "light";
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const themeData = require(`monaco-themes/themes/${value}.json`);
    return themeData.base === "vs-dark" ? "dark" : "light";
  } catch (error) {
    console.error("Failed to determine theme mode:", error);
    return "dark";
  }
};
