/* global React */
const { useState: useStateTl, useEffect: useEffectTl, useRef: useRefTl } = React;

const STEPS = [
  { day: 1,  lbl: '15-minute call', h: 'Discovery call', d: "We map the leaks — missed calls, late quotes, dead reviews — and put a number on each. No pitch deck. If the math doesn't move, we'll tell you.", meta: 'DAY 1 · 15 MIN · FREE' },
  { day: 3,  lbl: 'Scope locked',   h: 'Scope locked, plan approved', d: 'Fixed deliverables. Fixed timeline. Fixed price. No retainer talk until something is live and earning.', meta: 'DAY 3 · WRITTEN SCOPE' },
  { day: 14, lbl: 'Service running', h: 'Service is complete and running', d: 'Site, automations, or agent — built, tested, and live in two weeks. You stay on the tools.', meta: 'DAY 14 · LIVE' },
  { day: 30, lbl: 'First returns',  h: 'Most clients see returns by week 4', d: "Booked jobs, reviews coming in, evenings back. The number on the calculator above starts moving the other way.", meta: 'DAY 30 · ROI ARRIVES' },
  { day: 45, lbl: 'Systems compound', h: 'Business runs on systems', d: "Voice agent answering after-hours. Quotes following up themselves. You're focused on growth, not admin.", meta: 'DAY 45 · COMPOUNDING' },
];

function ProcessSection() {
  const [day, setDay] = useStateTl(1);   // current chosen day along timeline
  const [auto, setAuto] = useStateTl(true);
  const trackRef = useRefTl(null);
  const draggingRef = useRefTl(false);
  const interactedRef = useRefTl(false);

  // auto-advance loop
  useEffectTl(() => {
    if (!auto) return;
    let raf;
    let last = performance.now();
    const tick = (now) => {
      const dt = now - last; last = now;
      setDay(d => {
        // advance ~1 day per 600ms; wrap around
        const next = d + dt / 600;
        if (next > 45) return 1;
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [auto]);

  const dayToPct = (d) => Math.max(0, Math.min(1, (d - 1) / 44));
  const pctToDay = (p) => 1 + p * 44;

  const onPointerDown = (e) => {
    draggingRef.current = true;
    interactedRef.current = true;
    setAuto(false);
    handlePointer(e);
    e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => { if (draggingRef.current) handlePointer(e); };
  const onPointerUp = () => { draggingRef.current = false; };

  const handlePointer = (e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    setDay(pctToDay(x));
  };

  // resume auto after 6s of no interaction
  useEffectTl(() => {
    if (auto) return;
    const t = setTimeout(() => { setAuto(true); interactedRef.current = false; }, 6000);
    return () => clearTimeout(t);
  }, [auto, day]);

  const currentIdx = (() => {
    // last step whose day <= current
    let idx = 0;
    for (let i = 0; i < STEPS.length; i++) if (STEPS[i].day <= day + 0.5) idx = i;
    return idx;
  })();
  const current = STEPS[currentIdx];

  const fillPct = dayToPct(day) * 100;

  return (
    <section className="uf-section" id="process">
      <div className="uf-container" style={{ position: 'relative' }}>
        <div className="uf-sech">
          <Eyebrow>HOW IT GOES</Eyebrow>
          <h2 className="uf-sech__h">From first call <span className="mint">to running systems.</span></h2>
          <p className="uf-sech__sub">Drag the handle, or let it run. No handover at the end — we build, run, and tune.</p>
        </div>

        <div className="uf-timeline">
          <div className={"uf-timeline__autohint " + (auto ? 'live' : '')}>
            <span className="dot" />
            {auto ? 'AUTO · DRAG TO PAUSE' : 'PAUSED · RESUMES IN A FEW'}
          </div>

          <div className="uf-timeline__track" ref={trackRef}
               onPointerDown={onPointerDown}
               onPointerMove={onPointerMove}
               onPointerUp={onPointerUp}
               onPointerCancel={onPointerUp}>
            <div className="uf-timeline__fill" style={{ width: fillPct + '%' }} />

            {STEPS.map((s, i) => {
              const pct = dayToPct(s.day) * 100;
              const reached = s.day <= day + 0.5;
              const active = i === currentIdx;
              return (
                <React.Fragment key={s.day}>
                  <div
                    className={"uf-timeline__node " + (reached ? 'reached ' : '') + (active ? 'active' : '')}
                    style={{ left: pct + '%' }}
                    onClick={(e) => { e.stopPropagation(); setAuto(false); setDay(s.day); }}
                  />
                  <div className={"uf-timeline__caption " + (reached ? 'reached ' : '') + (active ? 'active' : '')}
                       style={{ left: pct + '%' }}>
                    <span className="day">DAY {s.day}</span>
                    <span className="lbl">{s.lbl}</span>
                  </div>
                </React.Fragment>
              );
            })}

            <div className={"uf-timeline__handle" + (draggingRef.current ? ' dragging' : '')}
                 style={{ left: fillPct + '%' }} />
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
