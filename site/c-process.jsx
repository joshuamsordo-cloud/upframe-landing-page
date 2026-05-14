/* global React */
const { useState: useStateTl, useEffect: useEffectTl } = React;

const IconPhone = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);

const IconDocCheck = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
    <path d="M14 3v5h5" />
    <path d="M9 14l2.2 2.2L16 11.5" />
  </svg>
);

const IconPlay = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="9" />
    <path d="M10 8.5v7l6-3.5z" />
  </svg>
);

const IconTrendUp = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M14 7h7v7" />
  </svg>
);

const IconInfinity = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6.5 16.5a4.5 4.5 0 1 1 0-9c2.5 0 4 2 5.5 4.5s3 4.5 5.5 4.5a4.5 4.5 0 1 0 0-9c-2.5 0-4 2-5.5 4.5" />
  </svg>
);

const STEPS = [
  { day: 1,  lbl: '15-minute call',   icon: <IconPhone />,    d: "We map the leaks — missed calls, late quotes, dead reviews — and put a number on each. No pitch deck. If the math doesn't move, we'll tell you." },
  { day: 3,  lbl: 'Scope locked',     icon: <IconDocCheck />, d: 'Fixed deliverables. Fixed timeline. Fixed price. No retainer talk until something is live and earning.' },
  { day: 14, lbl: 'Service running',  icon: <IconPlay />,     d: 'Site, automations, or agent — built, tested, and live in two weeks. You stay on the tools.' },
  { day: 30, lbl: 'First returns',    icon: <IconTrendUp />,  d: "Booked jobs, reviews coming in, evenings back. The number on the calculator above starts moving the other way." },
  { day: 45, lbl: 'Systems compound', icon: <IconInfinity />, d: "Voice agent answering after-hours. Quotes following up themselves. You're focused on growth, not admin." },
];

const STAGE_MS = 2500;
const HOLD_LAST_MS = 1400;
const PAUSE_AFTER_CLICK_MS = 5000;

function ProcessSection() {
  const [stageIdx, setStageIdx] = useStateTl(0);
  const [paused, setPaused] = useStateTl(false);

  useEffectTl(() => {
    if (paused) return;
    const dwell = stageIdx === STEPS.length - 1 ? STAGE_MS + HOLD_LAST_MS : STAGE_MS;
    const t = setTimeout(() => {
      setStageIdx(i => (i + 1) % STEPS.length);
    }, dwell);
    return () => clearTimeout(t);
  }, [paused, stageIdx]);

  useEffectTl(() => {
    if (!paused) return;
    const t = setTimeout(() => setPaused(false), PAUSE_AFTER_CLICK_MS);
    return () => clearTimeout(t);
  }, [paused]);

  const jumpTo = (i) => {
    setStageIdx(i);
    setPaused(true);
  };

  return (
    <section className="uf-section" id="process">
      <div className="uf-container" style={{ position: 'relative' }}>
        <div className="uf-sech">
          <Eyebrow data-reveal style={{ ['--reveal-delay']: '0ms' }}>OUR PROCESS</Eyebrow>
          <h2 className="uf-sech__h" data-reveal style={{ ['--reveal-delay']: '80ms', ['--word-base']: '80ms' }}>
            {splitWords(<>From first call <span className="mint">to running systems.</span></>)}
          </h2>
          <p className="uf-sech__sub" data-reveal style={{ ['--reveal-delay']: '240ms' }}>Auto-advances through each stage. Click any card to jump.</p>
        </div>

        <div className="uf-ptl" data-reveal style={{ ['--reveal-delay']: '320ms' }}>
          <div className="uf-ptl__rail" aria-hidden="true" />

          {STEPS.map((s, i) => {
            const side = i % 2 === 0 ? 'left' : 'right';
            const active = i === stageIdx;
            return (
              <div
                key={s.day}
                className={"uf-ptl__row uf-ptl__row--" + side + (active ? ' is-active' : '')}
              >
                <span className="uf-ptl__dot" aria-hidden="true" />
                <button
                  type="button"
                  className="uf-ptl__card"
                  onClick={() => jumpTo(i)}
                  aria-expanded={active}
                  aria-label={`Stage ${i + 1}: Day ${s.day}, ${s.lbl}`}
                >
                  <div className="uf-ptl__card-head">
                    <span className="uf-ptl__icon" aria-hidden="true">{s.icon}</span>
                    <div className="uf-ptl__titles">
                      <div className="uf-ptl__day">DAY {s.day}</div>
                      <div className="uf-ptl__title">{s.lbl}</div>
                    </div>
                  </div>
                  <div className="uf-ptl__body">
                    <div className="uf-ptl__body-inner">
                      <p className="uf-ptl__desc">{s.d}</p>
                    </div>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { ProcessSection });
