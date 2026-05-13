/* global React */
const { useState: useStateCalc } = React;

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

  const fmt = (n) => '$' + Math.round(n).toLocaleString();

  return (
    <section className="uf-section uf-section--inset" id="calc">
      <div className="uf-container">
        <div className="uf-sech">
          <Eyebrow amber dot pulse>WHAT IT'S COSTING YOU</Eyebrow>
          <h2 className="uf-sech__h">Run the numbers <span className="amber">on your own week.</span></h2>
          <p className="uf-sech__sub">Most owners under-count by 2–3×. Drag the sliders honestly — then we'll talk.</p>
        </div>
        <div className="uf-calc">
          <div className="uf-calc__inputs">
            <div className="uf-field">
              <div className="uf-field__row">
                <span className="uf-field__lbl">Inbound calls / week</span>
                <span className="uf-field__val">{calls}<span className="unit">calls</span></span>
              </div>
              <input type="range" className="uf-slider" min="0" max="40" value={calls} onChange={e => setCalls(+e.target.value)} />
            </div>
            <div className="uf-field">
              <div className="uf-field__row">
                <span className="uf-field__lbl">Average job value</span>
                <span className="uf-field__val">${job}</span>
              </div>
              <input type="range" className="uf-slider" min="150" max="3000" step="50" value={job} onChange={e => setJob(+e.target.value)} />
            </div>
            <div className="uf-field">
              <div className="uf-field__row">
                <span className="uf-field__lbl">% of calls missed</span>
                <span className="uf-field__val">{missed}<span className="unit">%</span></span>
              </div>
              <input type="range" className="uf-slider" min="0" max="80" value={missed} onChange={e => setMissed(+e.target.value)} />
            </div>
            <div className="uf-field">
              <div className="uf-field__row">
                <span className="uf-field__lbl">Hours / week on admin</span>
                <span className="uf-field__val">{admin}<span className="unit">hrs</span></span>
              </div>
              <input type="range" className="uf-slider" min="0" max="40" value={admin} onChange={e => setAdmin(+e.target.value)} />
            </div>
          </div>

          <div className="uf-calc__out">
            <div>
              <div className="uf-calc__out-eyebrow"><span className="dot" />LEAKING PER MONTH</div>
              <div className="uf-calc__out-num">{fmt(total)}<span className="unit">/mo</span></div>
              <div className="uf-calc__out-desc">
                Doesn't count slow quotes, un-asked reviews, or referrals lost to a brochure-grade site. The real number is usually higher.
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
