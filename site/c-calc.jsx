/* global React */
const { useState: useStateCalc, useEffect: useEffectCalc } = React;

function ROISection({ onBook }) {
  const [calls, setCalls] = useStateCalc(8);
  const [job, setJob] = useStateCalc(500);
  const [missed, setMissed] = useStateCalc(35); // %
  const [admin, setAdmin] = useStateCalc(10);

  const missedCallsPerWk = Math.round(calls * (missed / 100) * 10) / 10;
  const leadValue = job * 0.4; // not every missed call converts; conservative
  const lostLeadsMonthly = missedCallsPerWk * 4 * leadValue;
  const adminCost = admin * 4 * 35; // 35/hr opportunity
  const total = Math.round(lostLeadsMonthly + adminCost);

  const [flash, setFlash] = useStateCalc(false);
  useEffectCalc(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 380);
    return () => clearTimeout(t);
  }, [total]);

  const fmt = (n) => '$' + Math.round(n).toLocaleString();

  return (
    <section className="uf-section uf-section--inset" id="calc">
      <div className="uf-container">
        <div className="uf-sech">
          <Eyebrow amber dot pulse data-reveal style={{ ['--reveal-delay']: '0ms' }}>WHAT IT&apos;S COSTING YOU</Eyebrow>
          <div className="uf-calc__ticker" aria-hidden="true">
            <div className="uf-calc__ticker-track">
              <span>avg. $2,400 lost / mo</span>
              <span className="uf-calc__ticker-sep">·</span>
              <span>1 in 3 calls unanswered</span>
              <span className="uf-calc__ticker-sep">·</span>
              <span>10 hrs / wk on admin</span>
              <span className="uf-calc__ticker-sep">·</span>
              <span>avg. $2,400 lost / mo</span>
              <span className="uf-calc__ticker-sep">·</span>
              <span>1 in 3 calls unanswered</span>
              <span className="uf-calc__ticker-sep">·</span>
              <span>10 hrs / wk on admin</span>
            </div>
          </div>
          <h2 className="uf-sech__h" data-reveal style={{ ['--reveal-delay']: '80ms', ['--word-base']: '80ms' }}>
            {splitWords(<>Run the numbers <span className="amber">on your week.</span></>)}
          </h2>
          <p className="uf-sech__sub" data-reveal style={{ ['--reveal-delay']: '240ms' }}>This is what your competitors are quietly stealing while you&apos;re busy.</p>
        </div>
        <div className="uf-calc" data-reveal style={{ ['--reveal-delay']: '320ms' }}>
          <div className="uf-calc__inputs">
            <div className="uf-field">
              <div className="uf-field__row">
                <span className="uf-field__lbl">Inbound calls / week</span>
                <span className="uf-field__val">{calls}<span className="unit">calls</span></span>
              </div>
              <input type="range" className="uf-slider" min="0" max="40" value={calls} onChange={e => setCalls(+e.target.value)} style={{ '--pct': `${(calls / 40) * 100}%` }} />
            </div>
            <div className="uf-field">
              <div className="uf-field__row">
                <span className="uf-field__lbl">Average job value</span>
                <span className="uf-field__val">${job}</span>
              </div>
              <input type="range" className="uf-slider" min="150" max="3000" step="50" value={job} onChange={e => setJob(+e.target.value)} style={{ '--pct': `${((job - 150) / (3000 - 150)) * 100}%` }} />
            </div>
            <div className="uf-field">
              <div className="uf-field__row">
                <span className="uf-field__lbl">% of calls missed</span>
                <span className="uf-field__val">{missed}<span className="unit">%</span></span>
              </div>
              <input type="range" className="uf-slider" min="0" max="80" value={missed} onChange={e => setMissed(+e.target.value)} style={{ '--pct': `${(missed / 80) * 100}%` }} />
            </div>
            <div className="uf-field">
              <div className="uf-field__row">
                <span className="uf-field__lbl">Hours / week on admin</span>
                <span className="uf-field__val">{admin}<span className="unit">hrs</span></span>
              </div>
              <input type="range" className="uf-slider" min="0" max="40" value={admin} onChange={e => setAdmin(+e.target.value)} style={{ '--pct': `${(admin / 40) * 100}%` }} />
            </div>
          </div>

          <div className="uf-calc__out">
            <div>
              <div className="uf-calc__out-eyebrow"><span className="dot" />LEAKING PER MONTH</div>
              <div className={`uf-calc__out-num${flash ? ' uf-calc__out-num--flash' : ''}`}>{fmt(total)}<span className="unit">/mo</span></div>
              <div className="uf-calc__out-desc">
                Doesn&apos;t count slow quotes, un-asked reviews, or referrals lost to a brochure-grade site. The real number is usually higher.
              </div>
              <div className="uf-calc__out-breakdown">
                <div className="uf-calc__bd-item">
                  <span className="uf-calc__bd-lbl">Missed-lead value</span>
                  <span className="uf-calc__bd-val">{fmt(lostLeadsMonthly)}</span>
                </div>
                <div className="uf-calc__bd-item">
                  <span className="uf-calc__bd-lbl">Admin time cost</span>
                  <span className="uf-calc__bd-val">{fmt(adminCost)}</span>
                </div>
              </div>
            </div>
            <div className="uf-calc__out-cta">
              <Btn variant="urgent" size="lg" arrow="↓" onClick={onBook}>Stop the leak</Btn>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { ROISection });
