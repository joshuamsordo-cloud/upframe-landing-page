/* global React */
const { useState: useStateLeak, useEffect: useEffectLeak } = React;

/* ============================ Leak Pipes ============================
   Two horizontal pipes. Top is cracked — orbs leak out at each crack.
   Bottom is sealed — orbs flow through into a "Booked" bucket.
   Loops every LOOP_MS for a fresh demo cycle.
   ===================================================================== */

const LOOP_MS = 18000;
const SPAWN_MS = 900;
const TRAVEL_MS = 5400;             // time for an orb to cross the pipe
const FALL_MS = 900;                // leak fall duration
const CRACK_POS = [0.28, 0.52, 0.76];
const LEAK_PROB = [0.55, 0.55, 0.6];
const ORB_VALUE = 240;

// SVG canvas constants
const W = 640, H = 220;
const PIPE_H = 36;
const TOP_Y = 30, BOT_Y = 130;
const X0 = 36, X1 = W - 60;
const PIPE_LEN = X1 - X0;
const BUCKET_X = X1 + 4;

function LeakPipes() {
  const [frame, setFrame] = useStateLeak({
    elapsed: 0,
    orbs: [],
    lost: 0,
    booked: 0,
  });

  useEffectLeak(() => {
    let raf;
    let start = null;
    let lastSpawn = 0;
    let nextId = 1;
    let orbs = [];
    let lost = 0, booked = 0;

    const tick = (now) => {
      if (start == null) start = now;
      let elapsed = now - start;

      if (elapsed >= LOOP_MS) {
        start = now;
        elapsed = 0;
        lastSpawn = 0;
        orbs = [];
        lost = 0;
        booked = 0;
      }

      if (elapsed - lastSpawn >= SPAWN_MS) {
        lastSpawn = elapsed;
        let leakIdx = -1;
        for (let i = 0; i < CRACK_POS.length; i++) {
          if (Math.random() < LEAK_PROB[i]) { leakIdx = i; break; }
        }
        orbs.push({ id: nextId++, lane: 'top', born: elapsed, leakIdx });
        orbs.push({ id: nextId++, lane: 'bot', born: elapsed, leakIdx: -1 });
      }

      orbs = orbs.filter(o => {
        const age = elapsed - o.born;
        if (o.lane === 'top') {
          if (o.leakIdx >= 0) {
            const leakAt = CRACK_POS[o.leakIdx] * TRAVEL_MS;
            if (age >= leakAt + FALL_MS) {
              if (!o.counted) { lost += ORB_VALUE; o.counted = true; }
              return false;
            }
          } else if (age >= TRAVEL_MS) {
            if (!o.counted) { lost += ORB_VALUE; o.counted = true; }
            return false;
          }
        } else if (age >= TRAVEL_MS) {
          if (!o.counted) { booked += ORB_VALUE; o.counted = true; }
          return false;
        }
        return true;
      });

      // snapshot for render — slice to a fresh array so React sees a new ref
      setFrame({ elapsed, orbs: orbs.slice(), lost, booked });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const { elapsed, orbs, lost, booked } = frame;

  const renderOrb = (o) => {
    const age = elapsed - o.born;
    if (age < 0) return null;
    const isTop = o.lane === 'top';
    const pipeY = isTop ? TOP_Y + PIPE_H / 2 : BOT_Y + PIPE_H / 2;
    let x, y, opacity = 1, fall = 0;

    if (isTop && o.leakIdx >= 0) {
      const leakAt = CRACK_POS[o.leakIdx] * TRAVEL_MS;
      if (age < leakAt) {
        x = X0 + (age / TRAVEL_MS) * PIPE_LEN;
        y = pipeY;
      } else {
        const fallT = (age - leakAt) / FALL_MS;
        x = X0 + CRACK_POS[o.leakIdx] * PIPE_LEN;
        y = pipeY + fallT * 60;
        opacity = Math.max(0, 1 - fallT);
        fall = fallT;
      }
    } else {
      const t = Math.min(1, age / TRAVEL_MS);
      x = X0 + t * PIPE_LEN;
      y = pipeY;
    }

    const fill = isTop ? 'rgba(245,165,36,0.95)' : 'var(--mint)';
    const glow = isTop ? 'rgba(245,165,36,0.35)' : 'rgba(134,239,172,0.45)';

    return (
      <g key={o.id} style={{ opacity }}>
        <circle cx={x} cy={y} r="9" fill={glow} />
        <circle cx={x} cy={y} r="5" fill={fill} />
        {fall > 0 && (
          <text x={x + 12} y={y + 4} className="uf-pipe__leakLbl">−${ORB_VALUE}</text>
        )}
      </g>
    );
  };

  const lostStr   = '−$' + lost.toLocaleString();
  const bookedStr = '+$' + booked.toLocaleString();
  const cycleSec  = Math.max(0, Math.ceil((LOOP_MS - elapsed) / 1000));

  return (
    <div className="uf-pipes">
      <div className="uf-pipes__head">
        <div className="uf-pipes__legend">
          <div className="uf-pipes__legend-item"><span className="dot amber" />Without Upframe</div>
          <div className="uf-pipes__legend-item"><span className="dot mint" />With Upframe</div>
        </div>
        <div className="uf-pipes__cycle">Cycle resets in&nbsp;<span className="now">{cycleSec}s</span></div>
      </div>

      <div className="uf-pipes__stage">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" className="uf-pipes__svg">
          <defs>
            <linearGradient id="uf-pipe-amber" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%"   stopColor="rgba(245,165,36,0.15)" />
              <stop offset="100%" stopColor="rgba(245,165,36,0.04)" />
            </linearGradient>
            <linearGradient id="uf-pipe-mint" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%"   stopColor="rgba(134,239,172,0.18)" />
              <stop offset="100%" stopColor="rgba(134,239,172,0.08)" />
            </linearGradient>
          </defs>

          {/* TOP — leaky pipe */}
          <rect x={X0} y={TOP_Y} width={PIPE_LEN} height={PIPE_H} rx="14"
                fill="url(#uf-pipe-amber)" stroke="rgba(245,165,36,0.55)" strokeWidth="1" />
          {CRACK_POS.map((c, i) => {
            const cx = X0 + c * PIPE_LEN;
            return (
              <g key={'c' + i}>
                <path d={`M${cx - 7} ${TOP_Y + PIPE_H} l3 6 l-2 5 l5 -3 l-2 -8 z`}
                      fill="rgba(245,165,36,0.6)" stroke="var(--amber)" strokeWidth="0.8" />
                <line x1={cx - 4} y1={TOP_Y + PIPE_H - 6} x2={cx + 4} y2={TOP_Y + PIPE_H + 4}
                      stroke="var(--amber)" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
              </g>
            );
          })}
          <rect x={BUCKET_X} y={TOP_Y - 4} width="46" height={PIPE_H + 8} rx="6"
                fill="rgba(58,58,58,0.4)" stroke="var(--steel-2)" strokeWidth="1" />
          <text x={BUCKET_X + 23} y={TOP_Y + PIPE_H / 2 + 4} textAnchor="middle"
                className="uf-pipe__bucketLbl uf-pipe__bucketLbl--lost">LOST</text>

          {/* BOTTOM — sealed pipe */}
          <rect x={X0} y={BOT_Y} width={PIPE_LEN} height={PIPE_H} rx="14"
                fill="url(#uf-pipe-mint)" stroke="rgba(134,239,172,0.55)" strokeWidth="1" />
          <rect x={BUCKET_X} y={BOT_Y - 4} width="46" height={PIPE_H + 8} rx="6"
                fill="rgba(134,239,172,0.10)" stroke="var(--mint)" strokeWidth="1" />
          <text x={BUCKET_X + 23} y={BOT_Y + PIPE_H / 2 + 4} textAnchor="middle"
                className="uf-pipe__bucketLbl uf-pipe__bucketLbl--booked">BOOKED</text>

          {/* lane labels */}
          <text x={X0} y={TOP_Y - 10} className="uf-pipe__laneLbl uf-pipe__laneLbl--amber">WITHOUT · same lead</text>
          <text x={X0} y={BOT_Y - 10} className="uf-pipe__laneLbl uf-pipe__laneLbl--mint">WITH · same lead</text>

          {/* orbs */}
          {orbs.map(renderOrb)}
        </svg>
      </div>

      <div className="uf-pipes__counters">
        <div className="uf-pipes__counter uf-pipes__counter--lost">
          <span className="lbl">Walked away</span>
          <span className="val">{lostStr}</span>
        </div>
        <div className="uf-pipes__counter uf-pipes__counter--booked">
          <span className="lbl">Booked</span>
          <span className="val">{bookedStr}</span>
        </div>
      </div>

      <div className="uf-pipes__close">
        <div className="uf-pipes__closeTxt">
          These are the averages. Your numbers are <span className="amber">probably worse</span>. <span className="mint">↓ Run yours.</span>
        </div>
        <div className="uf-pipes__loop">Loop · 18s</div>
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
        <LeakPipes />
      </div>
    </section>
  );
}

Object.assign(window, { LeakPipes, TheLeakSection });
