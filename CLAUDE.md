# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Dev server

No build step. Serve from the project root and open `http://localhost:3000`:

```bash
python3 -m http.server 3000
```

Babel transpiles JSX in-browser on first load (1–2s delay). Changes to any file are live on hard-refresh.

## Architecture

The page is a single HTML file (`index.html`) that loads React 18 + Babel Standalone from CDN, then executes a chain of `<script type="text/babel">` tags in dependency order:

```
c-primitives.jsx   → Mark, Wordmark, Eyebrow, Btn, Nav, Hero
c-leak.jsx         → QuoteRace, TheLeakSection
c-calc.jsx         → ROISection
c-services.jsx     → MiniSite, NodeGraph, AgentChat, ServicesSection
c-process.jsx      → ProcessSection
c-proof.jsx        → TestimonialsSection, ClosingSection, Footer
c-fab.jsx          → FloatingAgent
app.jsx            → App (root, wires everything together + ReactDOM.createRoot)
```

Each file exports its components by assigning to `window` (e.g. `Object.assign(window, { Nav, Hero })`). This is how later scripts see components defined in earlier scripts — there is no import/export.

## CSS layers

`assets/colors_and_type.css` — design tokens only: CSS custom properties for colors, type scale, spacing, radii, motion. Never put component styles here.

`site/site.css` — all component and layout styles. Uses `uf-` prefix for every class. Two dot-grid utility classes (`.uf-dotgrid`, `.uf-dotgrid--steel`) applied as absolute-positioned children for background texture.

## Design tokens (locked)

| Token | Value | Role |
|---|---|---|
| `--mint` | `#86EFAC` | Primary accent, CTAs |
| `--amber` | `#F5A524` | Urgency / cost callouts |
| `--void` | `#0A0A0A` | Page background |
| `--surface` | `#141414` | Cards/panels |
| `--cloud` | `#F0F0F0` | Body text |
| `--steel` | `#3A3A3A` | Borders |

Eyebrow labels (`.uf-eyebrow`) are always JetBrains Mono, all-caps, mint or amber only.

## Fonts

Space Grotesk (headings, weight 500–700), Inter (body), JetBrains Mono (eyebrows, mono labels) — all loaded via Google Fonts in `colors_and_type.css`.

## Animations

- `QuoteRace` (c-leak.jsx): `requestAnimationFrame` loop, 15s cycle, two lanes
- `NodeGraph` (c-services.jsx): `setInterval` at 80ms, SVG pulse dots traveling edges
- `AgentChat` (c-services.jsx): async loop with `setTimeout`, replays script on completion
- `ProcessSection` (c-process.jsx): `requestAnimationFrame` auto-advance, pauses on pointer drag, resumes after 6s timeout
- `FloatingAgent` (c-fab.jsx): controlled open/close, scripted replies via `SCRIPTED` map, fallback reply routes to audit booking
