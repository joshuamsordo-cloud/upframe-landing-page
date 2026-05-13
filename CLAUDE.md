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

## Safety

Never hardcode API keys, tokens, passwords, or any credentials in any file. All sensitive values belong in a `.env` file. The `.env` file must never be committed — confirm it is in `.gitignore` before touching any environment config.

## Project structure

| Path | Contents |
|---|---|
| `plans/` | Implementation plans — one markdown file per major feature |
| `assets/` | Logos (`logo-mark-mint.png`, `logo-mark-white.png`, `logo-text.png`) and design tokens (`colors_and_type.css`) |
| `site/` | All JSX components and CSS (`site.css`, `base.css`) |
| `index.html` | Entry point — loads CDN scripts and wires component files in order |
| `.env` | Local environment variables (never committed) |
| `.env.example` | Environment variable template (committed, no real values) |

## Workflow

Two tools are available for GitHub work — use the right one for the job:

- **Git CLI** (`git commit`, `git push`, `git status`, etc.) — use for all local git operations. Faster and more token-efficient than MCP for these tasks.
- **GitHub MCP server** (`mcp__plugin_github_github__*`) — use for GitHub API actions: creating issues, opening PRs, merging, commenting, reviewing, and reading GitHub data.

**Before starting any major task:**
1. Write a plan as a markdown file in `plans/` (e.g. `plans/feature-name.md`). Cover goal, approach, file changes, and open questions.
2. Create a GitHub issue describing the work using the MCP server. Note the issue number.
3. Reference that issue number in all commits and the eventual PR.

**After every visual change (UI, CSS, layout):**
Use Playwright MCP to verify the result in the browser before treating the task as done. Always check:
- The changed element looks correct (no clipping, overflow, or alignment issues)
- Adjacent/related elements haven't regressed

```
mcp__playwright__browser_navigate  → http://localhost:3000
mcp__playwright__browser_take_screenshot  → full page or targeted element
```

Scroll to the affected section with `mcp__playwright__browser_evaluate` if needed:
```js
() => { document.querySelector('#section-id').scrollIntoView(); }
```

For targeted element screenshots, use `target` + `element` params on `browser_take_screenshot`.

**When the task is complete:**
1. Run `npm run lint` — all errors must be zero before marking anything done. Fix before closing.
2. Verify the implementation matches what the issue described.
3. Close the issue via MCP (or link the closing PR so it auto-closes).

**Lint commands:**
```bash
npm run lint        # check — must pass clean before done
npm run lint:fix    # auto-fix safe issues (formatting, some style rules)
```

> `react/jsx-no-undef` is disabled. This codebase loads components as `window` globals via CDN script tags — all "undefined" JSX components are intentional. The standard `no-undef` rule (from `js.configs.recommended`) handles genuine undefined variable checks.

## Animations

- `QuoteRace` (c-leak.jsx): `requestAnimationFrame` loop, 15s cycle, two lanes
- `NodeGraph` (c-services.jsx): `setInterval` at 80ms, SVG pulse dots traveling edges
- `AgentChat` (c-services.jsx): async loop with `setTimeout`, replays script on completion
- `ProcessSection` (c-process.jsx): `requestAnimationFrame` auto-advance, pauses on pointer drag, resumes after 6s timeout
- `FloatingAgent` (c-fab.jsx): controlled open/close, scripted replies via `SCRIPTED` map, fallback reply routes to audit booking
