/* global React */
const { useState: useStatePr, useEffect: useEffectPr } = React;

/* ----------------------------- Primitives ----------------------------- */

const Mark = ({ size = 28 }) => (
  <img src="assets/logo-mark-mint.png" alt="Upframe" style={{ width: size, height: size, display: 'block' }} draggable="false" />
);

const Wordmark = () => (
  <span className="uf-nav__wm"><span className="up">up</span><span className="fr">frame</span></span>
);

const Eyebrow = ({ children, amber, dot, pulse }) => (
  <span className={"uf-eyebrow" + (amber ? " uf-eyebrow--amber" : "")}>
    {dot && <span className={"uf-eyebrow__dot" + (pulse ? " pulse" : "")} />}{children}
  </span>
);

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
        <img src="assets/logo-text.png" alt="Upframe AI" className="uf-nav__logo" draggable="false" />
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

/* ----------------------------- Hero ----------------------------- */

const Hero = ({ onBook }) => {
  return (
    <section className="uf-section uf-section--hero uf-hero" id="top">
      <div className="uf-dotgrid uf-dotgrid--steel" />
      <div className="uf-container uf-hero__inner">
        <div>
          <Eyebrow dot pulse>OPERATOR&apos;S ALLY · HOME SERVICES</Eyebrow>
          <h1 className="uf-hero__h">Stop losing<br /><span className="mint">leads.</span></h1>
          <p className="uf-hero__sub">
            Websites, automations, and AI agents for home service businesses.
            Less drag. More momentum.
          </p>
          <div className="uf-hero__cta">
            <Btn variant="primary" size="lg" arrow onClick={onBook}>Book a call</Btn>
            <Btn variant="secondary" size="lg" onClick={() => {
              const el = document.getElementById('leak');
              if (el) window.scrollTo({ top: el.offsetTop - 64, behavior: 'smooth' });
            }}>See the leak</Btn>
            <span className="uf-hero__hint">30 min · no card · no pitch</span>
          </div>
        </div>
        <EventFeed />
      </div>
    </section>
  );
};

Object.assign(window, { Mark, Wordmark, Eyebrow, Btn, Nav, Hero, EventFeed });
