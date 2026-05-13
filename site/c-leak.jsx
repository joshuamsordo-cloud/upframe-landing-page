/* global React */
const { useState: useStateLeak, useEffect: useEffectLeak } = React;

/* ============================ Leak Pipes ============================
   Two horizontal pipes. Each carries a single lead through a sequence
   of stages on every loop cycle.

   Top lane (amber, "without Upframe"):
       Call → Voicemail → Drift → Lost

   Bottom lane (mint, "with Upframe"):
       Lead → Qualify → Quote → Booked → Review

   The orb dwells at each stage marker, then transits to the next.
   Cycle resets every LOOP_MS so the demo replays.
   ===================================================================== */

const LOOP_MS = 16000;
const TRANSIT_MS = 1500;
const DWELL_MS = 900;
const ORB_VALUE_LOST = 240;
const ORB_VALUE_BOOKED = 480;

// SVG canvas
const W = 720, H = 320;
const PIPE_H = 38;
const TOP_Y = 40;
const BOT_Y = 200;
const X0 = 60;
const X1 = W - 80;
const PIPE_LEN = X1 - X0;
const BUCKET_X = X1 + 6;

const STAGES_TOP = [
  { f: 0.06, label: 'Call',       sub: 'RINGING' },
  { f: 0.32, label: 'Voicemail',  sub: 'WAITING' },
  { f: 0.60, label: 'Drift',      sub: 'COOLING' },
  { f: 0.92, label: 'Lost',       sub: '−$240'   },
];

const STAGES_BOT = [
  { f: 0.05, label: 'Lead in',    sub: 'INBOUND' },
  { f: 0.26, label: 'Qualified',  sub: '9s'      },
  { f: 0.48, label: 'Quoted',     sub: '14s'     },
  { f: 0.72, label: 'Booked',     sub: '+$480'   },
  { f: 0.93, label: 'Review',     sub: '★ 5.0'   },
];

const CRACK_STAGES_TOP = [1, 2, 3]; // Voicemail, Drift, Lost

// Compute orb position along a stage list at time `t` (ms) within the cycle.
// Returns { x, stageIdx, atStage, exited }.
function computeOrbPos(stages, t) {
  const STEP = TRANSIT_MS + DWELL_MS;
  const totalActive = (stages.length - 1) * STEP + DWELL_MS;
  if (t >= totalActive) {
    return {
      f: stages[stages.length - 1].f,
      stageIdx: stages.length - 1,
      atStage: true,
      exited: true,
    };
  }
  const stepIdx = Math.min(stages.length - 1, Math.floor(t / STEP));
  const local = t - stepIdx * STEP;
  if (local < DWELL_MS || stepIdx >= stages.length - 1) {
    return { f: stages[stepIdx].f, stageIdx: stepIdx, atStage: true, exited: false };
  }
  const transitT = (local - DWELL_MS) / TRANSIT_MS;
  const eased = transitT < 0.5
    ? 2 * transitT * transitT
    : 1 - Math.pow(-2 * transitT + 2, 2) / 2;
  const f = stages[stepIdx].f + (stages[stepIdx + 1].f - stages[stepIdx].f) * eased;
  return { f, stageIdx: stepIdx, atStage: false, exited: false };
}

function xFor(f) { return X0 + f * PIPE_LEN; }

function StageChip({ x, y, label, sub, tone }) {
  const w = 84;
  const h = 30;
  const fill = tone === 'amber' ? 'rgba(245,165,36,0.06)' : 'rgba(134,239,172,0.06)';
  const stroke = tone === 'amber' ? 'rgba(245,165,36,0.45)' : 'rgba(134,239,172,0.45)';
  const labelFill = 'var(--cloud)';
  const subFill = tone === 'amber' ? 'var(--amber)' : 'var(--mint)';
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height={h} rx="8"
            fill={fill} stroke={stroke} strokeWidth="1" />
      <text x={x} y={y + 12} textAnchor="middle" className="uf-pipe__chipLbl"
            style={{ fill: labelFill }}>{label}</text>
      <text x={x} y={y + 24} textAnchor="middle" className="uf-pipe__chipSub"
            style={{ fill: subFill }}>{sub}</text>
    </g>
  );
}

function EndCap({ x, pipeY, tone, side }) {
  const flangeW = 12;
  const flangeH = PIPE_H + 14;
  const flangeY = pipeY - 7;
  const fx = side === 'left' ? x - flangeW : x;
  const stroke = tone === 'amber' ? 'rgba(245,165,36,0.55)' : 'rgba(134,239,172,0.55)';
  return (
    <g>
      <rect x={fx} y={flangeY} width={flangeW} height={flangeH} rx="3"
            fill="rgba(20,20,20,0.85)" stroke={stroke} strokeWidth="1" />
      <circle cx={fx + flangeW / 2} cy={flangeY + 5} r="1.6"
              fill="rgba(58,58,58,0.9)" stroke={stroke} strokeWidth="0.6" />
      <circle cx={fx + flangeW / 2} cy={flangeY + flangeH - 5} r="1.6"
              fill="rgba(58,58,58,0.9)" stroke={stroke} strokeWidth="0.6" />
    </g>
  );
}

function Crack({ cx, pipeY, severity }) {
  // Jagged tear along bottom edge of pipe. severity 1..3 widens the tear.
  const spread = 8 + severity * 4;
  const y = pipeY + PIPE_H;
  // Path traces the tear: start at left edge, jag down/up, close at right edge.
  const path = `
    M ${cx - spread} ${y - 1}
    l 2 3 l 1 -2 l 2 4 l 2 -3 l 1 5 l 2 -2 l 2 3 l 1 -4 l 2 2
    l ${Math.max(0, spread - 15)} 0
    l 0 -4
    Z
  `;
  return (
    <g className="uf-crack" style={{ ['--drip-delay']: `${severity * 0.4}s` }}>
      <path d={path} fill="var(--void)" stroke="rgba(245,165,36,0.7)" strokeWidth="1" />
      <path d={path} fill="none" stroke="rgba(0,0,0,0.6)" strokeWidth="0.6"
            transform={`translate(0.5 0.5)`} />
      <circle className="uf-drip uf-drip--1" cx={cx - 2} cy={y + 6} r="1.6"
              fill="rgba(245,165,36,0.85)" />
      <circle className="uf-drip uf-drip--2" cx={cx + 3} cy={y + 8} r="1.4"
              fill="rgba(245,165,36,0.75)" />
      <circle className="uf-drip uf-drip--3" cx={cx} cy={y + 5} r="1.2"
              fill="rgba(245,165,36,0.65)" />
    </g>
  );
}

function LeakPipes() {
  const [tick, setTick] = useStateLeak({
    elapsed: 0,
    cycles: 0,
  });

  useEffectLeak(() => {
    let raf;
    let start = null;
    let cycles = 0;
    const loop = (now) => {
      if (start == null) start = now;
      let elapsed = now - start;
      if (elapsed >= LOOP_MS) {
        cycles += 1;
        start = now;
        elapsed = 0;
      }
      setTick({ elapsed, cycles });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const { elapsed, cycles } = tick;

  const topPos = computeOrbPos(STAGES_TOP, elapsed);
  const botPos = computeOrbPos(STAGES_BOT, elapsed);

  const topX = xFor(topPos.f);
  const botX = xFor(botPos.f);
  const topOrbY = TOP_Y + PIPE_H / 2;
  const botOrbY = BOT_Y + PIPE_H / 2;

  // Counters tick after each full cycle.
  const lost   = cycles * ORB_VALUE_LOST;
  const booked = cycles * ORB_VALUE_BOOKED;
  const lostStr   = '−$' + lost.toLocaleString();
  const bookedStr = '+$' + booked.toLocaleString();
  const cycleSec  = Math.max(0, Math.ceil((LOOP_MS - elapsed) / 1000));

  // Highlight current stage chips with a subtle glow.
  const chipY_top = TOP_Y + PIPE_H + 18;
  const chipY_bot = BOT_Y + PIPE_H + 18;

  const onRunYours = () => {
    const el = document.getElementById('calc');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

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
            <linearGradient id="uf-pipe-amber-v" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%"   stopColor="rgba(245,165,36,0.04)" />
              <stop offset="35%"  stopColor="rgba(245,165,36,0.22)" />
              <stop offset="65%"  stopColor="rgba(245,165,36,0.16)" />
              <stop offset="100%" stopColor="rgba(245,165,36,0.02)" />
            </linearGradient>
            <linearGradient id="uf-pipe-mint-v" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%"   stopColor="rgba(134,239,172,0.05)" />
              <stop offset="35%"  stopColor="rgba(134,239,172,0.24)" />
              <stop offset="65%"  stopColor="rgba(134,239,172,0.18)" />
              <stop offset="100%" stopColor="rgba(134,239,172,0.04)" />
            </linearGradient>
            <linearGradient id="uf-pipe-hi" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.10)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <radialGradient id="uf-orb-amber" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%"   stopColor="rgba(255,200,100,1)" />
              <stop offset="60%"  stopColor="rgba(245,165,36,0.95)" />
              <stop offset="100%" stopColor="rgba(245,165,36,0.6)" />
            </radialGradient>
            <radialGradient id="uf-orb-mint" cx="0.5" cy="0.5" r="0.5">
              <stop offset="0%"   stopColor="rgba(200,255,220,1)" />
              <stop offset="60%"  stopColor="rgba(134,239,172,0.95)" />
              <stop offset="100%" stopColor="rgba(134,239,172,0.6)" />
            </radialGradient>
          </defs>

          {/* lane labels */}
          <text x={X0} y={TOP_Y - 14} className="uf-pipe__laneLbl uf-pipe__laneLbl--amber">WITHOUT · same lead</text>
          <text x={X0} y={BOT_Y - 14} className="uf-pipe__laneLbl uf-pipe__laneLbl--mint">WITH · same lead</text>

          {/* TOP — leaky pipe */}
          <g>
            <EndCap x={X0} pipeY={TOP_Y} tone="amber" side="left" />
            <EndCap x={X1} pipeY={TOP_Y} tone="amber" side="right" />
            <rect x={X0} y={TOP_Y} width={PIPE_LEN} height={PIPE_H} rx="12"
                  fill="url(#uf-pipe-amber-v)" stroke="rgba(245,165,36,0.55)" strokeWidth="1" />
            <rect x={X0 + 2} y={TOP_Y + 3} width={PIPE_LEN - 4} height={PIPE_H * 0.18} rx="3"
                  fill="url(#uf-pipe-hi)" />
            {/* cracks */}
            {CRACK_STAGES_TOP.map((si, i) => (
              <Crack key={'crack-' + si} cx={xFor(STAGES_TOP[si].f)} pipeY={TOP_Y} severity={i + 1} />
            ))}
            {/* bucket */}
            <rect x={BUCKET_X} y={TOP_Y - 4} width="56" height={PIPE_H + 8} rx="7"
                  fill="rgba(58,58,58,0.4)" stroke="var(--steel-2)" strokeWidth="1" />
            <text x={BUCKET_X + 28} y={TOP_Y + PIPE_H / 2 + 4} textAnchor="middle"
                  className="uf-pipe__bucketLbl uf-pipe__bucketLbl--lost">LOST</text>
          </g>

          {/* BOTTOM — sealed pipe */}
          <g>
            <EndCap x={X0} pipeY={BOT_Y} tone="mint" side="left" />
            <EndCap x={X1} pipeY={BOT_Y} tone="mint" side="right" />
            <rect x={X0} y={BOT_Y} width={PIPE_LEN} height={PIPE_H} rx="12"
                  fill="url(#uf-pipe-mint-v)" stroke="rgba(134,239,172,0.55)" strokeWidth="1" />
            <rect x={X0 + 2} y={BOT_Y + 3} width={PIPE_LEN - 4} height={PIPE_H * 0.18} rx="3"
                  fill="url(#uf-pipe-hi)" />
            {/* bucket */}
            <rect x={BUCKET_X} y={BOT_Y - 4} width="56" height={PIPE_H + 8} rx="7"
                  fill="rgba(134,239,172,0.10)" stroke="var(--mint)" strokeWidth="1" />
            <text x={BUCKET_X + 28} y={BOT_Y + PIPE_H / 2 + 4} textAnchor="middle"
                  className="uf-pipe__bucketLbl uf-pipe__bucketLbl--booked">BOOKED</text>
          </g>

          {/* Stage markers + chips — top */}
          {STAGES_TOP.map((s, i) => {
            const x = xFor(s.f);
            const active = i === topPos.stageIdx;
            return (
              <g key={'st-top-' + i}>
                <circle cx={x} cy={TOP_Y + PIPE_H / 2} r={active ? 4 : 2.5}
                        fill={active ? 'var(--amber)' : 'rgba(245,165,36,0.4)'}
                        stroke="rgba(20,20,20,0.9)" strokeWidth="1.5" />
                <StageChip x={x} y={chipY_top} label={s.label} sub={s.sub} tone="amber" />
              </g>
            );
          })}
          {/* Stage markers + chips — bottom */}
          {STAGES_BOT.map((s, i) => {
            const x = xFor(s.f);
            const active = i === botPos.stageIdx;
            return (
              <g key={'st-bot-' + i}>
                <circle cx={x} cy={BOT_Y + PIPE_H / 2} r={active ? 4 : 2.5}
                        fill={active ? 'var(--mint)' : 'rgba(134,239,172,0.4)'}
                        stroke="rgba(20,20,20,0.9)" strokeWidth="1.5" />
                <StageChip x={x} y={chipY_bot} label={s.label} sub={s.sub} tone="mint" />
              </g>
            );
          })}

          {/* Orbs */}
          <g>
            <circle cx={topX} cy={topOrbY} r="11" fill="rgba(245,165,36,0.18)" />
            <circle cx={topX} cy={topOrbY} r="6" fill="url(#uf-orb-amber)" />
            {topPos.exited && (
              <text x={topX + 14} y={topOrbY + 4} className="uf-pipe__leakLbl">−$240</text>
            )}
          </g>
          <g>
            <circle cx={botX} cy={botOrbY} r="11" fill="rgba(134,239,172,0.22)" />
            <circle cx={botX} cy={botOrbY} r="6" fill="url(#uf-orb-mint)" />
            {botPos.exited && (
              <text x={botX + 14} y={botOrbY + 4} className="uf-pipe__bookedLbl">+$480</text>
            )}
          </g>
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
          These are the averages. Your numbers are <span className="amber">probably worse</span>.
        </div>
        <button type="button" className="uf-pipes__runBtn" onClick={onRunYours}>
          ↓ Run yours
        </button>
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
