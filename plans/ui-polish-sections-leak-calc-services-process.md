# UI Polish — Leak, Calculator, Services, Process

## Goal
Fix four sections across the landing page: persistent card coloring in The Leak, pulsing slider knobs in the Calculator, several Services card/content fixes, and text + layout fixes in the Process section.

## Issue reference
GitHub issue: TBD (created alongside this plan)

---

## 1. The Leak — cards stay colored once the orb passes

**File:** `site/c-leak.jsx`

**Problem:** `isActive` on `StageChip` is `i < topPos.stageIdx || isPulse`. When the orb is in transit (atStage = false), `isPulse` is false and `stageIdx` still points to the FROM stage, so the current chip goes dark mid-transit.

**Fix:** Change:
```js
const isActive = i < topPos.stageIdx || isPulse;
```
to:
```js
const isActive = i <= topPos.stageIdx;
```
Apply this change to both the top lane and the bottom lane chip loops. Once the orb first dwells at a stage, that chip stays lit for the rest of the cycle.

---

## 2. Calculator — pulsing slider knobs

**File:** `site/site.css`

**Problem:** The range slider thumbs are static; users don't infer they are interactive.

**Fix:** Add a repeating `box-shadow` pulse animation to the thumb.

```css
@keyframes uf-slider-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(134,239,172,0.5); }
  50%       { box-shadow: 0 0 0 6px rgba(134,239,172,0.0); }
}
```

Apply on the idle (non-active) thumb:
```css
.uf-slider::-webkit-slider-thumb { animation: uf-slider-pulse 2s ease-in-out infinite; }
.uf-slider::-moz-range-thumb    { animation: uf-slider-pulse 2s ease-in-out infinite; }
```

Suppress the animation on `:active` to avoid fighting with the existing `box-shadow` expansion.

---

## 3. Services section

### 3a. Change subheading text

**File:** `site/c-services.jsx` — line 289

Change the `<p className="uf-sech__sub">` text to:
> "No fixed tiers. We start where the leak is biggest and build out from there."

(Removes "— usually the phone —" from the existing text.)

### 3b. Fix AgentChat card height jitter

**Files:** `site/site.css`

**Problem:** `.uf-service__viz` uses `min-height: 200px` so it grows as chat messages accumulate, pushing the card taller and causing the page to jump.

**Fix:**
- Change `.uf-service__viz` to `height: 220px` (drop `min-height`, use fixed `height`). `overflow: hidden` already on that class will clip cleanly.
- `.uf-agent-chat` already has `height: 100%` and `min-height: 220px` — remove `min-height` from `.uf-agent-chat` too so it inherits the fixed parent height.

### 3c. Workflow Automation — top-to-bottom branching flow

**File:** `site/c-services.jsx`

**Problem:** Current flow is left-to-right (horizontal). Request is for top-to-bottom with multiple branches resolving to one outcome.

**New layout (viewBox 60×100):**

```
        Lead In
           │
        Qualify
           │
     ┌─────┴─────┐
   SMS         Log CRM
     └─────┬─────┘
        Booked
```

New node list:
```js
const FLOW_NODES = [
  { id: 'lead',   x: 30, y:  8,  lbl: 'Lead In',  sub: 'inbound'  },
  { id: 'qual',   x: 30, y: 28,  lbl: 'Qualify',  sub: '9s'       },
  { id: 'sms',    x: 12, y: 52,  lbl: 'SMS',      sub: 'twilio'   },
  { id: 'crm',    x: 48, y: 52,  lbl: 'Log CRM',  sub: 'hubspot'  },
  { id: 'booked', x: 30, y: 78,  lbl: 'Booked',   sub: '+$520'    },
];
```

Edges: lead→qual, qual→sms, qual→crm, sms→booked, crm→booked.

Animation sequence: lead → qual → sms + crm (simultaneous) → booked → reset.

SVG viewBox: `0 0 60 90`. Adjust `path()` helper for vertical beziers (control points use `dy`, not `dx`).

### 3d. Mini website — home services color palette

**Files:** `site/site.css`

**Problem:** Current mini site uses the dark Upframe palette (void/surface/mint), which doesn't read as "a real contractor website" at a glance.

**Fix:** Override colors inside `.uf-mini-site` to a warm home-services palette:
- Background: warm white (`#F7F5F0`)
- Heading: near-black (`#1A1A1A`)
- CTA button: orange (`#E8611A`) — common for HVAC/plumbing sites
- Ghost button: white with gray border
- Review cards: light gray background

Scope all overrides inside `.uf-mini-site { ... }` so they don't bleed out.

---

## 4. Process section

### 4a. Rename eyebrow label

**File:** `site/c-process.jsx` — line 47

Change `HOW IT GOES` → `OUR PROCESS`.

### 4b. Add animated gradient to "to running systems."

**File:** `site/site.css`

**Problem:** `.uf-sech__h .mint` is a flat mint color. `.uf-sech__h .amber` already has a gorgeous wave gradient. Apply the same treatment to `.mint`.

**Fix:** Update `.uf-sech__h .mint`:
```css
.uf-sech__h .mint {
  background: linear-gradient(
    100deg,
    #16a34a 0%, #4ade80 20%, #f0fdf4 50%, #4ade80 80%, #16a34a 100%
  );
  background-size: 300% 100%;
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
          color: transparent;
  animation: uf-mint-wave 5s linear infinite;
  filter: drop-shadow(0 0 24px rgba(134,239,172,0.55));
}
```

`uf-mint-wave` is already defined in the hero block — confirm it's not scoped and reuse it; if scoped, extract to a shared keyframe.

### 4c. Change subtitle text

**File:** `site/c-process.jsx` — line 51

Change text to:
> "Auto-advances through each stage. Click any node to jump back."

### 4d. Fix process bar / panel card overlap

**File:** `site/site.css`

**Problem:** `.uf-timeline__caption` is `position: absolute; top: 28px` relative to the 6px-tall track, so caption text extends ~60px below the track's top edge. The panel has `margin-top: 36px` after the track — but captions extend into that space.

**Fix:** Increase the bottom margin of `.uf-timeline__track` from `56px` to `80px` so captions clear comfortably before the panel starts. Verify in browser at both desktop and 768px viewport.

---

## File change summary

| File | Changes |
|---|---|
| `site/c-leak.jsx` | `isActive` formula for both top and bottom lane chips |
| `site/c-services.jsx` | Subheading text, `FLOW_NODES`/`FLOW_EDGES` redesign, vertical flow animation |
| `site/c-process.jsx` | Eyebrow label, subtitle text |
| `site/site.css` | Slider thumb pulse, service viz fixed height, mini site palette, mint gradient wave, timeline track bottom margin |

## Open questions
- Simultaneous branch animation in the new vertical flow — determine if both sms+crm nodes fire in the same step or staggered 200ms apart.
- Confirm that making `.uf-sech__h .mint` a gradient does not break any other section heading that uses the `.mint` span (hero heading uses `.uf-hero__h .mint` separately, so it should be safe).
