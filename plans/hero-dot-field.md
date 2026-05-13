# Plan: Interactive hero dot field

## Context

The hero currently uses a static CSS background-image dot pattern (`.uf-dotgrid--steel` at [site/site.css:10](../site/site.css#L10)) overlaid on the hero section. Because it's a single repeating `radial-gradient` background, no dot can be addressed individually — we can't make them react to the cursor.

We want a subtle interactive moment in the hero: dots near the cursor glow mint, and a short trail of dots stays briefly lit behind the cursor before fading. Effect is scoped to the hero only; closing-CTA dotgrid and any future uses stay static.

Intended outcome: a "the page is alive" beat the first time the visitor scans the hero, that doesn't compete with the headline, the live feed panel, or the bottom-left mint glow.

---

## Critical files

| File | Purpose |
|---|---|
| `site/c-primitives.jsx` | Add new `HeroDotField` component; swap it into `Hero` in place of the current `.uf-dotgrid--steel` |
| `site/site.css` | Add `.uf-hero__dots` wrapper rule (absolute, inset 0, pointer-events: none) |

No new files. Component is small enough to live alongside `Mark`, `Wordmark`, `Nav`, `Hero` in `c-primitives.jsx`.

---

## Approach

### 1 — Replace static dotgrid with a canvas

In `Hero` (currently in `c-primitives.jsx`):

```jsx
// before
<div className="uf-dotgrid uf-dotgrid--steel" />

// after
<HeroDotField />
```

`HeroDotField` renders an absolutely-positioned `<canvas>` inside its own wrapper div. CSS rule `.uf-hero__dots { position: absolute; inset: 0; pointer-events: none; z-index: 0; }` matches the previous overlay positioning so it sits behind `.uf-hero__inner` (which already has `z-index: 2`).

### 2 — Component internals

```
HeroDotField
├── refs: canvasRef, wrapperRef, mouseRef, wakeRef, rafRef
├── effect: setup (size canvas DPR-aware, attach listeners, start rAF)
├── effect: cleanup (cancelAnimationFrame, remove listeners)
└── tick (rAF body)
    ├── update wake (push new sample if mouse moved, decay weights, drop expired)
    ├── clear canvas
    └── for each grid dot: compute intensity, lerp color, fillRect/arc
```

**Grid:**
- Spacing: 24px (matches old pattern)
- Total dots at 1440×700 hero ≈ 60 × 30 ≈ 1800. Plenty fast.

**Cursor + wake model:**
- `mouseRef = { x, y, active }` updated on `pointermove`; `active = false` on `pointerleave`
- `wakeRef = [{ x, y, t }]` — push when mouse moves > 8px since last sample; cap at 12 entries; each sample decays via `weight = max(0, 1 - (now - t) / 600)`
- For each dot at `(gx, gy)`:
  - `d_cursor = dist(gx, gy, mouse.x, mouse.y)` if `mouse.active`
  - `cursor_intensity = active ? clamp(1 - d_cursor / R_HALO, 0, 1)² : 0` with `R_HALO = 160px`
  - `wake_intensity = Σ wake samples: weight × clamp(1 - d / R_WAKE, 0, 1)²` with `R_WAKE = 100px`
  - `intensity = min(1, max(cursor_intensity, wake_intensity))`
  - Color lerp: `mix(steel, mint, intensity)` — base alpha 0.55, halo alpha 0.95
  - Radius lerp: 1.0px (base) → 1.6px (full glow)

**Mask:** keep the same top/bottom fade as `.uf-dotgrid` — implemented in CSS via `mask-image: linear-gradient(...)` on `.uf-hero__dots`, identical stops to the existing rule.

### 3 — Performance + accessibility

- **DPR-aware sizing:** on mount and `resize`, set canvas.width = `cssW * dpr`, canvas.height = `cssH * dpr`, then `ctx.scale(dpr, dpr)`.
- **Viewport-gated rAF:** an `IntersectionObserver` pauses the loop when the hero is fully scrolled past. Restarts on re-entry. Saves battery on long pages.
- **Touch-only devices:** detect `window.matchMedia('(hover: none)').matches` — if true, render once statically (no listeners, no rAF) so it looks identical to the old CSS pattern.
- **Reduced motion:** if `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, same fallback as touch — static render, no animation.
- **Pointer leave:** when cursor leaves the hero rect, freeze `mouse.active = false` and let the wake fade out naturally over its 600ms window.

### 4 — Visual tuning targets

| Variable | Default | Note |
|---|---|---|
| `R_HALO` | 160px | Hard radius — dots beyond this don't feel the cursor |
| `R_WAKE` | 100px | Tighter so wake reads as a path, not a cloud |
| `WAKE_TTL_MS` | 600 | Lifespan of each wake sample |
| `WAKE_SAMPLE_MIN_DIST` | 8px | Throttle wake pushes when cursor moves slowly |
| `WAKE_MAX_SAMPLES` | 12 | Caps work-per-frame |
| Base dot color | `rgba(58,58,58,0.55)` | Matches current steel pattern |
| Glow color | `rgba(134,239,172,0.95)` | Mint at near-full alpha |
| Base radius | 1.0px | Same visual weight as today |
| Glow radius | 1.6px | Subtle pop on bright dots |

These are constants in the component — easy to tweak after seeing it live.

---

## Verification

1. **Local server:** `python3 -m http.server 3000` → open `http://localhost:3000`.
2. **Move the cursor around the hero.** A soft mint halo should appear under it; behind the cursor, a fading trail of recently-lit dots persists ~600ms.
3. **Cursor leaves hero.** Halo disappears immediately; wake fades smoothly.
4. **Scroll past hero.** rAF should pause (verify via DevTools performance panel: no frame work after `.uf-hero` exits viewport).
5. **Resize window.** Dots reflow to new bounds, no blurring (DPR handled).
6. **Touch device or `prefers-reduced-motion`.** Field renders as static dim dots, identical visually to current state.
7. **Lint:** `npm run lint` clean.
8. **GitHub:** open follow-up issue referencing #3, or extend #3 with this work.

---

## Open questions

None blocking — design is locked. Constants above will likely need 1–2 nudges after the first preview.
