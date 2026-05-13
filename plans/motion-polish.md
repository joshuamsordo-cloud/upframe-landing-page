# Plan: Scroll reveals + hero polish (top spacing, gradient wave, first-load motion)

## Context

The page is now functionally complete and visually polished but reads as static on first paint. Three follow-ups:

1. **No motion as the visitor scrolls.** Every section's eyebrow / heading / sub-text just appears in place when you scroll to it. Adding a subtle reveal as content enters the viewport is what makes the page feel "alive" between the interactive moments (hero dot field, leak pipes, ROI calculator). We have a precedent already — `uf-feed-in`, `uf-msg-in`, `uf-fab-in` are three near-identical fade+slide keyframes in [site/site.css](../site/site.css) used by the live feed and chat panel. We should consolidate that pattern into a reusable utility and apply it everywhere via `IntersectionObserver`.
2. **Hero has too much top dead space.** `.uf-section--hero` uses `padding: 144px 0 96px` ([site.css:34](../site/site.css#L34)). With the bigger `clamp(96, 12vw, 200)` headline ([site.css:127](../site/site.css#L127)) the content already feels larger; the 144px top push makes the eyebrow start far below the nav.
3. **"leads." is solid mint.** The user wants it to keep shifting through mint shades — a slow, calm gradient wave, not a flashy shimmer. And on first load, the hero should *open* rather than just appear.

Intended outcome: a page that feels animated and intentional on first paint and on every subsequent section the visitor scrolls into, without overusing motion (the page already has live elements — the dot field, leak pipes, agent chat, FAB pulse — so reveals stay subtle).

---

## Critical files

| File | Purpose |
|---|---|
| `site/site.css` | New `.uf-reveal` utility + keyframe, gradient-wave keyframe on `.uf-hero__h .mint`, hero padding tweak, optional first-load keyframes |
| `site/c-primitives.jsx` | New `useReveal` hook (IntersectionObserver) attached to Hero subtree; first-load animation orchestration; word-splitting helper for headings |
| `site/c-leak.jsx`, `c-calc.jsx`, `c-services.jsx`, `c-process.jsx`, `c-proof.jsx` | Add `data-reveal` attributes to eyebrow / heading / sub / content blocks so the global observer picks them up |
| `site/app.jsx` | Mount a global `RevealController` once so a single `IntersectionObserver` handles every `[data-reveal]` element on the page |

No new files. All work lives in the existing component + CSS files.

---

## Approach

### 1 — Generic scroll-reveal system

**Pattern.** A single page-wide `IntersectionObserver` finds every `[data-reveal]` and adds class `.uf-revealed` the first time the element crosses ~15% into the viewport. Element starts with `opacity: 0; transform: translateY(14px)` and animates to `opacity: 1; transform: none` over ~600ms using `var(--ease-out)`. Once revealed, the observer unobserves that element (one-shot — no thrashing on scroll-back).

**Optional stagger.** `data-reveal-delay="N"` sets a per-element delay in ms via inline `style="--reveal-delay: ${N}ms"` consumed by the CSS rule (`transition-delay: var(--reveal-delay, 0ms)`). I'll attach 0/80/160/240ms delays to eyebrow → heading → sub → content/CTA in each section.

**Per-word heading stagger.** For the *main* heading of each section (`.uf-sech__h`, `.uf-closing__h`, `.uf-hero__h`), wrap each word in a `<span class="uf-word">` so they can animate in sequence. Implemented as a small helper in `c-primitives.jsx` that takes the children, splits on spaces, returns `[<span class="uf-word">word</span>, ' ', ...]`. Existing `<span className="mint">` / `<span className="amber">` color spans inside a heading get preserved by treating them as atomic word tokens — the helper walks children, splits string children, leaves element children alone.

**Reduced motion.** A top-level CSS guard:
```css
@media (prefers-reduced-motion: reduce) {
  .uf-reveal, .uf-word { opacity: 1 !important; transform: none !important; transition: none !important; }
  .uf-hero__h .mint { animation: none !important; background: none !important; -webkit-text-fill-color: var(--mint) !important; }
}
```

**Sections to wire up.**

| Section | Reveal targets (stagger order) |
|---|---|
| Hero | (special — handled by first-load orchestrator, see §3) |
| Leak | eyebrow → heading words → sub → pipes container → counters → run-yours close |
| ROI Calc | eyebrow → heading words → sub → input grid → output panel |
| Services | eyebrow → heading words → sub → service card 1 → 2 → 3 |
| Process | eyebrow → heading words → sub → timeline track |
| Proof | eyebrow → heading words → sub → testimonial cards (2×2 stagger by row) |
| Closing CTA | eyebrow → heading words → sub → CTA button row → meta badges |

### 2 — Hero: shift content upward

Single change in [site.css:34](../site/site.css#L34):
```css
.uf-section--hero { padding: 80px 0 96px; border-top: 0; }
```
That's 144 → **80px** top. The 64px nav + 80px hero padding leaves a 144px gap from viewport top to the eyebrow — enough breathing room while bringing the headline up so it dominates the first paint. (Optionally drop hero `margin-top: 22px` on `.uf-hero__h` ([site.css:131](../site/site.css#L131)) → `margin-top: 12px` if we want even tighter.)

### 3 — "leads." gradient wave

Replace the static mint color in [site.css:132](../site/site.css#L132) with a clipped gradient:

```css
.uf-hero__h .mint {
  background: linear-gradient(
    100deg,
    #4ade80 0%,    /* deep mint */
    #86EFAC 35%,   /* brand mint */
    #bbf7d0 50%,   /* pale mint */
    #86EFAC 65%,
    #4ade80 100%
  );
  background-size: 220% 100%;
  background-position: 0% 50%;
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
          text-fill-color: transparent;
  animation: uf-mint-wave 7s linear infinite;
}
@keyframes uf-mint-wave {
  0%   { background-position:   0% 50%; }
  100% { background-position: 220% 50%; }
}
```

The 7s cycle is intentionally slow so it reads as a gentle wash, not a "shimmer." Three mint stops cycling left-to-right gives a soft hue shift without ever leaving the mint family. Falls back to solid mint under reduced-motion (already covered by the guard above).

Applies to other `.mint` accent words in headings too — but only inside `.uf-hero__h` per the selector. Other section heading `.mint` words stay solid (intentional — the hero is the only place that should feel alive in this way).

### 4 — First-load hero animation: mint pulse from the dot field

A single one-time pulse runs through `HeroDotField` on mount, and the hero content cascade-reveals over the top of it. The pulse ties the dot field, the lower-left mint glow, and the headline into one opening beat.

**Pulse mechanics (`HeroDotField` in [c-primitives.jsx](../site/c-primitives.jsx))**

- A new `firstLoadStartRef` ref captures `performance.now()` when the component mounts. While `(now - start) < PULSE_DURATION_MS` (≈ 1000ms), the `drawDots` loop adds a *radial-wave* term to each dot's intensity:
  - Origin `P = (0.15 * w, 0.85 * h)` (matches the lower-left mint radial in [.uf-hero](../site/site.css#L108) so the pulse appears to bloom *from* that glow).
  - Wave radius `R(t) = ease(t/PULSE_DURATION_MS) * maxDist` where `maxDist = √(w² + h²)`. `ease` is `1 - (1 - t)²` (ease-out quad) so the wave expands fast then decelerates.
  - For each dot: distance `d = ‖dot - P‖`. Brightness contribution `b = exp(-((d - R(t))² / (2 * sigma²)))` where `sigma ≈ 90px` — a Gaussian band ~90px wide. Multiply by an envelope `env(t) = sin(π * t/PULSE_DURATION_MS)` so the wave fades in *and* out smoothly, never starting or ending sharply.
  - Final intensity for the dot = `max(cursorIntensity, wakeIntensity, b * pulseGain)`. `pulseGain` starts at ~0.95 so the brightest part of the wave reads as nearly-full mint.
  - After `PULSE_DURATION_MS`, the term is dropped and the field returns to its normal cursor-driven behavior. Total cost is one extra distance + math.exp per dot per frame for ~1 second — well within budget.

- Constants added next to the existing dot-field knobs:
  ```js
  const PULSE_DURATION_MS = 1000;
  const PULSE_ORIGIN = [0.15, 0.85];   // fraction of canvas
  const PULSE_SIGMA = 90;
  const PULSE_GAIN = 0.95;
  ```

- The pulse runs even if the cursor is also active — the `max()` combine means whichever signal is brighter wins per dot, no awkward additive overflow.

- Under `prefers-reduced-motion: reduce` or `(hover: none)`, the existing static-fallback branch is unchanged and the pulse simply doesn't run.

**Cascade reveal (layered on top)**

The hero subtree uses the standard `[data-reveal]` system from §1, but the controller fires its observer immediately for the hero (already in viewport on mount) and applies these per-element delays so the content rises *into* the pulse:

- `0ms` — eyebrow
- `220ms` — "Stop losing" word-by-word, 60ms apart (so the cascade lands roughly when the pulse wave passes the headline area)
- `460ms` — "leads." pops in with a slight scale-up (1.06 → 1.0); gradient wave (§3) starts
- `640ms` — sub-text
- `820ms` — CTA row + hint
- `1000ms` — live feed panel slides in from the right (24px translate); feed rows continue their existing `uf-feed-in` cadence

The pulse peaks around 500ms (mid-`env(t)`) — right as the headline lands — so the brightest mint wave coincides with "leads." appearing. Settled state by ~1.1s.

### 5 — `useReveal` / `RevealController` implementation sketch

In `c-primitives.jsx`, a single page-wide controller mounted by `app.jsx`:

```jsx
const RevealController = () => {
  useEffectPr(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('uf-revealed');
          io.unobserve(e.target);
        }
      }
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0 });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
};
```

Section JSX adopts `data-reveal` / `data-reveal-delay`. Heading word-split runs at render time via a small helper:

```jsx
const splitWords = (children) => {
  // recursively walk children, split string children on whitespace,
  // wrap each word in <span className="uf-word">word</span>, leave
  // element children (existing mint/amber color spans) intact
};
```

CSS:
```css
[data-reveal] {
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 600ms var(--ease-out), transform 600ms var(--ease-out);
  transition-delay: var(--reveal-delay, 0ms);
}
[data-reveal].uf-revealed { opacity: 1; transform: none; }

.uf-word {
  display: inline-block;
  opacity: 0;
  transform: translateY(0.4em);
  transition: opacity 520ms var(--ease-out), transform 520ms var(--ease-out);
  transition-delay: calc(var(--word-base, 0ms) + var(--word-i, 0) * 60ms);
}
.uf-revealed .uf-word { opacity: 1; transform: none; }
```

Word indices set via inline style on each word span (`style="--word-i: 0"`, `1`, ...). Heading element gets `--word-base` to offset the word cascade after its own block reveal kicks in.

---

## Verification

1. **Dev server:** `python3 -m http.server 3000` → `http://localhost:3000`. Hard refresh after each edit.
2. **First load:** chosen first-load animation runs once, hero content settles, "leads." starts cycling mint shades smoothly.
3. **Hero spacing:** measure with DevTools — eyebrow top edge ≤ ~150px from viewport top at 1440×900.
4. **Scroll-reveal:** scroll slowly through each section; each block fades + slides up just before/as it crosses into view. Scrolling back should *not* re-trigger (one-shot).
5. **Heading word stagger:** the section heading words appear in left-to-right cascade with ~60ms spacing.
6. **Reduced motion:** flip the system setting (or DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce"). All reveals + gradient wave + first-load animation should be inert; everything visible at full opacity from t=0.
7. **`npm run lint`** clean.
8. **No new console errors** beyond the existing in-browser Babel transformer warning.
9. **GitHub:** open a new issue tracking this work, reference it in the commit + PR.

