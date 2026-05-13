/* global React */
const { useState: useStatePr, useEffect: useEffectPr, useRef: useRefPr } = React;

/* ----------------------------- Primitives ----------------------------- */

const Mark = ({ size = 28 }) => (
  <img src="assets/logo-mark-mint.png" alt="Upframe" style={{ width: size, height: size, display: 'block' }} draggable="false" />
);

const Wordmark = () => (
  <span className="uf-nav__wm"><span className="up">up</span><span className="fr">frame</span></span>
);

const Eyebrow = ({ children, amber, dot, pulse, ...rest }) => (
  <span {...rest} className={"uf-eyebrow" + (amber ? " uf-eyebrow--amber" : "")}>
    {dot && <span className={"uf-eyebrow__dot" + (pulse ? " pulse" : "")} />}{children}
  </span>
);

/* splitWords — wrap each whitespace-separated word of `children` in a
   <span class="uf-word" style={{ '--word-i': i }}>. Inline elements
   (color spans like `<span class="mint">`, line breaks) pass through
   intact; color spans count as a single word so the cascade indexes them. */
const splitWords = (children) => {
  // Unwrap fragments — React.Children iterates the fragment as a single
  // element otherwise, which silently swallows the per-word logic.
  if (React.isValidElement(children) && children.type === React.Fragment) {
    children = children.props.children;
  }
  let i = 0;
  const out = [];
  React.Children.forEach(children, (child, idx) => {
    if (typeof child === 'string') {
      const parts = child.split(/(\s+)/);
      for (const p of parts) {
        if (p.length === 0) continue;
        if (/^\s+$/.test(p)) { out.push(p); continue; }
        out.push(
          <span key={`w${idx}-${i}`} className="uf-word" style={{ ['--word-i']: i }}>{p}</span>
        );
        i++;
      }
    } else if (React.isValidElement(child)) {
      if (child.type === 'br') {
        out.push(React.cloneElement(child, { key: `br${idx}` }));
      } else {
        const existingCls = child.props.className || '';
        const existingStyle = child.props.style || {};
        out.push(React.cloneElement(child, {
          key: `el${idx}-${i}`,
          className: (existingCls + ' uf-word').trim(),
          style: { ...existingStyle, ['--word-i']: i },
        }));
        i++;
      }
    } else if (child != null && child !== false) {
      out.push(child);
    }
  });
  return out;
};

/* RevealController — single page-wide IntersectionObserver. Adds
   `.uf-revealed` to every `[data-reveal]` the first time it crosses the
   viewport (with a 10% bottom margin so reveals trigger just before the
   element enters fully). One-shot per element. */
const RevealController = () => {
  useEffectPr(() => {
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

const ArrowIcon = () => (
  <svg className="uf-arrow__svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </svg>
);

const Btn = ({ variant = 'primary', size, arrow, children, onClick, type }) => (
  <button type={type || 'button'} className={`uf-btn uf-btn--${variant}${size ? ' uf-btn--' + size : ''}`} onClick={onClick}>
    {children}{arrow && <span className="uf-arrow"><ArrowIcon /></span>}
  </button>
);

/* ----------------------------- Nav ----------------------------- */

const Nav = ({ onBook }) => {
  const goSection = (id) => {
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.offsetTop - 64, behavior: 'smooth' });
  };
  return (
    <nav className="uf-nav">
      <div className="uf-nav__brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
        <img src="assets/logo-mark-mint.png" alt="Upframe AI" className="uf-nav__logo" draggable="false" />
      </div>
      <div className="uf-nav__center">
        <span className="uf-nav__link" onClick={() => goSection('leak')}>The leak</span>
        <span className="uf-nav__link" onClick={() => goSection('calc')}>ROI calculator</span>
        <span className="uf-nav__link" onClick={() => goSection('services')}>Services</span>
        <span className="uf-nav__link" onClick={() => goSection('process')}>Process</span>
        <span className="uf-nav__link" onClick={() => goSection('proof')}>Proof</span>
      </div>
      <div className="uf-nav__cta">
        <span className="uf-nav__live"><span className="dot" />Booking · Jun</span>
        <Btn variant="primary" arrow onClick={onBook}>Book a call</Btn>
      </div>
    </nav>
  );
};

/* ----------------------------- Event feed ----------------------------- */

const FEED_POOL = [
  { tag: 'AGENT', text: 'Voice agent answered call', val: '23s' },
  { tag: 'AGENT', text: 'Lead qualified · plumbing',  val: '+$480' },
  { tag: 'AGENT', text: 'After-hours booking · drain', val: '+$640' },
  { tag: 'AGENT', text: 'SMS reply handled · quote',  val: '+$320' },
  { tag: 'FLOW',  text: 'Quote → CRM → SMS',           val: '4 steps' },
  { tag: 'FLOW',  text: 'Review request sent',         val: '★ 4.9' },
  { tag: 'FLOW',  text: 'No-show recovery triggered',  val: '+$210' },
  { tag: 'FLOW',  text: 'Invoice follow-up · Day 3',   val: 'auto' },
  { tag: 'SITE',  text: 'Form filled · sealcoat',      val: '+$540' },
  { tag: 'SITE',  text: 'Conversion · 8.4%',           val: '+1.2pt' },
  { tag: 'SITE',  text: 'Phone tap · service page',    val: '+$0' },
  { tag: 'SITE',  text: 'Booking widget · 22:47',      val: '+$390' },
];

const FEED_SIZE = 5;
const FEED_INTERVAL_MS = 1600;

const formatAge = (ageMs) => {
  if (ageMs < 1000) return 'just now';
  const s = Math.floor(ageMs / 1000);
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60);
  return m + 'm';
};

const EventFeed = () => {
  const [rows, setRows] = useStatePr([]);
  const [now, setNow] = useStatePr(0);

  useEffectPr(() => {
    // Seed once on mount so addedAt timestamps stay stable across re-renders.
    const t0 = Date.now();
    setRows(Array.from({ length: FEED_SIZE }, (_, i) => {
      const tpl = FEED_POOL[Math.floor(Math.random() * FEED_POOL.length)];
      return { id: t0 - i, ...tpl, addedAt: t0 - i * 4000 };
    }));
    setNow(t0);

    let idCounter = t0 + 1;
    let lastIdx = -1;
    const add = setInterval(() => {
      let idx = Math.floor(Math.random() * FEED_POOL.length);
      if (idx === lastIdx) idx = (idx + 1) % FEED_POOL.length;
      lastIdx = idx;
      const tpl = FEED_POOL[idx];
      const t = Date.now();
      setRows(prev => [{ id: ++idCounter, ...tpl, addedAt: t }, ...prev].slice(0, FEED_SIZE));
      setNow(t);
    }, FEED_INTERVAL_MS);
    const re = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(add); clearInterval(re); };
  }, []);

  return (
    <div className="uf-feed">
      <div className="uf-feed__head">
        <span className="uf-feed__title">Live · today</span>
        <span className="uf-feed__live"><span className="uf-feed__dot" />Monitoring</span>
      </div>
      <div className="uf-feed__list">
        {rows.map((r, i) => {
          const age = now - r.addedAt;
          const isNew = i === 0 && age < 700;
          const isAmber = /\$0|−|missed/i.test(r.val + ' ' + r.text);
          return (
            <div key={r.id} className={"uf-feed__row" + (isNew ? ' uf-feed__row--new' : '')}>
              <span className={"uf-feed__tag uf-feed__tag--" + r.tag.toLowerCase()}>{r.tag}</span>
              <span className="uf-feed__text">{r.text}</span>
              <span className={"uf-feed__val" + (isAmber ? ' amber' : '')}>{r.val}<span className="uf-feed__age">{formatAge(age)}</span></span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ----------------------------- Hero dot field ----------------------------- */

const DOT_SPACING = 24;
const DOT_BASE_RADIUS = 1.0;
const DOT_GLOW_RADIUS = 2.6;        // brighter core
const DOT_HALO_RADIUS = 7.5;        // soft outer halo on active dots
const HALO_ALPHA_GAIN = 0.48;       // multiplier on the outer halo (was 0.32)
const HALO_GATE = 0.12;             // start showing halo earlier (was 0.25)
const R_HALO = 190;                 // a touch wider influence
const R_WAKE = 120;
const WAKE_TTL_MS = 700;
const WAKE_SAMPLE_MIN_DIST = 8;
const WAKE_MAX_SAMPLES = 14;
const BASE_RGB = [58, 58, 58];
const GLOW_RGB = [134, 239, 172];
const BASE_ALPHA = 0.55;
const GLOW_ALPHA = 1.0;             // saturate to full mint at center

/* Magnet displacement — dots get pulled toward the cursor and ease back.
   Critically damped spring: target_disp scales with proximity, current disp
   lerps toward target each frame. Kept light: just two scalars per dot. */
const PULL_MAX_PX = 14;             // farther travel before easing back
const PULL_LERP = 0.18;             // spring stiffness — higher = snappier
const PULL_RETURN_LERP = 0.07;      // softer easing back to rest, so dots linger displaced

/* First-load mint pulse — one-time radial wave through the field. Blooms
   from the lower-left where the .uf-hero radial mint glow sits, peaks
   mid-cycle, fades out at the end. After PULSE_DURATION_MS the term is
   dropped and the field returns to normal cursor/wake-driven behavior. */
const PULSE_DURATION_MS = 1100;
const PULSE_ORIGIN_X = 0.15;        // fraction of canvas width
const PULSE_ORIGIN_Y = 0.85;
const PULSE_SIGMA = 90;             // Gaussian band width (px)
const PULSE_GAIN = 0.95;            // max intensity contribution from the wave

const HeroDotField = () => {
  const wrapperRef = useRefPr(null);
  const canvasRef = useRefPr(null);
  const mouseRef = useRefPr({ x: 0, y: 0, active: false });
  const wakeRef = useRefPr([]);
  const sizeRef = useRefPr({ w: 0, h: 0, dpr: 1 });

  useEffectPr(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const ctx = canvas.getContext('2d');

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const noHover = window.matchMedia('(hover: none)').matches;
    const staticOnly = reduced || noHover;

    let cols = 0, rows = 0;
    let dx = new Float32Array(0);
    let dy = new Float32Array(0);

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      sizeRef.current = { w: rect.width, h: rect.height, dpr };
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.floor(rect.width / DOT_SPACING);
      rows = Math.floor(rect.height / DOT_SPACING);
      dx = new Float32Array(cols * rows);
      dy = new Float32Array(cols * rows);
    };
    resize();

    const drawDots = (mouse, wake, pulse) => {
      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      const baseColor = `rgba(${BASE_RGB[0]}, ${BASE_RGB[1]}, ${BASE_RGB[2]}, ${BASE_ALPHA})`;
      const cursorActive = mouse.active;
      const pulseActive = !!pulse;
      const pulseEnv = pulseActive ? Math.sin(Math.PI * pulse.t01) * PULSE_GAIN : 0;
      const pulse2sigmaSq = 2 * PULSE_SIGMA * PULSE_SIGMA;
      for (let row = 0; row < rows; row++) {
        const gy = DOT_SPACING / 2 + row * DOT_SPACING;
        for (let col = 0; col < cols; col++) {
          const gx = DOT_SPACING / 2 + col * DOT_SPACING;
          const idx = row * cols + col;

          // ---- intensity: cursor halo + wake samples ----
          let intensity = 0;
          let pullTx = 0, pullTy = 0;
          if (cursorActive) {
            const ex = gx - mouse.x;
            const ey = gy - mouse.y;
            const d = Math.hypot(ex, ey);
            if (d < R_HALO) {
              const t = 1 - d / R_HALO;
              intensity = t * t;
              // pull target: toward cursor, scaled by proximity-cubed
              // (so far dots barely move, close dots get yanked)
              const pull = t * t * t * PULL_MAX_PX;
              if (d > 0.01) {
                pullTx = -ex / d * pull;
                pullTy = -ey / d * pull;
              }
            }
          }
          for (let i = 0; i < wake.length; i++) {
            const s = wake[i];
            if (s.weight <= 0) continue;
            const ex = gx - s.x;
            const ey = gy - s.y;
            const d = Math.hypot(ex, ey);
            if (d < R_WAKE) {
              const t = 1 - d / R_WAKE;
              const v = t * t * s.weight;
              if (v > intensity) intensity = v;
              // wake samples also pull, weighted by sample weight, so the trail
              // of dots stays slightly displaced as the cursor moves on
              const pull = t * t * t * s.weight * PULL_MAX_PX * 0.7;
              if (d > 0.01) {
                const wx = -ex / d * pull;
                const wy = -ey / d * pull;
                if (Math.hypot(wx, wy) > Math.hypot(pullTx, pullTy)) {
                  pullTx = wx;
                  pullTy = wy;
                }
              }
            }
          }

          // ---- first-load mint pulse: Gaussian band at expanding radius ----
          if (pulseActive) {
            const ex = gx - pulse.originX;
            const ey = gy - pulse.originY;
            const d = Math.hypot(ex, ey);
            const dist = d - pulse.radius;
            const b = Math.exp(-(dist * dist) / pulse2sigmaSq) * pulseEnv;
            if (b > intensity) intensity = b;
          }

          // ---- displacement update (spring toward target, ease back to 0) ----
          const k = pullTx === 0 && pullTy === 0 ? PULL_RETURN_LERP : PULL_LERP;
          dx[idx] += (pullTx - dx[idx]) * k;
          dy[idx] += (pullTy - dy[idx]) * k;
          const drawX = gx + dx[idx];
          const drawY = gy + dy[idx];

          // ---- color + radius lerp ----
          if (intensity <= 0.01) {
            ctx.fillStyle = baseColor;
            ctx.beginPath();
            ctx.arc(drawX, drawY, DOT_BASE_RADIUS, 0, Math.PI * 2);
            ctx.fill();
            continue;
          }
          const kk = Math.min(1, intensity);
          const r = Math.round(BASE_RGB[0] + (GLOW_RGB[0] - BASE_RGB[0]) * kk);
          const g = Math.round(BASE_RGB[1] + (GLOW_RGB[1] - BASE_RGB[1]) * kk);
          const b = Math.round(BASE_RGB[2] + (GLOW_RGB[2] - BASE_RGB[2]) * kk);
          const a = BASE_ALPHA + (GLOW_ALPHA - BASE_ALPHA) * kk;
          const radius = DOT_BASE_RADIUS + (DOT_GLOW_RADIUS - DOT_BASE_RADIUS) * kk;
          // soft outer halo behind active dots — adds glow without bloating the core
          if (kk > HALO_GATE) {
            const haloA = (kk - HALO_GATE) * HALO_ALPHA_GAIN;
            ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${haloA})`;
            ctx.beginPath();
            ctx.arc(drawX, drawY, DOT_HALO_RADIUS, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
          ctx.beginPath();
          ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    if (staticOnly) {
      drawDots({ active: false, x: 0, y: 0 }, []);
      const onResize = () => { resize(); drawDots({ active: false, x: 0, y: 0 }, []); };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }

    let raf = 0;
    let running = false;
    let lastWakeX = -1e9;
    let lastWakeY = -1e9;

    const onPointerMove = (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current = { x, y, active: true };
      const dx = x - lastWakeX;
      const dy = y - lastWakeY;
      if (Math.hypot(dx, dy) >= WAKE_SAMPLE_MIN_DIST) {
        lastWakeX = x;
        lastWakeY = y;
        wakeRef.current.push({ x, y, t: performance.now(), weight: 1 });
        if (wakeRef.current.length > WAKE_MAX_SAMPLES) {
          wakeRef.current.splice(0, wakeRef.current.length - WAKE_MAX_SAMPLES);
        }
      }
    };
    const onPointerLeave = () => {
      mouseRef.current = { ...mouseRef.current, active: false };
    };

    const pulseStart = performance.now();

    const tick = () => {
      const now = performance.now();
      const wake = wakeRef.current;
      for (let i = wake.length - 1; i >= 0; i--) {
        const age = now - wake[i].t;
        if (age >= WAKE_TTL_MS) { wake.splice(i, 1); continue; }
        wake[i].weight = 1 - age / WAKE_TTL_MS;
      }
      const pulseT = (now - pulseStart) / PULSE_DURATION_MS;
      let pulse = null;
      if (pulseT < 1) {
        const { w, h } = sizeRef.current;
        const maxDist = Math.hypot(w, h);
        const eased = 1 - (1 - pulseT) * (1 - pulseT);  // ease-out quad
        pulse = {
          t01: pulseT,
          originX: PULSE_ORIGIN_X * w,
          originY: PULSE_ORIGIN_Y * h,
          radius: eased * maxDist,
        };
      }
      drawDots(mouseRef.current, wake, pulse);
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (!running) return;
      running = false;
      cancelAnimationFrame(raf);
      // one last static frame so the field doesn't freeze mid-halo
      drawDots({ active: false, x: 0, y: 0 }, []);
    };

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) start(); else stop();
      }
    }, { threshold: 0 });
    io.observe(wrapper);

    const onResize = () => { resize(); };
    window.addEventListener('resize', onResize);
    // Listen on the parent section, not the wrapper: the wrapper has
    // pointer-events: none (so clicks pass through to the hero content),
    // which means pointer events never fire on it.
    const host = wrapper.parentElement || wrapper;
    host.addEventListener('pointermove', onPointerMove);
    host.addEventListener('pointerleave', onPointerLeave);

    start();

    return () => {
      io.disconnect();
      window.removeEventListener('resize', onResize);
      host.removeEventListener('pointermove', onPointerMove);
      host.removeEventListener('pointerleave', onPointerLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="uf-hero__dots" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
};

/* ----------------------------- Hero ----------------------------- */

const Hero = ({ onBook }) => {
  return (
    <section className="uf-section uf-section--hero uf-hero" id="top">
      <HeroDotField />
      <div className="uf-container uf-hero__inner">
        <div>
          <Eyebrow dot pulse data-reveal style={{ ['--reveal-delay']: '0ms' }}>OPERATOR&apos;S ALLY · HOME SERVICES</Eyebrow>
          <h1 className="uf-hero__h" data-reveal style={{ ['--reveal-delay']: '220ms', ['--word-base']: '220ms' }}>
            {splitWords(<>Stop losing<br /><span className="mint">leads.</span></>)}
          </h1>
          <p className="uf-hero__sub" data-reveal style={{ ['--reveal-delay']: '640ms' }}>
            Websites, automations, and AI agents for home service businesses.
            Less drag. More momentum.
          </p>
          <div className="uf-hero__cta" data-reveal style={{ ['--reveal-delay']: '820ms' }}>
            <Btn variant="primary" size="lg" arrow onClick={onBook}>Book a call</Btn>
            <Btn variant="secondary" size="lg" onClick={() => {
              const el = document.getElementById('leak');
              if (el) window.scrollTo({ top: el.offsetTop - 64, behavior: 'smooth' });
            }}>See the leak</Btn>
            <span className="uf-hero__hint">30 min · no card · no pitch</span>
          </div>
        </div>
        <div data-reveal style={{ ['--reveal-delay']: '1000ms' }}>
          <EventFeed />
        </div>
      </div>
    </section>
  );
};

Object.assign(window, { Mark, Wordmark, Eyebrow, Btn, Nav, Hero, HeroDotField, EventFeed, RevealController, splitWords });
