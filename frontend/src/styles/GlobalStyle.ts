import { createGlobalStyle } from "styled-components";

/*
 * Globale Styles & Design-Tokens des Session Planners.
 *
 * Grundidee: MUI-artige Struktur (Elevation, 8px-Spacing, weiche Rundungen,
 * sanfte Motion) kombiniert mit den echten neuefische-Markenfarben
 * (Orange-Rot #D93500 als Action-Farbe).
 *
 * Die Tokens liegen bewusst als CSS-Custom-Properties vor (nicht als
 * styled-components-Theme-Objekt): Komponenten referenzieren var(--token),
 * und der Dark Mode wird allein durch Umschalten von [data-theme] auf <html>
 * aktiviert – ganz ohne Re-Render.
 */
export const GlobalStyle = createGlobalStyle`
  :root {
    /* --- Marken-Rohfarben (aus neuefische.de) --- */
    --nf-orange: #d93500;
    --nf-orange-hover: #c43000;
    --nf-orange-light: #ff6738;
    --nf-orange-bright: #ff4a11;
    --nf-peach: #ffb7a0;

    /* --- Radien --- */
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 16px;
    --radius-pill: 999px;

    /* --- Spacing (8px-Raster) --- */
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 24px;
    --space-6: 32px;
    --space-7: 48px;

    /* --- Typografie --- */
    --font-sans: "Inter Variable", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    --font-display: "Inter Variable", system-ui, -apple-system, "Segoe UI", sans-serif;

    --text-xs: 12px;
    --text-sm: 14px;
    --text-md: 16px;
    --text-lg: 20px;
    --text-xl: 26px;
    --text-2xl: 34px;

    --weight-regular: 400;
    --weight-medium: 500;
    --weight-semibold: 600;
    --weight-bold: 700;

    /* --- Motion --- */
    --transition-fast: 120ms ease;
    --transition-base: 200ms ease;

    /* --- Layout --- */
    --header-height: 64px;
    --content-max-width: 1120px;

    /* ==========================================================
     * SEMANTISCHE TOKENS – LIGHT (Default)
     * ========================================================== */

    /* Flaechen */
    --color-bg: #f3f5f9;
    --color-surface: #ffffff;
    --color-surface-2: #f3f5f9;
    --color-surface-hover: #eef1f6;

    /* Text */
    --color-text: #252629;
    --color-text-secondary: #6f727b;
    --color-text-muted: #9fa1a8;

    /* Linien */
    --color-border: #e4e8f0;
    --color-border-strong: #cfd4de;

    /* Primary / Action */
    --color-primary: var(--nf-orange);
    --color-primary-hover: var(--nf-orange-hover);
    --color-primary-contrast: #ffffff;
    --color-primary-soft: rgba(217, 53, 0, 0.08);
    --color-primary-soft-hover: rgba(217, 53, 0, 0.14);
    --color-focus-ring: rgba(217, 53, 0, 0.28);

    /* Status */
    --color-danger: #d32f2f;
    --color-danger-hover: #b71c1c;
    --color-danger-soft: rgba(211, 47, 47, 0.1);
    --color-success: #2e7d32;
    --color-success-soft: rgba(46, 125, 50, 0.12);
    --color-info: #1f6feb;
    --color-info-soft: rgba(31, 111, 235, 0.12);

    /* Elevation (MUI-artig) */
    --shadow-1: 0 1px 2px rgba(37, 38, 41, 0.06), 0 1px 3px rgba(37, 38, 41, 0.08);
    --shadow-2: 0 2px 6px rgba(37, 38, 41, 0.08), 0 4px 12px rgba(37, 38, 41, 0.08);
    --shadow-3: 0 8px 24px rgba(37, 38, 41, 0.12), 0 16px 40px rgba(37, 38, 41, 0.14);

    /* Overlay */
    --color-overlay: rgba(37, 38, 41, 0.45);

    color-scheme: light;
  }

  /* ============================================================
   * SEMANTISCHE TOKENS – DARK
   * Aktiviert ueber <html data-theme="dark">.
   * ============================================================ */

  :root[data-theme="dark"] {
    --color-bg: #17181b;
    --color-surface: #212226;
    --color-surface-2: #2a2c30;
    --color-surface-hover: #303236;

    --color-text: #f3f5f9;
    --color-text-secondary: #9fa1a8;
    --color-text-muted: #6f727b;

    --color-border: #3f4145;
    --color-border-strong: #52555b;

    /* Auf Dunkel wirkt das hellere Orange freundlicher und kontrastreicher */
    --color-primary: var(--nf-orange-light);
    --color-primary-hover: var(--nf-orange-bright);
    --color-primary-contrast: #1a0d07;
    --color-primary-soft: rgba(255, 103, 56, 0.14);
    --color-primary-soft-hover: rgba(255, 103, 56, 0.22);
    --color-focus-ring: rgba(255, 103, 56, 0.35);

    --color-danger: #f26b6b;
    --color-danger-hover: #ff8a8a;
    --color-danger-soft: rgba(242, 107, 107, 0.16);
    --color-success: #6cc070;
    --color-success-soft: rgba(108, 192, 112, 0.16);
    --color-info: #5a9bff;
    --color-info-soft: rgba(90, 155, 255, 0.16);

    --shadow-1: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.5);
    --shadow-2: 0 2px 6px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.5);
    --shadow-3: 0 8px 24px rgba(0, 0, 0, 0.55), 0 16px 40px rgba(0, 0, 0, 0.6);

    --color-overlay: rgba(0, 0, 0, 0.6);

    color-scheme: dark;
  }

  /* --- Reset / Basis --- */
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  * {
    margin: 0;
  }

  html {
    -webkit-text-size-adjust: 100%;
  }

  body {
    min-height: 100vh;
    font-family: var(--font-sans);
    font-size: var(--text-md);
    line-height: 1.5;
    color: var(--color-text);
    background-color: var(--color-bg);
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
    transition: background-color var(--transition-base), color var(--transition-base);
  }

  h1, h2, h3, h4 {
    font-family: var(--font-display);
    line-height: 1.2;
    font-weight: var(--weight-bold);
    letter-spacing: -0.01em;
  }

  button {
    font-family: inherit;
    font-size: inherit;
  }

  input, select, textarea {
    font-family: inherit;
    font-size: inherit;
  }

  img {
    display: block;
    max-width: 100%;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  :focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
`;
