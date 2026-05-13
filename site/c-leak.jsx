/* global React */
const { useState: useStateLeak, useEffect: useEffectLeak, useRef: useRefLeak } = React;

/* ============================ Quote Race ============================
   15-second loop. Two lanes:
   - top (without): lead enters, sits, drifts, absorbed by competitor
   - bottom (with): agent → qualified → quote → booked → review
   ===================================================================== */

const RACE_LEN_MS = 15000;

const TOP_NODES = ['Phone', 'Voicemail', 'Waiting', 'Drifts', 'Lost'];
const BOT_NODES = ['Agent', 'Qualified', 'Quote sent', 'Booked', 'Review'];

// Pacing (0..1 progress along the track) at which each node fires
const TOP_HITS = [0.06, 0.20, 0.45, 0.70, 0.92];
const BOT_HITS = [0.06, 0.22, 0.40, 0.60, 0.82];

function QuoteRace() {
  const [t, setT] = useStateLeak(0); // 0..1
  const rafRef = useRefLeak(0);
  const startRef = useRefLeak(null);

  useEffectLeak(() => {
    const loop = (now) => {
      if (startRef.current == null) startRef.current = now;
      const elapsed = (now - startRef.current) % RACE_LEN_MS;
      setT(elapsed / RACE_LEN_MS);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  // Top lane position: lead starts moving but stalls at "Waiting" (~0.30..0.55), then drifts to "Lost"
  const topX = (() => {
    if (t < 0.20) return t * (0.30 / 0.20);            // 0 → 0.30
    if (t < 0.55) return 0.30 + (t - 0.20) * 0.10;     // slow drift 0.30 → 0.335
    if (t < 0.92) return 0.335 + (t - 0.55) * (0.65 / 0.37); // 0.335 → ~1.0
    return 1.0;
  })();
  const topLeadCls = t < 0.92 ? (t < 0.55 ? 'amber' : 'amber') : 'lost';

  // Bottom lane: snappy progression through 5 nodes
  const botX = Math.min(1, t * 1.08);
  const botLeadCls = t < 0.06 ? '' : 'mint';

  // Lit/passed states per node
  const topLit = TOP_HITS.map(h => t >= h);
  const botLit = BOT_HITS.map(h => t >= h);

  // Counters at end of cycle
  const cyclesShown = 142; // arbitrary realistic-looking count
  const minutes = Math.floor(t * 8); // displayed seconds within race
  const seconds = Math.floor((t * 8 - minutes) * 60);
  const timeText = `00:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;

  // Lane outcomes
  const topAmount = t < 0.92 ? '— in progress' : '−$540 walked';
  const botAmount = t < 0.82 ? '— in progress' : '+$480 booked';

  return (
    <div className="uf-race">
      <div className="uf-race__head">
        <div className="uf-race__legend">
          <div className="uf-race__legend-item"><span className="dot amber" />Without Upframe</div>
          <div className="uf-race__legend-item"><span className="dot mint" />With Upframe</div>
        </div>
        <div className="uf-race__time">Elapsed&nbsp;<span className="now">{timeText}</span></div>
      </div>

      <div className="uf-race__lanes">
        {/* Top lane — without */}
        <div className="uf-lane">
          <div className="uf-lane__label">
            <span className="uf-lane__lbl amber">Without · same lead</span>
            <span className={"uf-lane__out " + (t >= 0.92 ? 'uf-lane__out--lost' : '')}>{topAmount}</span>
          </div>
          <div className="uf-lane__track">
            <div className="uf-lane__nodes">
              {TOP_NODES.map((n, i) => (
                <div key={n} className={"uf-node " + (topLit[i] ? (i === TOP_NODES.length - 1 ? 'miss' : 'passed') : '')}>
                  <span className="uf-node__pill"><span className="dot" />{n}</span>
                </div>
              ))}
            </div>
            <div className={"uf-lead " + topLeadCls} style={{ left: `${topX * 100}%` }} />
          </div>
        </div>

        {/* Bottom lane — with */}
        <div className="uf-lane">
          <div className="uf-lane__label">
            <span className="uf-lane__lbl mint">With · same lead</span>
            <span className={"uf-lane__out " + (t >= 0.82 ? 'uf-lane__out--won' : '')}>{botAmount}</span>
          </div>
          <div className="uf-lane__track">
            <div className="uf-lane__nodes">
              {BOT_NODES.map((n, i) => (
                <div key={n} className={"uf-node " + (botLit[i] ? 'lit' : '')}>
                  <span className="uf-node__pill"><span className="dot" />{n}</span>
                </div>
              ))}
            </div>
            <div className={"uf-lead " + botLeadCls} style={{ left: `${botX * 100}%` }} />
          </div>
        </div>
      </div>

      <div className="uf-race__close">
        <div className="uf-race__closeTxt">
          These are the averages. Your numbers are <span className="amber">probably worse</span>. <span className="mint">↓ Run yours.</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--cloud-3)' }}>
          Loop · 15s
        </div>
      </div>
    </div>
  );
}

function TheLeakSection() {
  return (
    <section className="uf-section" id="leak">
      <div className="uf-container">
        <div className="uf-sech">
          <Eyebrow dot>THE LEAK</Eyebrow>
          <h2 className="uf-sech__h">Same lead. <span className="mint">Two outcomes.</span></h2>
          <p className="uf-sech__sub">Every week without systems is a week your competitors are pulling ahead. The gap compounds.</p>
        </div>
        <QuoteRace />
      </div>
    </section>
  );
}

Object.assign(window, { QuoteRace, TheLeakSection });
