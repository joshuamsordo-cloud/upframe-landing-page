/* global React */
const { useState: useStateTl, useEffect: useEffectTl } = React;

const STEPS = [
  { day: 1,  lbl: '15-minute call', h: 'Discovery call', d: "We map the leaks — missed calls, late quotes, dead reviews — and put a number on each. No pitch deck. If the math doesn't move, we'll tell you.", meta: 'DAY 1 · 15 MIN · FREE' },
  { day: 3,  lbl: 'Scope locked',   h: 'Scope locked, plan approved', d: 'Fixed deliverables. Fixed timeline. Fixed price. No retainer talk until something is live and earning.', meta: 'DAY 3 · WRITTEN SCOPE' },
  { day: 14, lbl: 'Service running', h: 'Service is complete and running', d: 'Site, automations, or agent — built, tested, and live in two weeks. You stay on the tools.', meta: 'DAY 14 · LIVE' },
  { day: 30, lbl: 'First returns',  h: 'Most clients see returns by week 4', d: "Booked jobs, reviews coming in, evenings back. The number on the calculator above starts moving the other way.", meta: 'DAY 30 · ROI ARRIVES' },
  { day: 45, lbl: 'Systems compound', h: 'Business runs on systems', d: "Voice agent answering after-hours. Quotes following up themselves. You're focused on growth, not admin.", meta: 'DAY 45 · COMPOUNDING' },
];

const STAGE_MS = 3200;       // dwell per stage
const HOLD_LAST_MS = 1500;   // extra pause at the final stage before looping
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

  const fillPct = STEPS.length > 1 ? (stageIdx / (STEPS.length - 1)) * 100 : 0;
  const current = STEPS[stageIdx];

  return (
    <section className="uf-section" id="process">
      <div className="uf-container" style={{ position: 'relative' }}>
        <div className="uf-sech">
          <Eyebrow data-reveal style={{ ['--reveal-delay']: '0ms' }}>OUR PROCESS</Eyebrow>
          <h2 className="uf-sech__h" data-reveal style={{ ['--reveal-delay']: '80ms', ['--word-base']: '80ms' }}>
            {splitWords(<>From first call <span className="mint">to running systems.</span></>)}
          </h2>
          <p className="uf-sech__sub" data-reveal style={{ ['--reveal-delay']: '240ms' }}>Auto-advances through each stage. Click any node to jump back.</p>
        </div>

        <div className="uf-timeline" data-reveal style={{ ['--reveal-delay']: '320ms' }}>
          <div className={"uf-timeline__autohint " + (paused ? '' : 'live')}>
            <span className="dot" />
            {paused ? 'PAUSED · RESUMES IN A FEW' : 'AUTO'}
          </div>

          <div className="uf-timeline__track">
            <div className="uf-timeline__fill" style={{ width: fillPct + '%' }} />

            {STEPS.map((s, i) => {
              const pct = STEPS.length > 1 ? (i / (STEPS.length - 1)) * 100 : 0;
              const reached = i <= stageIdx;
              const active = i === stageIdx;
              return (
                <React.Fragment key={s.day}>
                  <button
                    type="button"
                    className={"uf-timeline__node " + (reached ? 'reached ' : '') + (active ? 'active' : '')}
                    style={{ left: pct + '%' }}
                    onClick={() => jumpTo(i)}
                    aria-label={`Go to ${s.lbl}`}
                  />
                  <div className={"uf-timeline__caption " + (reached ? 'reached ' : '') + (active ? 'active' : '')}
                       style={{ left: pct + '%' }}>
                    <span className="day">DAY {s.day}</span>
                    <span className="lbl">{s.lbl}</span>
                  </div>
                </React.Fragment>
              );
            })}

            <div className="uf-timeline__handle" style={{ left: fillPct + '%' }} />
          </div>

          <div className="uf-timeline__panel">
            <div className="uf-timeline__panel-day">D{current.day}</div>
            <div>
              <div className="uf-timeline__panel-h">{current.h}</div>
              <div className="uf-timeline__panel-d">{current.d}</div>
            </div>
            <div className="uf-timeline__panel-meta">{current.meta}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { ProcessSection });
