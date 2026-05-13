/* global React */

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

const Btn = ({ variant = 'primary', size, arrow, children, onClick, type }) => (
  <button type={type || 'button'} className={`uf-btn uf-btn--${variant}${size ? ' uf-btn--' + size : ''}`} onClick={onClick}>
    {children}{arrow && <span className="uf-arrow">{arrow}</span>}
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
        <Mark size={26} />
        <Wordmark />
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
        <Btn variant="primary" arrow="↗" onClick={onBook}>Book a call</Btn>
      </div>
    </nav>
  );
};

/* ----------------------------- Hero ----------------------------- */

const Hero = ({ onBook }) => {
  const events = [
    { time: '02:14', what: <span>Voice agent booked <span className="muted">· clogged drain</span></span>, val: '+$480', cls: '' },
    { time: '02:09', what: <span>Quote follow-up sent <span className="muted">· #4421</span></span>, val: '+5 min', cls: '' },
    { time: '02:03', what: <span>Review request <span className="muted">· Halcomb HVAC</span></span>, val: '★ 5.0', cls: '' },
    { time: '01:58', what: <span>Missed call <span className="muted">· no system</span></span>, val: '−$640', cls: 'amber' },
    { time: '01:51', what: <span>Inbound chat → quote <span className="muted">· auto</span></span>, val: '+$1.2k', cls: '' },
  ];
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
            <Btn variant="primary" size="lg" arrow="↗" onClick={onBook}>Book a call</Btn>
            <Btn variant="secondary" size="lg" onClick={() => {
              const el = document.getElementById('leak');
              if (el) window.scrollTo({ top: el.offsetTop - 64, behavior: 'smooth' });
            }}>See the leak</Btn>
            <span className="uf-hero__hint">30 min · no card · no pitch</span>
          </div>
        </div>
        <div className="uf-tick">
          <div className="uf-tick__head">
            <span className="uf-tick__title">Live · today</span>
            <span className="uf-tick__live"><span className="uf-tick__dot" />Booking</span>
          </div>
          {events.map((e, i) => (
            <div className="uf-tick__row" key={i}>
              <span className="uf-tick__time">{e.time}</span>
              <span className="uf-tick__what">{e.what}</span>
              <span className={"uf-tick__val " + e.cls}>{e.val}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

Object.assign(window, { Mark, Wordmark, Eyebrow, Btn, Nav, Hero });
