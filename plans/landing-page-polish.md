# Landing page tweaks: typography, hero motion, leak/services/process revamps

## Context

The Upframe AI landing page (single-file React + Babel-in-browser stack) needs a polish pass across seven areas. The user reviewed the current localhost build and called out specific issues: weak heading hierarchy, text-only wordmark, static hero panel, generic ↗ arrow on CTAs, broken visuals in The Leak section, cheap-looking workflow card and a growing agent chat card in Services, and a draggable process timeline with uneven spacing that should auto-advance.

Goal: bring the page closer to a finished, "moving" product surface — every section should feel alive and communicate the value of agents, workflows, and websites at a glance.

## Pre-flight (first execution step)

1. Open a GitHub issue via `mcp__plugin_github_github__issue_write` titled **"Landing page polish: typography, hero motion, leak/services/process revamps"** with a body that lists each of the seven tweaks below as a checklist. Capture the issue number — every commit and the final PR will reference it (per `CLAUDE.md` workflow).

---

## 1. Heading: larger + thinner

**File:** [site/site.css](site/site.css#L113-L119)

Update `.uf-hero__h`:
- `font-size: clamp(68px, 8.6vw, 128px)` → `clamp(80px, 10.5vw, 168px)`
- `font-weight: 500` → `300`
- Keep `line-height: 0.94` and `letter-spacing: -0.05em`.

No JSX change. Visually verify the mint `<span class="mint">leads.</span>` still tracks correctly at the new size.

---

## 2. Wordmark → logo-text.png

**Files:** [site/c-primitives.jsx](site/c-primitives.jsx#L5-L15), [site/site.css](site/site.css#L36-L40)

- In `Nav`, replace the `<Mark />` + `<span class="uf-nav__wm">…</span>` block with a single `<img src="assets/logo-text.png" alt="Upframe AI" class="uf-nav__logo" />`.
- Keep the `Wordmark` export (used elsewhere — e.g. footer in `c-proof.jsx`) untouched for now; only the nav changes.
- Add `.uf-nav__logo` CSS: `height: 40px; width: auto; display: block;`. The asset's dark background blends with the nav's dark backdrop, per user's decision.
- Delete the unused `.uf-nav__wm` rule (and `.up`, `.fr` children) if no other call sites remain — `grep` first to confirm.

---

## 3. Hero right panel → live event feed

**Files:** [site/c-primitives.jsx](site/c-primitives.jsx#L83-L95), [site/site.css](site/site.css#L128-L147)

Replace the static `.uf-tick` markup with a new `EventFeed` component (defined in `c-primitives.jsx` alongside `Hero`, attached to `window`).

**Data:** A pool of ~12 event templates across three product surfaces, each tagged `[AGENT]`, `[FLOW]`, or `[SITE]` in mint mono. Each event has: tag, primary text, value/delta, timestamp ("just now", "2s", "14s"…). Examples:
- `[AGENT]  Voice agent answered call  ·  23s response`
- `[FLOW]   Quote → CRM → SMS  ·  4 steps`
- `[SITE]   Form filled · sealcoat  ·  +$540`
- `[AGENT]  Lead qualified · plumbing  ·  +$480`
- `[FLOW]   Review request sent  ·  ⭐ 4.9`
- `[SITE]   Conversion · 8.4%  ·  ▲ 1.2pt`

**Behavior:** Show 5 visible rows. Every ~1.6s, prepend a new event from the pool (rotate / shuffle), shift existing rows down, drop the oldest. Most recent row gets a brief mint glow + "just now" timestamp; older rows' timestamps tick up (each render frame recomputes age from a stored `addedAt`).

**Implementation:** `useState` for the array of `{id, tag, text, value, addedAt}`. A single `setInterval` (1.6s) for adds. Use CSS `transition: transform 600ms var(--ease-out)` on rows so each entry slides in cleanly; key by `id` so React diffs don't break the animation. Header stays similar: "Live · today" + pulsing mint dot.

**CSS:** Replace `.uf-tick` with `.uf-feed` (same surface treatment) and `.uf-feed__row` (grid: `auto 1fr auto` for tag / text / value+time). Add a `.uf-feed__row--new` modifier with mint border-left flash for 400ms.

---

## 4. CTA arrow → inline SVG arrow-right

**Files:** [site/c-primitives.jsx](site/c-primitives.jsx#L19-L23), [site/site.css](site/site.css#L70-L75)

- Change `Btn` so when `arrow` is truthy, it renders an inline SVG (16×16, `stroke="currentColor"`, `stroke-width="2"`, simple `M5 12h14 M13 6l6 6-6 6` arrow-right). Drop reliance on Unicode glyphs.
- Update all `arrow="↗"` call sites to `arrow` (boolean) — confirmed call sites: [c-primitives.jsx:47](site/c-primitives.jsx#L47), [c-primitives.jsx:75](site/c-primitives.jsx#L75). Grep for any other `arrow=` usages before flipping.
- `.uf-arrow` CSS: drop the mono font rule, set `display: inline-flex; align-items: center;` and a subtle `transition: transform 200ms var(--ease-out)`; on `.uf-btn:hover .uf-arrow { transform: translateX(2px); }` for a small forward nudge.

---

## 5. The Leak → leaky pipe vs sealed pipe

**Files:** [site/c-leak.jsx](site/c-leak.jsx) (full rewrite of `QuoteRace` → new `LeakPipes`), [site/site.css](site/site.css#L149-L223) (replace `.uf-race*` / `.uf-lead*` rules)

Visualization: two stacked horizontal "pipes" rendered in SVG, each ~640×80.

**Top pipe — WITHOUT:** A horizontal capsule with three visible crack notches at 25%, 50%, 75%. Mint orbs (lead tokens) emit from the left every ~900ms. Each orb travels right at constant speed; at each crack, a random ~70% of orbs leak out (animated downward fall + fade, with a small `−$` amber label trailing). The few orbs that survive reach the right end and pile up in a tiny "Lost" bucket (gray, struck-through). Running tally below: `−$1,860 walked` (incremented as orbs leak).

**Bottom pipe — WITH:** A sealed capsule with subtle mint glow. Orbs emit at the same cadence, travel through cleanly, and arrive at a mint "Booked" bucket on the right. Running tally: `+$2,400 booked`.

**Loop:** Reset both pipes / counters every 18s for a fresh demo cycle.

**Implementation:** Single `requestAnimationFrame` loop computing each orb's `(x, y, opacity, dying)` from elapsed time. Orb state held in `useRef` (mutable array of `{id, lane, born, leakAt|null}`). React renders the array to SVG `<circle>` elements; `<g>` per orb for translate + leak-fall transform. Crack positions and per-crack leak probabilities are constants. Pipes themselves are SVG `<rect>` with rounded corners; cracks are small jagged `<path>` overlays in amber on the top pipe.

**Eyebrow + section copy:** Keep the existing eyebrow/heading from `TheLeakSection` — only the inner viz changes. Keep section padding/layout intact.

---

## 6. Services revamp

### 6a. Workflow card → N8N-inspired graph

**Files:** [site/c-services.jsx](site/c-services.jsx#L32-L87) (rewrite `NodeGraph`), [site/site.css](site/site.css#L324-L339) (replace `.uf-graph*` rules)

Replace the current pulse-along-edge SVG with an N8N-style workflow:

- **Nodes:** 5 rounded-rect "cards" (~110×40) with a small icon glyph + label: `Webhook` → `Wait 5m` → `Send SMS` → `Branch (replied?)` → `Update CRM` / `Re-send`. Two terminal branches off the branch node, like N8N's conditional outputs.
- **Edges:** Bezier curves with rounded right-angle bends (S-curve via SVG `<path>` `C` commands) — N8N's signature look. Resting state: 1px steel.
- **Execution animation:** Sequential glow. An internal `currentStep` index advances every ~700ms. The active node gets a mint outer glow + scale(1.04); the edge from previous → current animates a mint gradient sweep along the path (`stroke-dasharray` + animated `stroke-dashoffset`); once it reaches the next node, glow transfers. At the branch, alternate which leg lights up each cycle.
- **Reset:** After the final node, fade all nodes to "completed" mint tint for ~600ms, then reset to start. Loops indefinitely.

**Implementation:** Compute node positions once (constants, not random). SVG `<defs>` for the mint gradient. Use a single `setInterval` for `currentStep` advancement plus CSS classes on `<g class="uf-flow__node is-active">` for glow. Avoid layout libs — hand-position 5 nodes for a deliberately composed look.

### 6b. AgentChat → sliding window

**Files:** [site/c-services.jsx](site/c-services.jsx#L90-L150), [site/site.css](site/site.css#L342)

- Cap visible messages to the last 3. When a new message would be the 4th, drop the oldest as the new one enters (FIFO).
- Add `height: 220px;` (fixed) to `.uf-agent-chat`. Remove the `min-height: 200px` that was implicit. `overflow: hidden` to clip incoming animations cleanly.
- Each message: `transition: opacity 250ms, transform 250ms`. Entering messages animate `translateY(8px) → 0` + opacity 0 → 1. Exiting messages animate opacity → 0 (key removal handled by React; an exit transition needs a tiny wrapper holding the outgoing message for 250ms via a ref-tracked queue, OR — simpler — accept that exit is an instant cut and only the entry is animated; the user said "in one place", that's the priority).
- Keep the typing indicator and 6-message script. After the script finishes, reset to message 1 (existing loop logic stays).

### 6c. MiniSite — no changes

User likes it. Leave [site/c-services.jsx:5-29](site/c-services.jsx#L5-L29) and the corresponding CSS as-is.

---

## 7. Process section → equal spacing + auto-advance, no drag

**Files:** [site/c-process.jsx](site/c-process.jsx), [site/site.css](site/site.css#L363-L437)

Behavior changes:
- **Equal spacing:** Replace day-based positioning. Position by index: `left: ${(i / (STEPS.length - 1)) * 100}%`. Remove `dayToPct` (or keep only for the label, not position). The handle position also tracks by index ratio.
- **Auto-advance by stage, not day:** Drop the `day` state's continuous interpolation. New state `stageIdx` (0..4). A `setInterval` (or single rAF with elapsed checks) advances `stageIdx` every **3200ms** with cubic-ease fill animation on `.uf-timeline__fill` width (CSS transition `width 600ms var(--ease-out)`). After last stage, hold 1.5s then loop to 0.
- **Remove drag entirely:** Delete `onPointerDown`, `onPointerMove`, `onPointerUp`, `handlePointer`, `draggingRef`, `isDragging` state, the 6s resume `useEffect`, and the pointer event handlers on `.uf-timeline__track`. Drop `.uf-timeline__handle.dragging` from CSS and the `touch-action: none` / `cursor: grab` rules.
- **Click-to-jump:** Keep each `.uf-timeline__node` as a clickable button (`role="button"`, `onClick={() => setStageIdx(i)}`). Clicking pauses auto-advance for 5s, then resumes from the clicked stage. (One small `pauseUntilRef` is enough — no need for the old `interactedRef`.)
- **Hint copy:** Replace "AUTO · DRAG TO PAUSE" with just "AUTO". Optionally remove `.uf-timeline__autohint` entirely if it adds clutter.
- **Card content:** Unchanged — keep the panel swap driven by `stageIdx` instead of `currentIdx`.

---

## Critical files to modify

| File | What changes |
|---|---|
| [site/c-primitives.jsx](site/c-primitives.jsx) | Nav logo swap, Btn arrow SVG, new EventFeed component, Hero panel swap |
| [site/c-leak.jsx](site/c-leak.jsx) | Replace `QuoteRace` with `LeakPipes` |
| [site/c-services.jsx](site/c-services.jsx) | Rewrite `NodeGraph`, retrofit `AgentChat` to sliding window |
| [site/c-process.jsx](site/c-process.jsx) | Strip drag logic, equal-spaced stage-based auto-advance, click-to-jump |
| [site/site.css](site/site.css) | Heading sizing/weight; `.uf-nav__logo`; new `.uf-feed*`; new `.uf-pipe*`; new `.uf-flow*`; agent-chat fixed height; `.uf-timeline*` cursor/transition cleanup |
| [index.html](index.html) | No changes (script load order unaffected) |

---

## Verification

After implementation:

1. **Serve & visual check** — `python3 -m http.server 3000` from repo root, open `http://localhost:3000` in a browser. Hard-refresh after each batch of changes (Babel re-transpiles in-browser).
2. **Section-by-section walkthrough:**
   - Nav: new logo visible, sized cleanly, no broken `Mark` references.
   - Hero: heading visibly bigger + thinner. Right panel shows rotating event feed; new rows enter every ~1.6s; tags color-coded.
   - CTAs: every "Book a call" shows the new SVG arrow; hover nudges it forward 2px. Grep confirms no remaining `arrow="↗"` strings.
   - Leak: orbs flow on both pipes; top pipe visibly leaks orbs at the cracks with $ falling; bottom pipe stays clean; counters tick.
   - Services: workflow card shows N8N-style graph with sequential glow; agent chat card height is stable (no growth) and shows only last 3 messages; mini site card unchanged.
   - Process: 5 nodes equally spaced; auto-advances every ~3.2s; clicking a past node jumps back, pauses 5s, resumes; no drag cursor or movement on the track.
3. **Console check** — DevTools console should be clean (no React key warnings from the feed/chat lists, no SVG attribute warnings).
4. **Lint** — `npm run lint` must pass with zero errors before marking the work complete (per `CLAUDE.md`).
5. **Issue close** — link the closing PR to the issue so it auto-closes on merge.
