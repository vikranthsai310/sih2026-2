# 18 · Design System

> **Purpose:** The visual and interaction language of the Drishti3D web app: brand, principles, design tokens (colour, type, spacing, motion), layout grid, icons, the component catalogue, accessibility rules, bilingual copy and the rules for accuracy charts. The screens themselves are specified in [09-viewer-and-ui.md](09-viewer-and-ui.md). A clickable wireframe prototype that uses these tokens is in [wireframes/](wireframes/README.md).
>
> **Status:** Draft v1.0 · 2026-09-30 · Owner: R5 Frontend Engineer (with R2 for the accuracy and uncertainty visuals)

Stage IDs (S0–S9, P), profiles, confidence classes and accuracy targets come from [00-project-charter.md](00-project-charter.md). Screen behaviour comes from [09](09-viewer-and-ui.md). If this document disagrees with either, they win, and the difference goes in [§15](#15-deltas-and-open-items).

---

## Table of contents

1. [Brand](#1-brand)
2. [Design principles](#2-design-principles)
3. [Platform and themes](#3-platform-and-themes)
4. [Colour](#4-colour)
5. [CSS variables](#5-css-variables)
6. [Typography](#6-typography)
7. [Spacing, radius, elevation, motion](#7-spacing-radius-elevation-motion)
8. [Grid, breakpoints and layout](#8-grid-breakpoints-and-layout)
9. [Iconography](#9-iconography)
10. [Components catalogue](#10-components-catalogue)
11. [Touch and field ergonomics](#11-touch-and-field-ergonomics)
12. [Accessibility and keyboard](#12-accessibility-and-keyboard)
13. [Copy guidelines (English and Hindi)](#13-copy-guidelines-english-and-hindi)
14. [Data-visualisation rules for accuracy charts](#14-data-visualisation-rules-for-accuracy-charts)
15. [Deltas and open items](#15-deltas-and-open-items)
16. [Related documents](#related-documents)

---

## 1. Brand

| Item | Value |
|---|---|
| Name | **Drishti3D**. "Drishti" (दृष्टि) means *vision / sight*. It is always written as one word with a capital D and "3D" attached, never "Drishti 3D" or "DRISHTI3D". In Hindi UI text: दृष्टि3D. |
| Tagline | *One pass. One video. A measurable 3D world.* · हिंदी: *एक उड़ान। एक वीडियो। मापने योग्य 3D दुनिया।* |
| Voice | Plain, precise, calm. We state numbers with their uncertainty and never oversell. "Estimated", "inferred" and "not validated" are ordinary words in our UI, not things to hide. |
| Audience | NTRO field operators, GEOINT analysts, commanders (personas in [09 §1](09-viewer-and-ui.md#1-users-and-context-of-use)). |

### 1.1 Logo concept

- **Mark:** an almond-shaped **eye** outline (sight) whose upper lid is drawn as the drone's single **flight arc**. The pupil is a small **isometric cube** (a measurable 3D object) with a crosshair dot at its centre (a surveyed point).
- **Construction:** 24 × 24 grid, 2 px stroke, round caps and joins, the same geometry rules as the Lucide icon set (§9), so the mark sits comfortably next to UI icons. At 16 px the cube collapses to a filled hexagon.
- **Wordmark:** "Drishti" in the UI font at weight 600, "3D" in the accent colour at weight 700. Minimum wordmark width 96 px, and clear space around the mark of at least half its height.
- **Colour:** the mark uses `--text` with the pupil in `--accent`. A single-colour version (all `--text`) is used on printed reports and on the classification-marked PDF cover.
- **Don't:** add gradients, a globe, a drone silhouette, or a flag. Don't place the mark on imagery without a solid surface behind it.

The wireframes draw the mark inline (see `docs/wireframes/assets/wireframe.js`, symbol `i-logo`).

---

## 2. Design principles

These refine the UX principles U1–U10 in [09 §2](09-viewer-and-ui.md#2-ux-principles) into rules a designer can apply to any new component.

| # | Principle | What it means for visuals and components |
|---|---|---|
| D1 | **Field-first** | Designed for glare, gloves, a vehicle bonnet and time pressure. Dark "field" theme by default. Targets ≥ 48 px in field mode. Critical text ≥ 16 px. One primary (accent-filled) button per view. No hover-only information. |
| D2 | **Glanceable** | A status must be readable in about 1 second from 1 m away: icon + word + colour, in that order of importance. Headline numbers use the large tabular numeral style (§6). The run's state, its accuracy tier and its CE90 always appear in the same place: the status chip and the accuracy badge. |
| D3 | **Honest uncertainty** | Every measured number shows `±` and names its level (1σ or 90 %) and type (relative or absolute). *Inferred* surfaces carry hatching that no theme or setting can remove. Estimated, unvalidated and example values are visibly marked (italic + "est." or an **EXAMPLE** tag). Colour never carries meaning on its own. |
| D4 | **Offline** | Everything the UI needs ships in the bundle: fonts, icons, the Cesium assets, the geoid grid and the basemap. No CDN, no web fonts, no telemetry, no remote avatars. Connection state refers to the *local* server and is always visible in the top bar. |
| D5 | **Calm by default, loud on exception** | Surfaces and chrome are neutral grey. Colour is reserved for: the single primary action, status (ok / warn / danger / info), confidence classes and semantic classes. If everything is coloured, nothing is. |
| D6 | **The map is the hero** | In the viewer, panels are narrow, collapsible and never cover the scale bar, the north arrow or the coordinate readout. Panel chrome uses surfaces, not shadows, so the scene stays the brightest element on screen. |

---

## 3. Platform and themes

| Decision | Detail |
|---|---|
| Product form | **One offline-first web app** (React + Vite + CesiumJS, [09 §8](09-viewer-and-ui.md#8-frontend-component-architecture)) served by the local FastAPI/nginx stack on the ground-station laptop at `http://127.0.0.1:8080`. |
| Tablet | The same app, installed as a **PWA** on a rugged tablet on the same local network. Responsive tablet layout (§8). Full functionality. |
| Phone | **Read-only viewer**: missions list, 3D viewer (navigate, layers, coordinate pick, saved measurements), accuracy report. No uploads, runs, exports or settings other than language and theme. Actions that change data are hidden and a "Read-only on phone" banner explains why. |
| Themes | **Field** (dark, default) and **Analyst** (light). [09 §5.8](09-viewer-and-ui.md#58-settings) calls the light theme "Light (office)"; it is the same theme. The high-contrast theme listed in [09 §7.4](09-viewer-and-ui.md#74-theme-tokens) is an accessibility variant of Field and keeps its 09 values. |
| Theme switch | Top-bar button (moon/sun) and Settings → Display. Stored per device. Respects `prefers-color-scheme` only on first launch; after that the user's choice wins. |
| Field mode | Field theme + larger targets (48 px, 56 px for primary actions when "Large targets" is on) + body text never below 16 px. Analyst theme may use denser tables (44 px rows, 14 px secondary text). |

---

## 4. Colour

All ratios below are WCAG 2.x contrast ratios, computed from the hex values (sRGB relative luminance). **AA** requires 4.5 : 1 for body text and 3 : 1 for large text (≥ 24 px regular or ≥ 18.66 px bold) and for UI component boundaries and meaningful graphics (WCAG 2.2 SC 1.4.3 and 1.4.11).

### 4.1 Surfaces, text and borders

| Token | Field (dark) | Analyst (light) | Use |
|---|---|---|---|
| `--bg` | `#0E1116` | `#F7F8FA` | Page background behind panels |
| `--surface` | `#161B22` | `#FFFFFF` | Panels, cards, top bar, dialogs |
| `--surface-2` | `#1C232D` | `#F0F2F5` | Raised or inset areas: table headers, input fields, hover rows |
| `--surface-3` | `#242C38` | `#E7EBF0` | Pressed / selected rows, skeleton blocks |
| `--scrim` | `rgba(1,4,9,0.72)` | `rgba(31,35,40,0.45)` | Behind dialogs and bottom sheets |
| `--text` | `#E6EDF3` | `#1F2328` | Primary text and icons |
| `--text-muted` | `#9DA7B3` | `#59636E` | Secondary text, units, captions |
| `--text-on-accent` | `#0E1116` | `#FFFFFF` | Text on accent / danger fills |
| `--border` | `#30363D` | `#D0D7DE` | Decorative dividers only (not the sole boundary of a control) |
| `--border-strong` | `#6E7681` | `#818B98` | Input, checkbox and toggle boundaries; chart axes |

| Pair | Field ratio | Analyst ratio | Required | Result |
|---|---|---|---|---|
| `--text` on `--surface` | 14.64 | 15.80 | 4.5 | AA ✓ (AAA) |
| `--text` on `--surface-3` | 11.91 | 13.19 | 4.5 | AA ✓ |
| `--text-muted` on `--surface` | 7.09 | 6.11 | 4.5 | AA ✓ |
| `--text-muted` on `--surface-2` | 6.49 | 5.45 | 4.5 | AA ✓ |
| `--border-strong` on `--surface` | 3.77 | 3.45 | 3.0 (UI) | AA ✓ |
| `--border` on `--surface` | 1.42 | 1.45 | n/a | decorative only |

### 4.2 Accent and semantic status colours

| Token | Field | Analyst | Meaning | Icon (always paired) |
|---|---|---|---|---|
| `--accent` | `#4C9AFF` | `#0B5CD5` | Primary action, focus ring, selection, links, the "anchored" series in charts | — |
| `--ok` | `#3FB950` | `#1A7F37` | Pass, complete, check succeeded | `circle-check` |
| `--warn` | `#F2B84B` | `#8A5A00` | Usable with warnings, attention | `triangle-alert` |
| `--danger` | `#FF6B6B` | `#CF222E` | Fail, error, destructive | `circle-x` |
| `--info` | `#79C0FF` | `#0969DA` | Neutral information, hints | `info` |

Each status colour also has a `-subtle` background tint (≈ 12–15 % mix with `--surface`) used for banners and badge fills; text on a tint uses `--text`, and the status colour is used for the icon and the left rule.

| Pair | Field | Analyst | Required | Result |
|---|---|---|---|---|
| `--accent` as text on `--surface` | 6.07 | 5.99 | 4.5 | ✓ |
| `--text-on-accent` on `--accent` (primary button) | 6.64 | 5.99 | 4.5 | ✓ |
| `--ok` on `--surface` | 6.81 | 5.08 | 4.5 | ✓ |
| `--warn` on `--surface` / `--surface-2` | 9.67 / 8.84 | 5.93 / 5.28 | 4.5 | ✓ |
| `--danger` on `--surface` | 6.23 | 5.36 | 4.5 | ✓ |
| `--text-on-accent` on `--danger` (destructive button) | 6.81 | 5.36 | 4.5 | ✓ |
| `--info` on `--surface` | 8.89 | 5.19 | 4.5 | ✓ |
| Focus ring (`--accent`) vs `--surface` | 6.07 | 5.99 | 3.0 | ✓ |
| `--text` on any `*-subtle` tint (banners, chips) | ≥ 12.92 | ≥ 13.46 | 4.5 | ✓ |
| Status icon on its own tint (e.g. `--ok` on `--ok-subtle`) | ≥ 5.52 | ≥ 4.47 | 3.0 (graphic) | ✓ |

### 4.3 Confidence classes

The canonical data colours come from the Okabe–Ito palette, as defined in [09 §7.1](09-viewer-and-ui.md#71-classes-from-s9-charter-4-item-3). They are used unchanged in the 3D Tiles style (45 % alpha over the texture). Because a swatch on a light panel can be low-contrast, each class also has an **ink** variant for text and icons in the UI, tuned per theme.

| Class | Data colour (map, both themes) | Ink, Field (ratio on `--surface`) | Ink, Analyst (ratio on `--surface`) | Pattern (redundant encoding) | Legend glyph |
|---|---|---|---|---|---|
| **observed-high** | `#0072B2` blue | `#3D9BE0` (5.74) | `#0072B2` (5.19) | Solid fill | ■ solid square |
| **observed-low** | `#E69F00` orange | `#E69F00` (7.68) | `#8F5B00` (5.73) | Solid fill at 50 % alpha, dotted outline | ■ with dotted border |
| **inferred** | `#CC79A7` reddish purple | `#CC79A7` (5.65) | `#A3457A` (5.69) | **45° diagonal hatch**, always on, in every theme and print | ▨ hatched square |
| no data | transparent | `#999999` outline | `#999999` outline | Outline only | □ empty square |

**Colour-vision check.** We ran the three data colours through the palette validator from the team's data-viz skill (OKLab ΔE × 100, adjacent and all pairs, deutan / protan / tritan simulation). The worst pair is inferred ↔ observed-low, with ΔE 19.3 under deuteranopia (target ≥ 8) and 21.1 for normal vision (floor 15): **pass**. On the Analyst surface, orange (2.25 : 1) and purple (3.06 : 1) are faint as small swatches, so a swatch is **always** drawn with a 1 px `--text` outline and **always** has a text label next to it. On the map this does not apply, because the overlay sits on imagery, not on the panel surface.

**Hatch spec.** Stripes at 45°, 3 px stripe / 5 px gap at 100 % zoom (8 px period), stripe colour = inferred data colour at 100 %, gap = inferred colour at 30 %. In the Cesium `CustomShader` the period is in screen pixels so the hatch stays visible at every zoom level. In CSS: `repeating-linear-gradient(45deg, var(--conf-inf) 0 3px, var(--conf-inf-tint) 3px 8px)`.

### 4.4 Semantic class colours

These are the [09 §7.3](09-viewer-and-ui.md#73-semantic-class-palette) values, which remain canonical. The semantic and confidence overlays are mutually exclusive ("colour by" selector), so they never mix on screen.

| Class | Colour | Secondary encoding | Notes |
|---|---|---|---|
| ground | `#A6761D` brown | — | |
| building | `#D95F02` dark orange | Roof outline 1 px `--text` when selected | Close to *ground* for normal vision (ΔE 9.9). Use class solo toggles and hover labels (below). |
| road | `#666666` grey | — | Deliberately neutral. Contrast on the Field surface is 3.01 : 1 |
| vegetation | `#1B9E77` green | — | |
| water | `#56B4E9` sky blue | — | |
| vehicle / person (masked) | `#E7298A` magenta | **Hatched**, as in 09 | Nearly identical to vegetation under deuteranopia (ΔE 1.7). The hatch is what separates them, so it is mandatory. |
| other | `#E6AB02` mustard | — | |

**Validation result.** Seven categorical classes cannot all be separated for every colour-vision type (validator: vehicle ↔ vegetation ΔE 1.7 deutan; ground ↔ building ΔE 9.9 normal vision). The design therefore makes identity *never colour-only*: (1) the hatch on vehicle/person, (2) per-class toggles with a "solo" long-press / Alt-click, (3) the hover/tap inspector names the class of the picked feature, (4) the legend always shows text labels. See [§15](#15-deltas-and-open-items) for a possible palette revision.

### 4.5 Map and chart neutrals

| Token | Field | Analyst | Use |
|---|---|---|---|
| `--map-bg` | `#1A2027` | `#E9ECEF` | Placeholder ground in wireframes, empty globe |
| `--map-line` | `#56606B` | `#9AA3AD` | Wireframe roads, outlines |
| `--chart-grid` | `#30363D` | `#E1E5EA` | Gridlines (recessive) |
| `--chart-axis` | `#6E7681` | `#818B98` | Axis lines and ticks |
| `--series-gnss` | `#9DA7B3` | `#6E7781` | "GNSS only" series (neutral: the baseline) |
| `--series-anchored` | `= --accent` | `= --accent` | "Anchored" series (the product) |
| `--series-rtk` | `#3FB950` | `#1A7F37` | "RTK/PPK" series, when present (not a pass/fail signal) |
| `--target-line` | `= --text` dashed 4/4 | `= --text` dashed 4/4 | Charter target lines |

---

## 5. CSS variables

The production file is `web/src/theme/tokens.css` ([09 §8.2](09-viewer-and-ui.md#82-component-tree)). The wireframes use the same block in `docs/wireframes/assets/wireframe.css`.

```css
/* ---------- Drishti3D design tokens · v1.0 ---------- */
:root {
  /* type */
  --font-sans: "Noto Sans", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
  --font-deva: "Noto Sans Devanagari", "Nirmala UI", "Mangal", "Kohinoor Devanagari", sans-serif;
  --font-mono: "Noto Sans Mono", ui-monospace, "Cascadia Mono", Consolas, "DejaVu Sans Mono", monospace;
  --fs-display: 2rem;    --lh-display: 2.5rem;   /* 32/40 */
  --fs-h1: 1.5rem;       --lh-h1: 2rem;          /* 24/32 */
  --fs-h2: 1.25rem;      --lh-h2: 1.75rem;       /* 20/28 */
  --fs-h3: 1rem;         --lh-h3: 1.5rem;        /* 16/24 semibold */
  --fs-body: 1rem;       --lh-body: 1.5rem;      /* 16/24 */
  --fs-sm: 0.875rem;     --lh-sm: 1.25rem;       /* 14/20 */
  --fs-xs: 0.75rem;      --lh-xs: 1rem;          /* 12/16, overlines only */
  --fs-num-lg: 1.75rem;  --lh-num-lg: 2rem;      /* 28/32 KPI numerals */

  /* space (4-pt) */
  --sp-0: 0; --sp-1: 2px; --sp-2: 4px; --sp-3: 8px; --sp-4: 12px; --sp-5: 16px;
  --sp-6: 20px; --sp-7: 24px; --sp-8: 32px; --sp-9: 40px; --sp-10: 48px; --sp-11: 64px;

  /* radius */
  --r-xs: 2px; --r-sm: 4px; --r-md: 8px; --r-lg: 12px; --r-pill: 999px;

  /* motion */
  --dur-instant: 0ms; --dur-fast: 100ms; --dur-base: 200ms; --dur-slow: 300ms;
  --ease-standard: cubic-bezier(.2, 0, 0, 1);
  --ease-exit: cubic-bezier(.3, 0, 1, 1);

  /* layout */
  --topbar-h: 56px; --tabs-h: 48px; --statusbar-h: 48px;
  --panel-left-w: 280px; --panel-right-w: 320px;

  /* data colours (theme-independent) */
  --conf-high: #0072B2; --conf-low: #E69F00; --conf-inf: #CC79A7; --conf-nodata: #999999;
  --conf-inf-tint: rgba(204, 121, 167, .30);
  --cls-ground: #A6761D; --cls-building: #D95F02; --cls-road: #666666; --cls-vegetation: #1B9E77;
  --cls-vehicle: #E7298A; --cls-water: #56B4E9; --cls-other: #E6AB02;
}

/* Field (dark) — default */
:root, [data-theme="field"] {
  color-scheme: dark;
  --bg: #0E1116; --surface: #161B22; --surface-2: #1C232D; --surface-3: #242C38;
  --scrim: rgba(1, 4, 9, .72);
  --text: #E6EDF3; --text-muted: #9DA7B3; --text-on-accent: #0E1116;
  --border: #30363D; --border-strong: #6E7681;
  --accent: #4C9AFF; --accent-hover: #6CB0FF; --accent-subtle: #13233D;
  --ok: #3FB950;     --ok-subtle: #12261A;
  --warn: #F2B84B;   --warn-subtle: #2E2410;
  --danger: #FF6B6B; --danger-subtle: #331818;
  --info: #79C0FF;   --info-subtle: #132435;
  --conf-high-ink: #3D9BE0; --conf-low-ink: #E69F00; --conf-inf-ink: #CC79A7;
  --map-bg: #1A2027; --map-line: #56606B;
  --chart-grid: #30363D; --chart-axis: #6E7681;
  --series-gnss: #9DA7B3; --series-anchored: var(--accent); --series-rtk: #3FB950;
  --elev-1: 0 0 0 1px var(--border);
  --elev-2: 0 0 0 1px var(--border), 0 8px 24px rgba(0, 0, 0, .45);
  --elev-3: 0 0 0 1px var(--border), 0 16px 48px rgba(0, 0, 0, .6);
  --target: 48px; --target-primary: 56px;
}

/* Analyst (light) */
[data-theme="analyst"] {
  color-scheme: light;
  --bg: #F7F8FA; --surface: #FFFFFF; --surface-2: #F0F2F5; --surface-3: #E7EBF0;
  --scrim: rgba(31, 35, 40, .45);
  --text: #1F2328; --text-muted: #59636E; --text-on-accent: #FFFFFF;
  --border: #D0D7DE; --border-strong: #818B98;
  --accent: #0B5CD5; --accent-hover: #0A4FB8; --accent-subtle: #E6EFFC;
  --ok: #1A7F37;     --ok-subtle: #E6F4EA;
  --warn: #8A5A00;   --warn-subtle: #FFF4D6;
  --danger: #CF222E; --danger-subtle: #FDE8E9;
  --info: #0969DA;   --info-subtle: #E5F0FC;
  --conf-high-ink: #0072B2; --conf-low-ink: #8F5B00; --conf-inf-ink: #A3457A;
  --map-bg: #E9ECEF; --map-line: #9AA3AD;
  --chart-grid: #E1E5EA; --chart-axis: #818B98;
  --series-gnss: #6E7781; --series-anchored: var(--accent); --series-rtk: #1A7F37;
  --elev-1: 0 1px 2px rgba(31, 35, 40, .08), 0 0 0 1px var(--border);
  --elev-2: 0 4px 12px rgba(31, 35, 40, .12), 0 0 0 1px var(--border);
  --elev-3: 0 12px 32px rgba(31, 35, 40, .18), 0 0 0 1px var(--border);
  --target: 44px; --target-primary: 48px;
}

@media (prefers-reduced-motion: reduce) {
  :root { --dur-fast: 0ms; --dur-base: 0ms; --dur-slow: 0ms; }
}
```

---

## 6. Typography

| Item | Decision |
|---|---|
| Latin | **Noto Sans** (OFL-1.1), bundled as WOFF2 in `web/public/fonts/` (400, 600, 700). Matches [09 §8.1](09-viewer-and-ui.md#81-stack). Inter is an acceptable alternative with the same metrics budget; the stack falls back to system UI fonts if the bundle is missing. |
| Devanagari | **Noto Sans Devanagari** (OFL-1.1), bundled (400, 600). Fallbacks: Nirmala UI (Windows), Mangal, Kohinoor Devanagari. |
| Monospace | **Noto Sans Mono** for run IDs, coordinates, log lines, file paths and hashes. |
| Numerals | Always `font-variant-numeric: tabular-nums` in tables, readouts, progress and KPIs so columns align and values don't jitter while updating. Western Arabic digits in both languages ([09 U10](09-viewer-and-ui.md#2-ux-principles)). |
| Loading | `@font-face` with `font-display: swap`, local URLs only. No Google Fonts. |

**Type scale** (rem based on 16 px; scalable to 200 %):

| Style | Size / line height | Weight | Use |
|---|---|---|---|
| Display | 32 / 40 | 600 | Empty-state headline, report cover |
| H1 | 24 / 32 | 600 | Screen title ("Ingest Check") |
| H2 | 20 / 28 | 600 | Panel title in dialogs |
| H3 / panel title | 16 / 24 | 600 | Card and panel headers |
| Overline | 12 / 16 | 600, +0.06 em, uppercase (English only) | Section labels such as "1 · REQUIRED INPUTS". Hindi overlines are not uppercased or letter-spaced. |
| Body | 16 / 24 | 400 | Default. Minimum for critical text in all themes. |
| Body small | 14 / 20 | 400 | Secondary text, table cells in Analyst theme, units |
| Caption | 12 / 16 | 400 | Chart tick labels and legal footnotes only; never for status or values |
| KPI numeral | 28 / 32 | 600 tabular | Stat tiles, measurement result value |
| Mono | 14 / 20 | 400 | IDs, coordinates, logs |

**Hindi.** Line height for Devanagari runs is at least 1.5 (body: 16 / 26). Hindi strings run 20–40 % longer: buttons have `min-width` and wrap to two lines rather than truncate. Never mix a Hindi label with an uppercase English overline in the same heading.

---

## 7. Spacing, radius, elevation, motion

### 7.1 Spacing (4-point scale)

| Token | px | Typical use |
|---|---|---|
| `--sp-1` | 2 | Hairline gaps in charts (2 px surface gap between bars) |
| `--sp-2` | 4 | Icon-to-text in badges |
| `--sp-3` | 8 | Icon-to-label in buttons, between chips |
| `--sp-4` | 12 | Inside compact rows, table cell padding (Analyst) |
| `--sp-5` | 16 | Default gap, card padding (compact), **phone side gutter** |
| `--sp-6` | 20 | Card padding (Field) |
| `--sp-7` | 24 | Between cards, desktop gutter |
| `--sp-8` | 32 | Between page sections |
| `--sp-10` | 48 | Empty-state padding |

Rule: spacing inside a component is smaller than spacing between components, which is smaller than spacing between sections (8 → 16/24 → 32).

### 7.2 Radius

| Token | px | Use |
|---|---|---|
| `--r-xs` | 2 | Tags, legend swatches, chart bar ends (rounded data end only) |
| `--r-sm` | 4 | Buttons, inputs, checkboxes |
| `--r-md` | 8 | Cards, panels, dropzones, toasts |
| `--r-lg` | 12 | Dialogs, bottom sheets (top corners only) |
| `--r-pill` | 999 | Status chips, the accuracy badge, toggles |

### 7.3 Elevation

In **Field**, elevation is shown by a lighter surface plus a 1 px border (dark shadows are invisible on dark backgrounds and glare washes them out). In **Analyst**, soft shadows are added.

| Level | Token | Used by |
|---|---|---|
| 0 | none | Page, map |
| 1 | `--elev-1` | Cards, panels, table containers |
| 2 | `--elev-2` | Popovers, menus, toasts, floating map controls |
| 3 | `--elev-3` | Dialogs, bottom sheets |

### 7.4 Motion

| Token | Value | Use |
|---|---|---|
| `--dur-fast` | 100 ms | Hover, press, checkbox |
| `--dur-base` | 200 ms | Panels, drawers, tabs, toasts in |
| `--dur-slow` | 300 ms | Dialog open, bottom sheet |
| Camera fly-to | 1.2 s (Cesium) | "Fly to measurement", "Reset view" |
| `--ease-standard` | `cubic-bezier(.2,0,0,1)` | Entering and moving |
| `--ease-exit` | `cubic-bezier(.3,0,1,1)` | Leaving |

`prefers-reduced-motion: reduce` sets all durations to 0 and makes camera moves instant ([09 §10](09-viewer-and-ui.md#10-accessibility)). Progress bars animate their value, never a looping "barber pole", so that a stalled job looks stalled (honest progress, [09 U8](09-viewer-and-ui.md#2-ux-principles)).

---

## 8. Grid, breakpoints and layout

| Class | Width | Columns / gutter / margin | App-shell behaviour |
|---|---|---|---|
| **Desktop** | ≥ 1280 px | 12 / 24 / 24 | Top bar 56 px, mission tab strip 48 px. Viewer: layers panel 280 px (left), inspector 320 px (right), status bar 48 px. Settings: 240 px section nav. |
| **Tablet** | 768–1279 px | 8 / 16 / 24 | Top bar 64 px (larger targets). Nav labels may collapse to icons + labels under 1024 px. **Viewer below 1024 px:** layers become a left drawer and the inspector a bottom sheet ([09 §5](09-viewer-and-ui.md#5-screen-wireframes)). 1024–1279 px: layers panel collapses to a 64 px icon rail that expands on tap. Mission rows become cards below 900 px ([09 §5.1](09-viewer-and-ui.md#51-home--missions-list)). |
| **Phone** | ≤ 767 px | 4 / 16 / **16** | Read-only. Top bar 56 px with a menu button; mission tabs scroll horizontally; viewer is full-bleed with a bottom sheet for layers / inspector. No horizontal page scroll. |

Implementation notes:

- Use **container queries** on the app shell (`container-type: inline-size`), not only viewport media queries, so panels respond to the space they actually have (for example a split Compare view). The wireframe prototype uses the same technique for its viewport toggle.
- The Cesium canvas always fills the remaining space; panels never overlay the scale bar, north arrow or coordinate readout.
- Content max width outside the viewer is 1440 px, centred.

---

## 9. Iconography

| Item | Decision |
|---|---|
| Set | **Lucide** (ISC licence), bundled via `lucide-react` with tree-shaking. No icon fonts, no CDN. |
| Grid and stroke | 24 × 24, 2 px stroke, round caps and joins. Rendered at 20 px in dense UI and 24 px in field mode. |
| Colour | Inherits `currentColor`. Status icons take the status colour; tool icons take `--text`, and `--accent` when active. |
| Labels | Every icon-only button has an `aria-label` and a tooltip that also shows its keyboard shortcut. In field mode, the viewer toolbar shows text labels under the icons. |

**Icon map** (09 glyph → Lucide name). Names are current Lucide names; check against the pinned version when building.

| Concept | Lucide | Concept | Lucide |
|---|---|---|---|
| Missions | `folder` | Settings | `sliders-horizontal` |
| New mission | `plus` | Upload / dropzone | `upload` |
| Offline (local only) | `wifi-off` | GPU / CPU | `cpu` |
| Disk | `hard-drive` | Language | `languages` |
| Theme | `moon` / `sun` | More (⋯) | `ellipsis` |
| Select ↖ | `mouse-pointer-2` | Distance ⟷ | `ruler` |
| Height ↕ | `move-vertical` | Area ▱ | `pentagon` |
| Volume ⛰ | `mountain` | Profile ⌇ | `chart-spline` |
| Coordinate pick ⌖ | `crosshair` | Clipping box ▢ | `box` |
| Compare ◫ | `columns-2` | Reset view ⟲ | `rotate-ccw` |
| Layers | `layers` | Export ⤓ | `download` |
| Pass ✓ | `circle-check` | Warning ⚠ | `triangle-alert` |
| Fail ✗ | `circle-x` | Info ⓘ | `info` |
| Anchored | `anchor` | Checkpoints | `target` |
| Flight track | `navigation` | Report | `file-text` |
| Copy | `copy` | Delete | `trash-2` |
| Retry | `refresh-cw` | Fullscreen ⤢ | `maximize` |

---

## 10. Components catalogue

Each component lists its anatomy, its states and do / don't rules. "Target" means the minimum hit area (§11). All interactive components have visible `:focus-visible` rings (3 px `--accent`, 2 px offset).

### 10.1 App shell

| Aspect | Spec |
|---|---|
| Anatomy | Top bar → (mission tab strip, when a mission is open) → content region → optional status bar (viewer only). A connection banner can appear between the top bar and the tabs. |
| States | Normal · connection lost (banner, `--warn`) · read-only (phone banner, `--info`) · disk low (status chip turns `--warn`) |
| Do | Keep the top bar identical on every screen, so status is always found in the same place. |
| Don't | Add a second navigation bar, or hide system status behind a menu on desktop or tablet. |

### 10.2 Top bar

| Aspect | Spec |
|---|---|
| Anatomy | Logo + wordmark (links to Missions) · breadcrumb (`‹ Missions / Bridge-Recon-07`) · global nav (Missions, Settings) · system status chips (`● Offline` meaning local-only, GPU memory, free disk) · language toggle `EN / हि` · theme toggle |
| States | Chips: ok (neutral), warn (`Disk 4 GB free`), danger (`Server unreachable`) |
| Do | Show "Offline" as a *neutral* chip: offline is the normal, intended state. |
| Don't | Colour "Offline" red, or show internet connectivity at all. |

### 10.3 Sidebar (section navigation and viewer side panels)

| Aspect | Spec |
|---|---|
| Anatomy | Section header (overline) · list of items (icon + label) · optional footer action. In the viewer: collapsible panel with a header, a scroll body and a close/collapse button. |
| States | Default · hover · selected (`--surface-3` + 3 px `--accent` left rule) · disabled (40 % opacity + tooltip "why") · collapsed to icon rail |
| Do | Keep selection visible with more than colour (the left rule). |
| Don't | Nest more than two levels. |

### 10.4 Buttons

| Variant | Anatomy | Use |
|---|---|---|
| Primary | Accent fill, `--text-on-accent` label, optional trailing `→` or icon | The one main action of a view ("Check inputs →", "Start processing →") |
| Secondary | `--surface-2` fill, `--border-strong` 1 px border, `--text` label | Other actions |
| Ghost | No fill, `--text` label, underline on hover | Tertiary: "What's this?", "Copy" |
| Destructive | `--danger` fill (confirm dialogs only) or `--danger` text ghost (in menus) | "Delete mission", "Cancel run" |
| Icon | Square, icon only, `aria-label` + tooltip | Toolbars, close |

| Aspect | Spec |
|---|---|
| Sizes | Height = `--target` (48 Field / 44 Analyst); primary on tablets = `--target-primary` (56). Horizontal padding 16–20 px. Minimum width 96 px (Hindi). |
| States | Default · hover (`--accent-hover`) · pressed (inset 1 px) · focus-visible (ring) · disabled (40 % opacity, `aria-disabled`, tooltip giving the reason) · loading (spinner replaces the leading icon, label stays, e.g. "Checking…") |
| Do | One primary button per view (09 U7). Put destructive actions away from the primary, usually on the far left of a footer or inside a ⋯ menu. |
| Don't | Disable a primary without saying why. Use the accent fill for navigation links. |

### 10.5 Inputs (text, select, radio, checkbox, toggle, slider)

| Aspect | Spec |
|---|---|
| Anatomy | Label (above, always visible) · control (`--surface-2`, 1 px `--border-strong`, `--r-sm`) · helper text or error (below, 14 px) · optional unit suffix (`m`, `GB`) inside the field |
| States | Default · hover · focus (ring) · filled · error (`--danger` border + icon + message) · disabled · read-only (no border, `--surface`) |
| Do | Put units in the field suffix; use Western digits; validate on blur and on submit. |
| Don't | Use placeholder text as the label. Rely on red alone for an error. |

### 10.6 File dropzone

| Aspect | Spec |
|---|---|
| Anatomy | Dashed 2 px `--border-strong` box (`--r-md`) · upload icon · "Drop video here or **Browse…**" · accepted formats line · after drop: file row (name, probe summary `3840×2160 29.97 fps · 9 m 48 s · 3.8 GB`, progress bar with %, pause/resume, remove) |
| States | Empty · drag-over (accent border + `--accent-subtle` fill) · uploading (progress) · paused ("Upload paused at 62 %. It will resume from here.") · verified (`--ok` icon, "SHA-256 verified") · rejected (`--danger`, reason + "Choose another file") · matched sidecar ("matched by filename ✓") |
| Do | Make the whole box a button (keyboard: Enter opens the file picker). Keep the upload resumable ([08 §9](08-data-formats-and-interfaces.md#9-rest-and-websocket-api) chunked uploads). |
| Don't | Start processing automatically on drop. The Ingest Check comes first (09 U1). |

### 10.7 Stepper

| Aspect | Spec |
|---|---|
| Anatomy | 4 steps in a row: **1 Inputs · 2 Ingest check · 3 Processing · 4 Results**. Each: number/icon circle, label, connector line. |
| States | Complete (✓, `--ok` icon) · current (accent ring, bold label, `aria-current="step"`) · upcoming (muted) · blocked (✗ on a failed check) |
| Do | Use it on New Mission, Ingest Check and Processing only; it is the mission's pipeline, not app navigation. |
| Don't | Make upcoming steps clickable before their data exists. |

### 10.8 Stage progress list

| Aspect | Spec |
|---|---|
| Anatomy | One row per canonical stage **S0–S9 + P** (never renamed or reordered): stage ID (mono) · name · state glyph + text · duration or % · expandable sub-steps (e.g. "↳ ortho registration ✓ shift 2.6 m") |
| States | `○ queued` (muted) · `▓ running nn %` (accent bar, row highlighted) · `✓ done mm:ss` (`--ok` icon) · `⚠ warning` (`--warn`) · `✗ failed` (`--danger`, row expanded with cause + "Retry from Sn") · `– skipped` (muted, reason in tooltip) |
| Do | Show the ETA as a range ("5–8 min") and "—" until S1 finishes (09 §5.4). Keep P visually separate (it runs in parallel). |
| Don't | Show an indeterminate spinner for a stage that reports %. |

### 10.9 Toast

| Aspect | Spec |
|---|---|
| Anatomy | Status icon · message (one sentence) · optional action ("View", "Undo") · close. Bottom-right on desktop, bottom-centre above the bottom sheet on tablet/phone. Max 3 stacked. |
| States | info · ok · warn · danger · progress (export job: bar + %) |
| Timing | Info/ok auto-dismiss after 6 s (paused on hover/focus); warn and danger stay until dismissed. Announced via `aria-live="polite"` (danger: `assertive`). |
| Don't | Put the only copy of important information in a toast. Errors also appear in context. |

### 10.10 Dialog

| Aspect | Spec |
|---|---|
| Anatomy | Scrim · panel (`--r-lg`, `--elev-3`, max 720 px, full-screen sheet on phone) · title · body · footer (secondary left of primary; destructive separated on the far left) |
| States | Open · busy (primary shows spinner, other controls disabled) · error inline |
| Behaviour | Focus trapped; `Esc` closes (unless busy); focus returns to the trigger. Destructive confirmations name the object: "Cancel run 20261114-051205-7c2e91? Partial outputs are kept and marked cancelled." |
| Don't | Stack dialogs. Use a dialog for a message that needs no decision (use a toast or banner). |

### 10.11 Tabs

| Aspect | Spec |
|---|---|
| Anatomy | Row of tabs, label (+ optional count or status dot), 3 px accent underline on the selected tab |
| Mission tab strip | Ingest · Processing · 3D Viewer · Accuracy · Exports. A tab is **disabled until its data exists** (09 §3), and its tooltip says when it will enable ("Available after S8 publishes tiles"). |
| Keyboard | Arrow keys move between tabs, Home/End jump, Enter/Space activate (WAI-ARIA tabs pattern). |
| Don't | Wrap tabs to two lines. On phone the strip scrolls horizontally. |

### 10.12 Data table

| Aspect | Spec |
|---|---|
| Anatomy | Sticky header (`--surface-2`, 14 px semibold) · rows (48 px Field / 44 px Analyst) · numeric columns right-aligned, tabular numerals, unit in the header ("CE90 (m)") · optional row action ⋯ |
| States | Loading (skeleton rows) · empty (inline empty state) · row hover · row selected · sorted (arrow + `aria-sort`) |
| Do | Put the uncertainty in its own column or directly after the value (`48.37 ± 0.10`). Mark illustrative data with an **EXAMPLE** tag in the table caption. |
| Don't | Zebra-stripe *and* border every cell. Centre-align numbers. |

### 10.13 Stat tile / KPI

| Aspect | Spec |
|---|---|
| Anatomy | Label (14 px muted) · value (KPI numeral 28 px, unit 16 px muted) · uncertainty or context line (`± 0.03 s`, "target ≤ 1 m") · optional status badge · optional sparkline |
| States | Normal · estimated (value italic, "est." suffix) · example (EXAMPLE tag) · unavailable ("—" with reason) |
| Do | Use tiles for one headline number each: CE90, LE90, registered frames, time offset. |
| Don't | Colour the number itself by status. The badge carries the status; the number stays in `--text`. |

### 10.14 Status badge and accuracy badge

| Aspect | Spec |
|---|---|
| Status chip | Pill, icon + word: `● Complete` · `▓ S5 62 %` · `⚠ Needs attention` · `✗ Failed` · `○ Queued` · `Cancelled`. Tint background (`*-subtle`), icon in the status colour, text in `--text`. |
| Accuracy badge | Pill with the anchoring tier + headline CE90: `Anchored · 0.74 m CE90`, `GNSS only · 3.4 m CE90`, `RTK · 0.06 m CE90`, `Not assessed`. Anchored/RTK use an `anchor` icon; GNSS-only uses `triangle-alert` in `--warn`. **Predicted** values (no checkpoints) are italic with "est.". |
| Do | Make the accuracy badge a link to the Accuracy Report. |
| Don't | Show a CE90 without its tier. Show PASS without checkpoints. |

### 10.15 Map layer panel

| Aspect | Spec |
|---|---|
| Anatomy | Run selector · layer rows (checkbox, name, source hint, status icon) · per-layer settings revealed when on (opacity, point size, colour-by) · confidence legend (§10.18) nested under Confidence · semantic class list with per-class toggles |
| States | On · off · loading (inline spinner, "Loading tiles…") · failed (✗ + tooltip with HTTP error + "Reload layer") · unavailable for this run (disabled, reason) |
| Rules | Keyboard `1`…`7` toggle layers (09 §11). Semantic and confidence "colour by" are mutually exclusive. The Splat row carries a "view only" tag. |

### 10.16 Measurement toolbar

| Aspect | Spec |
|---|---|
| Anatomy | Horizontal floating bar on the canvas (top-left), 10 tools in 09 order: Select · Distance · Height · Area · Volume · Profile · Coordinates · Clip · Compare · Reset. Icon + short label in field mode; icon + tooltip with shortcut in Analyst. Distance-mode segmented control appears when Distance is active (3D slant · Horizontal · Grid). |
| States | Default · active (accent fill, `aria-pressed="true"`) · disabled when only the splat layer is visible (tooltip: "Splats are for viewing only. Turn on the mesh, point cloud or DSM to measure.") |
| Do | Show the in-progress hint on the canvas: "Click to add points · Enter to finish · Backspace removes last · Esc cancels". |
| Don't | Allow measuring on splats (09 U5). |

### 10.17 Measurement result card (with ± uncertainty)

| Aspect | Spec |
|---|---|
| Anatomy | Header: tool icon + name + number ("Distance #3") · mode ("3D slant") · **value** (KPI numeral) · **± uncertainty** on its own line with level and type: "± 0.10 m (1σ, relative)" · derived values (Horizontal, ΔH, Slope) · provenance: surface (mesh / point cloud / DSM), confidence class of the picks · guards (⚠ lines) · actions: Copy, Fly to, Delete · "How is this computed?" disclosure with the formula and worked numbers (09 §6.3) |
| Variants | Distance · Height · Area (planimetric + surface) · Volume (cut / fill / net + base method) · Profile (chart) · Coordinate (lat/lon/H, UTM, MGRS + CE90/LE90 and tier) |
| Flags | ▨ "Includes inferred surface" (hatched chip) · ⚠ "Canopy surface: height may include foliage" · ⚠ "Region masked during reconstruction" · red badge "GNSS only: absolute position ± several metres" on coordinate picks |
| Do | Keep the value and the ± together; copying copies both, plus the level. |
| Don't | Round the uncertainty to zero ("± 0.00 m"). Show more decimals than the uncertainty justifies (value precision = one more digit than the leading digit of σ). |

### 10.18 Confidence legend

| Aspect | Spec |
|---|---|
| Anatomy | Three rows + optional "no data": swatch (16 px, 1 px `--text` outline; hatched for inferred; dotted border for observed-low) · label ("Observed – high") · share of the visible area (%) · info button explaining the class rule (06 §14.3) |
| States | Active (overlay on) · inactive (muted, legend collapsed) · filtered (class toggled off: row struck through + eye-off icon) |
| Do | Place it directly under the Confidence layer toggle, and repeat it on the Accuracy Report and PDF. |
| Don't | Let a theme or a "colour by" option remove the inferred hatch. |

### 10.19 Charts (style tokens)

| Element | Spec |
|---|---|
| Surface | Chart sits on `--surface`, 16 px padding, title (H3) and a one-line takeaway subtitle |
| Grid | `--chart-grid`, 1 px, horizontal only; recessive |
| Axes | `--chart-axis`, 1 px; ticks 12 px `--text-muted` tabular; axis titles include units ("Offset (s)") |
| Marks | Lines 2 px; bars with a 2 px surface gap and 2 px rounded data ends; markers ≥ 8 px |
| Series | GNSS-only `--series-gnss`, Anchored `--series-anchored`, RTK `--series-rtk` (§4.5); **bias** solid, **noise** hatched (bar length = RMSE, see §14 V1) |
| Targets | Dashed 4/4 line in `--text` with a direct label ("Target ≤ 1 m") |
| Interaction | Hover or tap shows a tooltip with the exact value, ± and units; every chart has a "Table" toggle with the same data |

Full rules in §14.

---

## 11. Touch and field ergonomics

| Rule | Value |
|---|---|
| Minimum target, Analyst (pointer) | **44 × 44 px** |
| Minimum target, Field mode | **48 × 48 px** (09 U6) |
| Primary actions on tablets / "Large targets" setting | **56 px** tall (09 §5.8) |
| Spacing between adjacent targets | ≥ 8 px |
| Gestures | Every gesture has a button equivalent: zoom +/−, rotate, tilt, reset view. Long-press = right-click menu. |
| Glare | Field theme uses a high-luminance accent (`#4C9AFF`) and 16 px body. The optional "sunlight" preset (09 §10) raises weights to 600 and borders to `--border-strong`. |
| Gloves | No drag-only interactions. Sliders also accept +/− steppers. The Compare swipe handle is 48 px wide. |
| One-handed tablet | Primary action bottom-right; bottom sheets sized to thumb reach (max 60 % height by default). |

---

## 12. Accessibility and keyboard

Targets WCAG 2.2 AA; checked with axe-core in CI ([11-testing-and-evaluation.md](11-testing-and-evaluation.md)).

| Area | Rule |
|---|---|
| Contrast | Token pairs in §4 all meet AA. New tokens must add a row to those tables before use. |
| Not colour alone | Status = icon + word + colour. Confidence *inferred* = hatch. Observed-low = dotted border in legends. PASS / FAIL / INDICATIVE spelled out. |
| Focus | 3 px `--accent` ring with 2 px offset on every interactive element (`:focus-visible`). Never removed. Focus is not hidden by sticky bars (SC 2.4.11). |
| Target size | ≥ 24 px is the WCAG 2.2 AA floor (SC 2.5.8); we use 44/48/56 px (§11). |
| Dragging | Every drag has a single-pointer alternative (SC 2.5.7): swipe handle has arrow-key and button controls; polygon vertices can be moved with arrow keys. |
| Screen readers | Icon buttons have `aria-label`. Measurement results are announced in an `aria-live="polite"` region ("Distance 48.37 metres, plus or minus 0.10 metres, one sigma, relative"). Charts have a table alternative. The 3D canvas has a text summary (run, tier, CE90, visible layers). |
| Motion | `prefers-reduced-motion` respected (§7.4). |
| Zoom | Usable at 200 % text zoom and at 320 CSS px width (reflow) outside the 3D canvas. |
| Language | `lang="hi"` on Hindi text runs so screen readers switch voice. |

**Keyboard.** The viewer shortcuts are defined in [09 §11](09-viewer-and-ui.md#11-keyboard-shortcuts) and are not repeated here. Global additions follow the same rules: single letters only when no text field has focus, `?` opens the shortcut sheet, `Esc` always backs out one level (tool → selection → panel → dialog). The shortcut is shown in each tool's tooltip ("Distance · D").

---

## 13. Copy guidelines (English and Hindi)

### 13.1 Rules

| Rule | Example |
|---|---|
| Lead with the outcome, then the cause, then the fix | "Could not register to the reference ortho (too few matches). Falling back to GNSS-only placement." |
| Numbers always carry units and uncertainty | "0.74 m CE90", "48.37 m ± 0.10 m (1σ, relative)" |
| Say "estimated", "inferred", "example" plainly | "Estimated: not validated" |
| Sentence case for everything except proper nouns and acronyms | "Start processing", not "Start Processing" |
| Verbs on buttons | "Check inputs", "Export 6.9 GB", "Retry from S5" |
| Keep acronyms untranslated in Hindi | CE90, LE90, RMSE, DSM, DTM, GNSS, RTK, UTM, SRT, KLV (Hindi gloss in the tooltip) |
| Western Arabic digits in both languages | "शेष समय 5–8 मिनट" |
| Stage names are canonical | "S5 Dense Reconstruction & Mesh" (Hindi from the 09 glossary) |
| No blame, no exclamation marks, no jokes | "This video uses codec X, which could not be decoded." |
| Hindi register | Standard, polite (आप form), government-style but not archaic. A native speaker reviews all Hindi strings before the finale (09 §13). |

### 13.2 Microcopy table

Extends the core glossary in [09 §13](09-viewer-and-ui.md#13-internationalisation-english--hindi); those keys are not repeated here except where the design system needs them.

| Key | English | Hindi (हिंदी) |
|---|---|---|
| brand.tagline | One pass. One video. A measurable 3D world. | एक उड़ान। एक वीडियो। मापने योग्य 3D दुनिया। |
| nav.missions | Missions | मिशन |
| mission.new | New Mission | नया मिशन |
| mission.checkInputs | Check inputs | इनपुट जाँचें |
| upload.drop | Drop video here or browse | वीडियो यहाँ छोड़ें या ब्राउज़ करें |
| upload.paused | Upload paused at {pct} %. It will resume from here. | अपलोड {pct} % पर रुका है। यह यहीं से फिर शुरू होगा। |
| upload.resume | Resume | फिर से शुरू करें |
| upload.noGps | Continue without GPS (relative model only) | GPS के बिना जारी रखें (केवल सापेक्ष मॉडल) |
| ingest.usableWarnings | Usable with {n} warnings | {n} चेतावनियों के साथ उपयोग योग्य |
| run.start | Start processing | प्रोसेसिंग शुरू करें |
| run.cancel | Cancel run | प्रोसेसिंग रद्द करें |
| run.retryFrom | Retry from {stage} | {stage} से पुनः प्रयास करें |
| run.eta | Time remaining | शेष समय |
| status.queued | Queued | कतार में |
| status.running | Running | चल रहा है |
| status.complete | Complete | पूर्ण |
| status.failed | Failed | विफल |
| status.attention | Needs attention | ध्यान दें |
| preview.notMetric | GPS-placed, not metric | GPS से स्थापित, मापन योग्य नहीं |
| viewer.open | Open 3D Viewer | 3D व्यूअर खोलें |
| viewer.layers | Layers | परतें |
| tool.distance | Distance | दूरी |
| tool.height | Height | ऊँचाई |
| tool.area | Area | क्षेत्रफल |
| tool.volume | Volume | आयतन |
| tool.profile | Cross-section | अनुप्रस्थ काट |
| tool.pick | Coordinates | निर्देशांक |
| measure.inferred | Includes inferred surface | अनुमानित सतह शामिल |
| measure.splatDisabled | Splats are for viewing only. Turn on the mesh, point cloud or DSM to measure. | स्प्लैट केवल देखने के लिए हैं। मापने के लिए मेश, बिंदु मेघ या DSM चालू करें। |
| measure.howComputed | How is this computed? | इसकी गणना कैसे होती है? |
| conf.observedHigh | Observed – high | प्रेक्षित – उच्च |
| conf.observedLow | Observed – low | प्रेक्षित – निम्न |
| conf.inferred | Inferred | अनुमानित |
| accuracy.title | Accuracy Report | सटीकता रिपोर्ट |
| accuracy.estimated | Estimated: not validated | अनुमानित: सत्यापित नहीं |
| accuracy.anchored | Anchored | एंकर्ड (संदर्भ से जुड़ा) |
| accuracy.gnssOnly | GNSS only | केवल GNSS |
| accuracy.checkpoints | Checkpoints | जाँच बिंदु |
| accuracy.pass | PASS | उत्तीर्ण |
| accuracy.fail | FAIL | अनुत्तीर्ण |
| accuracy.indicative | INDICATIVE | सांकेतिक |
| common.example | Example value | उदाहरण मान |
| export.title | Export | निर्यात |
| export.start | Export {size} | {size} निर्यात करें |
| system.offline | Offline | ऑफ़लाइन |
| system.serverLost | Connection to local server lost. Retrying in {s} s… | स्थानीय सर्वर से संपर्क टूट गया। {s} s में पुनः प्रयास… |
| system.readOnlyPhone | Read-only on phone | फ़ोन पर केवल देखने के लिए |
| common.save | Save | सहेजें |
| common.cancel | Cancel | रद्द करें |
| common.copy | Copy | कॉपी करें |
| common.delete | Delete | हटाएँ |
| common.warning | Warning | चेतावनी |

---

## 14. Data-visualisation rules for accuracy charts

These charts carry our main claim ("proof, not claims", charter §4), so they follow stricter rules than decorative charts.

| # | Rule |
|---|---|
| V1 | **Pick the form by the job.** Headline accuracy (CE90, LE90) = stat tiles or a table, not a chart. Tier comparison = grouped horizontal bars on a shared axis. Bias vs noise = one bar per axis E/N/U whose length is the RMSE, split into bias (solid) and noise (hatched) in proportion to bias² : σ² (because RMSE² = bias² + σ²; stacking the raw bias and σ lengths would overstate the error). Checkpoint residuals = vector map + table. Doming = line along track with a target band. Time sync = line (correlation vs lag) with the peak marked. Frame quality = histogram with a threshold marker. Profile = line with a ±σ band. |
| V2 | **Zero baseline** for every bar chart. Error magnitudes never use a truncated axis. |
| V3 | **Shared scale** when comparing tiers (GNSS-only vs anchored) so the reduction is visible at its true size. If the GNSS bar would dwarf the anchored one, use a second small-multiple chart on its own axis, labelled as such. Never a dual y-axis. |
| V4 | **Target lines** from the charter (≤ 1 m CE90 etc.) are dashed, labelled directly, and never coloured as pass/fail. |
| V5 | **Status is text + icon**: ✓ PASS, ✗ FAIL, ~ INDICATIVE (fewer than 30 checkpoints). CE90 is never shown as PASS without checkpoints (09 §5.6). |
| V6 | **Series colours are fixed per entity**: GNSS-only = neutral grey, Anchored = accent, RTK = green. They do not change when a series is filtered out. Status colours (ok/warn/danger) are not used as series colours. |
| V7 | **Confidence colours only mean confidence.** The Okabe–Ito triple (§4.3) is never used for other series, and the semantic palette only for classes. |
| V8 | **Uncertainty is drawn, not just written**: error bars or bands at the level stated in the legend (1σ or 90 %). Residual vectors show their exaggeration factor ("×20") and a scale arrow. |
| V9 | **Units and level in every axis title and tooltip** ("Residual (m, 1σ)"). |
| V10 | **Illustrative data is watermarked.** Until real flights exist, charts and tables carry an **EXAMPLE** tag in the title row and the caption "Illustrative placeholder values" (09 §5.6 already says this for the report table). |
| V11 | **Accessible by default**: legend for ≥ 2 series plus direct labels for ≤ 4; a "Table" toggle with the same numbers; 2 px lines, ≥ 8 px markers; hatch as the colour-blind / print fallback. |
| V12 | **Hover and tap** show exact values with ± and units; the hit area is larger than the mark. Tooltips never hold information that isn't also available in the table view. |

---

## 15. Deltas and open items

| # | Item | Status |
|---|---|---|
| Δ1 | Analyst `--warn` is `#8A5A00` instead of 09 §7.4's `#9A6700`, because `#9A6700` is 4.34 : 1 on `--surface-2` (below AA for text). On `--surface` both pass. 09 §7.4 updated. | Resolved |
| Δ2 | 09 §7.4 calls the light theme "office"; this document calls it "Analyst". Same theme, same tokens. | Naming only |
| Δ3 | [06 §14.3](06-georeferencing-and-accuracy.md#143-mapping-to-confidence-classes) says "observed-high green, observed-low amber, inferred hatched magenta". 09 §7.1 and this document use Okabe–Ito blue / orange / reddish purple. 06 §14.3 aligned to 09 and this document. | Resolved |
| Δ4 | Touch targets: 09 U6 sets 48 px everywhere; this document keeps 48 px for Field mode and allows 44 px for the Analyst theme with a pointer (WCAG AAA 2.5.5 level). 56 px primaries are unchanged. | Proposed |
| Δ5 | Semantic palette (§4.4): vehicle ↔ vegetation and ground ↔ building are hard to separate. Mitigated by hatch, labels and solo toggles. Revisit with a validated 7-colour set if user testing shows confusion. | Open (R5) |
| Δ6 | "Import mission bundle (`.d3d.zip`)" on the Missions screen has no API in [08 §9](08-data-formats-and-interfaces.md#9-rest-and-websocket-api) (08 only has a per-run `bundle` artefact for *export*). The wireframes show import as a disabled "Future" action. | Future |
| Δ7 | The Compare "Difference DSM" mode (09 §6.3) is computed server-side but has no endpoint in 08 §9. | Open (R3/R5) |
| Δ8 | 09 §5.2 / §5.5 / §5.7 show "UTM 43N / EPSG:32643" for the sample site at 78.49° E (Hyderabad). That longitude is in **UTM zone 44N (EPSG:32644)**; zone 43 ends at 78° E. The wireframes use 44N (E ≈ 233 214 m, MGRS 44Q KE). Fix the 09 examples. | Proposed |
| Δ9 | The 09 §5.7 export wireframe totals "6.9 GB"; the checked products listed there add up to about 6.3 GB, which the wireframe uses. | Cosmetic |

---

## Related documents

- [00-project-charter.md](00-project-charter.md): stage IDs, targets, confidence classes
- [09-viewer-and-ui.md](09-viewer-and-ui.md): screens, measurement maths, shortcuts, i18n glossary
- [wireframes/README.md](wireframes/README.md): clickable prototype built with these tokens
- [06-georeferencing-and-accuracy.md](06-georeferencing-and-accuracy.md): accuracy metrics and confidence rules behind the visuals
- [08-data-formats-and-interfaces.md](08-data-formats-and-interfaces.md): API used by the screens
- [11-testing-and-evaluation.md](11-testing-and-evaluation.md): accessibility and UI tests
- [07-tech-stack.md](07-tech-stack.md): licences (Noto fonts OFL-1.1, Lucide ISC)
