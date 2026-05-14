# Plan: Redesign CTA + Secondary Buttons

## Context

Buttons currently use a simple 8px rounded rectangle (mint fill for primary, amber for urgent, bordered transparent for secondary) — see [site/site.css](../site/site.css) lines 125-146. We want a more distinctive, modern button system:

- **CTAs** (primary + urgent): fully circular pill shape, dark base, accent circle (pip) on the right with an arrowhead-only icon. On hover the pip expands across the entire button (inset 4px from the border so it never touches it), and the chevron lands at the button's geometric center. Both animations share `var(--dur-slow)` (320ms) and `var(--ease-in-out)` so they finish together.
- **Primary** keeps **mint** as the accent. **Urgent** keeps its **amber** identity (dark base + amber pip + amber expanding fill), so the cost-of-inaction CTA stays visually distinct from the booking CTAs.
- **Secondary**: same fully-circular pill shape, subtle glass effect (translucent white + backdrop blur), no icon, no expanding animation.

Only `site/c-primitives.jsx` (the `Btn` component) and the Buttons block in `site/site.css` change. All 6 existing `Btn` call sites continue to work unchanged.

## Files to Modify

| File | Change |
|---|---|
| `site/c-primitives.jsx` | Rewrite `Btn` to wrap text in `.uf-btn__label` and emit a `.uf-btn__pip` for primary/urgent. Add an arrowhead-only `ChevronIcon` (no horizontal stem). Delete `ArrowIcon` if unused after the swap. |
| `site/site.css` | Replace the Buttons block with pill-shape base, pip styles, expanding-fill via the pip itself (animated `left`/`right`), label fade, and glass secondary. |

No call sites change. Existing `arrow` prop is preserved (Nav, Hero, Closing, Calculator pass it → they get the pip; secondary buttons omit it → no pip).

## Approach

### 1. `Btn` component (in `site/c-primitives.jsx`)

```jsx
const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"
       strokeLinejoin="round" aria-hidden="true">
    <path d="M9 6l6 6-6 6"/>
  </svg>
);

const Btn = ({ variant = 'primary', size, arrow, children, onClick, type }) => {
  const hasPip = (variant === 'primary' || variant === 'urgent') && arrow !== false;
  return (
    <button type={type || 'button'}
            className={`uf-btn uf-btn--${variant}${size ? ' uf-btn--' + size : ''}`}
            onClick={onClick}>
      <span className="uf-btn__label">{children}</span>
      {hasPip && <span className="uf-btn__pip" aria-hidden="true"><ChevronIcon /></span>}
    </button>
  );
};
```

`arrow` is preserved as an opt-out (`arrow={false}` would suppress the pip on a primary). Secondary/ghost never get a pip.

### 2. CSS — pill base (replaces site/site.css:125-146)

```css
/* ============ Buttons ============ */
.uf-btn {
  font-family: var(--font-display); font-weight: 600; font-size: 14px;
  letter-spacing: -0.005em;
  border: 0; cursor: pointer; white-space: nowrap;
  display: inline-flex; align-items: center; justify-content: space-between;
  gap: 10px;
  border-radius: var(--radius-pill);
  position: relative; overflow: hidden;
  padding: 4px 4px 4px 18px;
  transition: color var(--dur-slow) var(--ease-in-out);
}
.uf-btn--lg { font-size: 15px; padding: 6px 6px 6px 24px; }

.uf-btn__label {
  position: relative; z-index: 2;
  transition: opacity var(--dur-slow) var(--ease-in-out);
}
```

### 3. CSS — CTA variants (primary = mint, urgent = amber)

The pip is absolutely positioned. On hover its `left` animates from `auto` to `4px` (keeping `right: 4px`), so the pip widens leftward to fill the button minus the 4px inset. The chevron is flex-centered inside the pip, so as the pip widens its center (and the chevron with it) eases from the right side to the button's geometric center. One transition, one duration, one easing — fill and chevron land at the same moment by construction.

```css
.uf-btn--primary,
.uf-btn--urgent {
  background: var(--surface-2);
  color: var(--cloud);
  border: 1px solid var(--steel);
}

.uf-btn__pip {
  position: absolute;
  top: 4px; bottom: 4px;
  right: 4px; left: auto;
  width: 32px;
  display: inline-flex; align-items: center; justify-content: center;
  border-radius: var(--radius-pill);
  color: var(--void);
  z-index: 2;
  transition: left  var(--dur-slow) var(--ease-in-out),
              right var(--dur-slow) var(--ease-in-out),
              width var(--dur-slow) var(--ease-in-out);
}
.uf-btn--lg .uf-btn__pip { width: 38px; }

.uf-btn--primary .uf-btn__pip { background: var(--mint); }
.uf-btn--urgent  .uf-btn__pip { background: var(--amber); }

.uf-btn--primary:hover .uf-btn__pip,
.uf-btn--urgent:hover  .uf-btn__pip {
  left: 4px; right: 4px; width: auto;
}

.uf-btn--primary:hover .uf-btn__label,
.uf-btn--urgent:hover  .uf-btn__label { opacity: 0; }
```

The thin dark border stays visible as a frame around the expanded fill — matching the spec ("expand and ease through the whole button, but not touching the borders").

### 4. CSS — secondary (glass)

```css
.uf-btn--secondary {
  background: rgba(255, 255, 255, 0.04);
  color: var(--cloud);
  border: 1px solid rgba(255, 255, 255, 0.10);
  padding: 10px 22px;
  backdrop-filter: blur(10px) saturate(140%);
  -webkit-backdrop-filter: blur(10px) saturate(140%);
  transition: background var(--dur-base) var(--ease-out),
              border-color var(--dur-base) var(--ease-out);
}
.uf-btn--lg.uf-btn--secondary { padding: 13px 28px; font-size: 15px; }
.uf-btn--secondary:hover {
  background: rgba(255, 255, 255, 0.07);
  border-color: rgba(255, 255, 255, 0.16);
}
```

### 5. Ghost variant

Keep current behaviour, only update `border-radius` to `var(--radius-pill)` for consistency.

## Verification

1. **Dev server:** `python3 -m http.server 3000`, hard-refresh `http://localhost:3000`.
2. **Lint:** `npm run lint` — zero errors before marking done.
3. **Playwright MCP — required before marking done**:
   - Navigate to `http://localhost:3000`.
   - Screenshot **idle** state of:
     - Nav primary (`Book a call`)
     - Hero primary (`Book a call`, lg) + secondary (`See the leak`, lg)
     - Calculator urgent (`Stop the leak`, lg) — confirm amber pip
     - Closing primary (`Book a call`, lg) + secondary (`Back to top`, lg)
   - `browser_hover` each CTA, screenshot the **hover** state — verify:
     - Mint/amber fill expands inset (4px gap to border, never touching)
     - Chevron lands at the button's horizontal center
     - Label has faded to opacity 0
     - Fill expansion and chevron centering finish simultaneously
   - Confirm secondary glass is legible on the void page background and over any card backgrounds it overlaps.
4. **Regression check:** scroll the full page once; ensure Nav / Hero / Calculator / Closing rows have no layout shift, and the FAB hasn't been affected.
5. **Close the issue** by referencing its # in the PR body (auto-close on merge).

## Critical files

- `site/c-primitives.jsx` — `Btn` (90-94), `ArrowIcon` (83-88)
- `site/site.css` — Buttons block (125-146)
- `assets/colors_and_type.css` — already exposes `--radius-pill`, `--dur-slow`, `--ease-in-out`, `--surface-2`, `--mint`, `--amber`, `--steel`, `--cloud`, `--void` (no new tokens needed)
- Call sites (read-only sanity check, no edits): `c-primitives.jsx:117, 502, 503`, `c-proof.jsx:111, 112`, `c-calc.jsx:101`
