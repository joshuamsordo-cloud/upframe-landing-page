# Plan: Landing-page polish — typography, leak section narrative, transitions, logos

## Context

After the first round of polish on `polish-landing-page-1`, four issues remain:

1. **Typography feels too heavy.** Hero is the only "thin" heading (Space Grotesk 300). Every other section heading uses weight 500 and a smaller clamp range, plus the closing CTA heading uses a third, even-larger clamp — so the heading hierarchy reads as inconsistent rather than intentional.
2. **Nav logo is the wordmark image** (`assets/logo-text.png`), but the brand mark (`assets/logo-mark-mint.png`) is a stronger anchor at top-left.
3. **The Leak section's two pipes feel schematic** — flat rects with three zigzag cracks, parallel orbs flowing in both lanes. It communicates "two outcomes" but doesn't tell the *story* of a single lead: call → voicemail → drift → lost vs. lead → qualify → quote → booked → review. The closing text "Run yours" is a static hint with a mint arrow but no actual link to the ROI calculator below it.
4. **The transition into the closing CTA is a hard edge** — testimonials end on `--void-2`, closing snaps to `--void` with a radial mint glow and a dot grid. The cut is visible. The footer logo is also a styled-span wordmark rather than the brand assets the user wants.

Intended outcome: a more confident, editorial typography rhythm; a narrative-driven leak demo that reads as a single lead's journey on each pipe; a soft segue into the final CTA; and consistent use of the brand mark + wordmark in nav and footer.

---

## Critical files

| File | Purpose |
|---|---|
| `assets/colors_and_type.css` | Type scale tokens (clamp variables, font weights loaded) |
| `site/site.css` | Per-component heading rules, leak-section styles, closing/footer styles |
| `site/c-primitives.jsx` | `Nav`, `Mark`, `Wordmark` components |
| `site/c-leak.jsx` | `LeakPipes` + `TheLeakSection` — the entire pipe demo |
| `site/c-proof.jsx` | `TestimonialsSection`, `ClosingSection`, `Footer` |
| `app.jsx` | Section ordering (confirms `#calc` is the next section after `#leak`) |

---

## Approach

### 1 — Typography: bigger, thinner, consistent

**Goal:** Hero stays largest; every other section heading is the same size and lighter.

- Load Space Grotesk weight **300** for all display headings (already loaded). Google Fonts does not ship weights below 300 for Space Grotesk, so 300 is the floor — we lean on size + letter-spacing for "thinness."
- **Hero** (`.uf-hero__h`, `site.css:116–121`): keep weight 300; bump size to `clamp(96px, 12vw, 200px)`, tighten `letter-spacing` to `-0.055em`.
- **All section headings** (`.uf-sech__h`, `site.css:98–104`): change `font-weight` from 500 → **300**; bump size to `clamp(56px, 7vw, 96px)`; line-height to `0.98`; letter-spacing `-0.04em`.
- **Closing CTA heading** (`.uf-closing__h`, `site.css:567–571`): align with `.uf-sech__h` — same clamp, weight 300, same letter-spacing. Drop the bespoke 58–108 clamp.
- Component-level headings (`.uf-service__h`, `.uf-timeline__panel-h`) stay as-is — they are card titles, not section heads.

### 2 — Nav logo swap

In `site/c-primitives.jsx:43`, change `src="assets/logo-text.png"` to `src="assets/logo-mark-mint.png"`. The mark is square (1:1); the current `.uf-nav__logo` rule (`height: 40px; width: auto`) will render it 40×40, which feels chunky next to 32px nav links. Tighten `.uf-nav__logo` height to **32px** so the mark sits proportionally within the 64px nav. Keep the click-to-top behavior on `.uf-nav__brand`.

### 3 — Leak section overhaul

Three coordinated changes inside `site/c-leak.jsx` and the corresponding `.uf-pipes__*` / `.uf-pipe__*` CSS in `site/site.css:177–256`.

**3a. Pipes that look like pipes.**
- Replace the single flat `<rect>` per lane with a layered SVG group:
  - **Body**: rect with a *vertical* linear gradient (top highlight → midtone → bottom shadow) for cylindrical depth.
  - **Top highlight band**: thin rect at 15% height, `rgba(255,255,255,0.06)` for a specular streak.
  - **End caps**: two `<g>` groups at `X0` and `X1`, each containing a darker rounded rect (flange) + two small `<circle>` bolts.
- Keep the amber tint for the "without" pipe and mint for the "with" pipe — only the surface treatment changes. Define new `<linearGradient>` defs (`uf-pipe-amber-v`, `uf-pipe-mint-v`) with vertical stops.

**3b. Cracks that look like cracks.**
- Replace the current zigzag `<path>` + single `<line>` (`c-leak.jsx:164–174`) with a `crack` group:
  - Multi-segment jagged `<path>` (8–10 vertices, irregular) along the bottom edge of the pipe at the crack position, filled with the void color (the "tear-through").
  - Dark inner shadow path offset 1px to give depth.
  - Two or three small `<circle>` drip droplets (r 1.5–2.5) at staggered y offsets below the crack, mint→amber depending on lane. Animate them by tying their `cy` to a CSS `@keyframes` drip (loop 1.6s).

**3c. Stage narrative — single-orb journey with stage stops.**

Restructure `LeakPipes` so each lane carries **one orb per cycle** that pauses at labeled stage markers along the pipe length. The orb's progress per lane is driven by the same `requestAnimationFrame` loop.

- **Without-Upframe lane (top, amber)** — 4 stages:
  | x-pos | Label | Mono sub-label |
  |---|---|---|
  | 0.08 | Call comes in | RINGING |
  | 0.34 | Voicemail | WAITING |
  | 0.62 | Lead drifts | COOLING |
  | 0.90 | Lost | −$240 |
- **With-Upframe lane (bottom, mint)** — 5 stages:
  | x-pos | Label | Mono sub-label |
  |---|---|---|
  | 0.06 | Lead arrives | INBOUND |
  | 0.28 | Agent qualifies | 9s |
  | 0.50 | Quote sent | 14s |
  | 0.74 | Booked | +$480 |
  | 0.94 | Review | ★ 5.0 |

- Each stage is rendered as an SVG `<g>` containing a small **stage marker** (circle node on the pipe centerline) and a **labeled chip below the pipe** (rounded rect + JetBrains Mono label + sub-label). Without-Upframe chips use amber border tokens; with-Upframe use mint.
- The orb travels stage-to-stage, **dwelling ~700ms at each marker**, then accelerating to the next. Without-Upframe: at the last stage, the orb fades into the LOST bucket and an amber `−$240` label flashes. With-Upframe: at the last stage, a small ★ glyph blooms and the orb continues into the BOOKED bucket.
- Loop cadence: target a single full cycle at **~16s** so both lanes complete in the same window. Constants (`SPAWN_MS`, `TRAVEL_MS`, `FALL_MS`) get retired; replace with a `STAGE_DWELL_MS` / `STAGE_TRANSIT_MS` model derived from stage count.
- The counters (`Walked away`, `Booked`) keep working — increment on the orb's terminal stage rather than per-orb.

**3d. "Run yours" becomes a real button.**

In `c-leak.jsx:208–213`, convert the `<div className="uf-pipes__closeTxt">` into a clickable element. Replace the inert `↓ Run yours.` span with a `<button>` styled as a tertiary link (mono mint, mint underline on hover). On click: `document.getElementById('calc')?.scrollIntoView({ behavior: 'smooth', block: 'start' })`. Add a new `.uf-pipes__runBtn` rule in `site.css` (transparent bg, mint color, no border, mono 12px, padding 6px 0, cursor pointer, hover underline).

### 4 — Smoother closing-CTA transition

In `site/site.css:558–578`:

- Add a **fade overlay** at the top of `.uf-closing`: a 120px `linear-gradient` from `var(--void-2)` at the very top to transparent. Implemented as a `::before` pseudo-element absolutely positioned (`top: 0; left: 0; right: 0; height: 120px; pointer-events: none`) so it sits above the radial mint glow.
- **Extend the dot grid upward.** The existing `<div className="uf-dotgrid" />` already lives inside `.uf-closing`. Add a CSS mask-image override on `.uf-closing .uf-dotgrid` so the dots fade in from the top (`mask-image: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,1) 25%, rgba(0,0,0,1) 75%, transparent 100%)`), so the grid bleeds into the fade zone.
- No JSX changes required for the closing section — purely CSS.

### 5 — Footer logo

In `site/c-proof.jsx:122–126`, replace the existing `<Mark size={24} /> <Wordmark />` pair with a flex row holding:
- `<img src="assets/logo-mark-mint.png" alt="" style={{ height: 28, width: 28, display: 'block' }} />`
- `<img src="assets/logo-text.png" alt="Upframe AI" style={{ height: 22, width: 'auto', display: 'block' }} />`

Kept inside `.uf-foot__brand`. The `Wordmark` component remains defined in `c-primitives.jsx` (still used by the FAB header) — we just stop calling it here.

---

## GitHub issue

Open an issue on `upframe-ai/upframe-landing-page` (or this repo) titled **"Landing page polish 2: typography, leak narrative, CTA transition, logos"** with the five subsections above as a checklist. Reference the issue number in every commit and in the eventual PR.

---

## Verification

1. **Dev server**: `python3 -m http.server 3000` → open `http://localhost:3000`. Hard-refresh after each file edit.
2. **Typography**: hero reads visibly larger than all other section heads; all section heads (leak, ROI, services, process, proof, closing) are the same visual size and weight; nothing feels bold or chunky.
3. **Nav logo**: top-left shows the mint mark, 32×32, click-to-top still works.
4. **Leak section**:
   - Pipes have visible cylindrical shading + end-cap flanges with bolts.
   - Cracks are jagged with drip droplets animating below.
   - One orb per lane per cycle, visibly pausing at each labeled stage chip; "without" ends in Lost, "with" ends in Review.
   - Counters tick on terminal stage; cycle resets cleanly at ~16s.
   - "Run yours" is now a button — clicking smooth-scrolls to the ROI section.
5. **Closing transition**: scroll from testimonials → closing. The boundary should fade rather than snap; dots should appear to bleed up into the fade zone.
6. **Footer**: bottom-left shows the mint mark + wordmark image side by side; no styled-span wordmark.
7. **Lint**: `npm run lint` exits clean.
8. **Playwright spot-check**: navigate, take full-page screenshot, verify visually against the above. Confirm zero console errors beyond the existing favicon 404 (out of scope for this issue).
