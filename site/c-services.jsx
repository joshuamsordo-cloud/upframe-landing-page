/* global React */
const { useState: useStateSvc, useEffect: useEffectSvc } = React;

/* Mini website mock for "Websites" service */
function MiniSite() {
  return (
    <div className="uf-mini-browser">
      <div className="uf-mini-browser__bar">
        <span className="dot" /><span className="dot" /><span className="dot" />
        <span className="uf-mini-browser__url">northsideplumbing.co</span>
      </div>
      <div className="uf-mini-site">
        <div className="uf-mini-site__hero">
          <div className="h">Drain emergency? <span className="mint">We&apos;re 22 min away.</span></div>
          <div className="sub">Portland, OR · Licensed & bonded · 412 reviews</div>
          <div className="row">
            <span className="uf-mini-site__btn">Book now</span>
            <span className="uf-mini-site__btn uf-mini-site__btn--ghost">Call</span>
          </div>
        </div>
        <div className="uf-mini-site__cards">
          <div className="uf-mini-site__card"><span className="star">★ ★ ★ ★ ★</span><span>&ldquo;Got someone out within an hour.&rdquo;</span><span className="meta">— Sarah K · Aug</span></div>
          <div className="uf-mini-site__card"><span className="star">★ ★ ★ ★ ★</span><span>&ldquo;Fair price, no upsell.&rdquo;</span><span className="meta">— Dave R · Aug</span></div>
          <div className="uf-mini-site__card"><span className="star">★ ★ ★ ★ ★</span><span>&ldquo;Booked online at 11pm. Done by 8am.&rdquo;</span><span className="meta">— Mira T · Jul</span></div>
        </div>
      </div>
    </div>
  );
}

/* ============================ Workflow Graph ==========================
   Vertical branching workflow. Single input forks into two parallel
   branches (SMS + Log CRM) that both converge on one outcome (Booked).
   ===================================================================== */

// x/y in viewBox 60×90 coords
const FLOW_NODES = [
  { id: 'lead',   x: 30, y:  8, lbl: 'Lead In',  sub: 'inbound' },
  { id: 'qual',   x: 30, y: 30, lbl: 'Qualify',  sub: '9s'      },
  { id: 'sms',    x: 12, y: 55, lbl: 'SMS',      sub: 'twilio'  },
  { id: 'crm',    x: 48, y: 55, lbl: 'Log CRM',  sub: 'hubspot' },
  { id: 'booked', x: 30, y: 78, lbl: 'Booked',   sub: '+$520'   },
];

const FLOW_EDGES = [
  { from: 0, to: 1 },
  { from: 1, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 4 },
  { from: 3, to: 4 },
];

// Each element is the set of node indices to activate simultaneously
const FLOW_SEQ = [
  [0],    // lead
  [1],    // qualify
  [2, 3], // sms + crm branch (parallel)
  [4],    // booked
];

const STEP_MS = 900;

function NodeGraph() {
  const [step, setStep] = useStateSvc(0);

  useEffectSvc(() => {
    const id = setInterval(() => {
      setStep(s => s >= FLOW_SEQ.length ? 0 : s + 1);
    }, STEP_MS);
    return () => clearInterval(id);
  }, []);

  const activeSet = new Set(step >= 1 && step <= FLOW_SEQ.length ? FLOW_SEQ[step - 1] : []);
  const visitedSet = new Set();
  for (let s = 1; s <= step; s++) {
    if (s <= FLOW_SEQ.length) FLOW_SEQ[s - 1].forEach(i => visitedSet.add(i));
  }

  const NODE_W = 16, NODE_H = 10;
  // Vertical bezier: bottom-center of `a` → top-center of `b`
  const path = (a, b) => {
    const x1 = a.x, y1 = a.y + NODE_H / 2;
    const x2 = b.x, y2 = b.y - NODE_H / 2;
    const dy = (y2 - y1) * 0.5;
    return `M ${x1} ${y1} C ${x1} ${y1 + dy}, ${x2} ${y2 - dy}, ${x2} ${y2}`;
  };

  const activeLabel = step === 0
    ? 'Idle · awaiting lead'
    : FLOW_SEQ[step - 1] ? FLOW_SEQ[step - 1].map(i => FLOW_NODES[i].lbl).join(' + ') : 'Cycle complete';

  return (
    <div className="uf-flow">
      <svg viewBox="0 0 60 90" preserveAspectRatio="xMidYMid meet" className="uf-flow__svg">
        <defs>
          <linearGradient id="uf-flow-grad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%"   stopColor="rgba(134,239,172,0)" />
            <stop offset="50%"  stopColor="rgba(134,239,172,0.95)" />
            <stop offset="100%" stopColor="rgba(134,239,172,0)" />
          </linearGradient>
          <filter id="uf-flow-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {FLOW_EDGES.map((e, i) => {
          const a = FLOW_NODES[e.from], b = FLOW_NODES[e.to];
          const isActiveEdge = activeSet.has(e.to) && step > 0;
          return (
            <g key={i} className="uf-flow__edge">
              <path d={path(a, b)} stroke="var(--steel-2)" strokeWidth="0.4" fill="none" />
              {isActiveEdge && (
                <path d={path(a, b)} stroke="url(#uf-flow-grad)" strokeWidth="0.9" fill="none"
                      strokeDasharray="6 30" className="uf-flow__edge-sweep" />
              )}
            </g>
          );
        })}

        {FLOW_NODES.map((n, i) => {
          const isActive = activeSet.has(i);
          const isDone = visitedSet.has(i) && !isActive;
          return (
            <g key={n.id}
               className={"uf-flow__node" +
                 (isActive ? ' is-active' : '') +
                 (isDone   ? ' is-done'   : '')}
               style={{ transform: `translate(${n.x}px, ${n.y}px)` }}>
              <rect x={-NODE_W / 2} y={-NODE_H / 2} width={NODE_W} height={NODE_H} rx="1.6"
                    className="uf-flow__node-bg" />
              <text x="0" y="-0.5" textAnchor="middle" className="uf-flow__node-lbl">{n.lbl}</text>
              <text x="0" y="3.1" textAnchor="middle" className="uf-flow__node-sub">{n.sub}</text>
              <circle cx="0" cy={-NODE_H / 2} r="0.7" className="uf-flow__node-port" />
              <circle cx="0" cy={NODE_H / 2}  r="0.7" className="uf-flow__node-port" />
            </g>
          );
        })}
      </svg>
      <div className="uf-flow__caption">
        <span className="uf-flow__dot" />
        <span>{activeLabel}</span>
      </div>
    </div>
  );
}

/* ============================ Agent Chat ============================
   Sliding window: at most 3 messages on screen. New messages enter
   from the bottom; oldest drops out at the top. Card height is fixed.
   ===================================================================== */

const AGENT_SCRIPT = [
  { role: 'caller', who: 'Caller', text: 'Hi, my water heater is leaking onto the floor.' },
  { role: 'agent',  who: 'Agent',  text: 'Sorry to hear that. Have you shut off the cold supply at the top?' },
  { role: 'caller', who: 'Caller', text: 'Yeah, just did. Floor is still wet though.' },
  { role: 'agent',  who: 'Agent',  text: "We can be there in 40 min. Address & gas or electric?" },
  { role: 'caller', who: 'Caller', text: '4421 Belmont. Gas, about 8 years old.' },
  { role: 'agent',  who: 'Agent',  text: 'Booked — Tuesday 9:00am backup. You\'ll get a text confirmation.' },
];

const VISIBLE_MSGS = 3;
const MSG_INTERVAL_MS = 1700;
const TYPING_MS = 600;

function AgentChat() {
  const [visible, setVisible] = useStateSvc([{ ...AGENT_SCRIPT[0], key: 0 }]);
  const [typing, setTyping] = useStateSvc(false);
  const [nextMsg, setNextMsg] = useStateSvc(AGENT_SCRIPT[1]);

  useEffectSvc(() => {
    let cancelled = false;
    let idx = 1;
    let key = 1;
    const advance = async () => {
      while (!cancelled) {
        const upcoming = idx >= AGENT_SCRIPT.length ? AGENT_SCRIPT[0] : AGENT_SCRIPT[idx];
        setNextMsg(upcoming);
        await new Promise(r => setTimeout(r, MSG_INTERVAL_MS - TYPING_MS));
        if (cancelled) return;
        setTyping(true);
        await new Promise(r => setTimeout(r, TYPING_MS));
        if (cancelled) return;
        setTyping(false);
        if (idx >= AGENT_SCRIPT.length) {
          key += 1;
          setVisible([{ ...AGENT_SCRIPT[0], key }]);
          idx = 1;
        } else {
          key += 1;
          const msg = { ...AGENT_SCRIPT[idx], key };
          idx += 1;
          setVisible(prev => [...prev, msg].slice(-VISIBLE_MSGS));
        }
      }
    };
    advance();
    return () => { cancelled = true; };
  }, []);

  const nextSpeaker = nextMsg ? nextMsg.who  : 'Agent';
  const nextRole    = nextMsg ? nextMsg.role : 'agent';

  return (
    <div className="uf-agent-chat">
      <div className="uf-agent-chat__head">
        <span className="dot" />
        <span className="lbl">Live · Voice agent</span>
        <span className="who">+1 (503) 555 · 22:47</span>
      </div>
      <div className="uf-agent-chat__list">
        {visible.map(m => (
          <div key={m.key} className={"uf-msg " + (m.role === 'caller' ? 'me' : 'agent')}>
            <div>
              <div className="uf-msg__role">{m.who}</div>
              <div className="uf-msg__bubble">{m.text}</div>
            </div>
          </div>
        ))}
        {typing && (
          <div className={"uf-msg uf-msg--typing " + (nextRole === 'caller' ? 'me' : 'agent')}>
            <div>
              <div className="uf-msg__role">{nextSpeaker}</div>
              <div className="uf-msg__bubble"><span className="uf-msg__typing"><span /><span /><span /></span></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ServicesSection() {
  const services = [
    {
      n: '01', h: 'Websites',
      desc: 'Booking-ready, review-forward, mobile-first. Looks professional on first click — and converts.',
      viz: <MiniSite />,
    },
    {
      n: '02', h: 'Workflow Automation',
      desc: 'Quote follow-up, review requests, appointment reminders — running automatically without you lifting a finger.',
      viz: <NodeGraph />,
    },
    {
      n: '03', h: 'Agents',
      desc: 'Voice and text AI that answers, qualifies, and books jobs 24/7 — even when you\'re under a sink.',
      viz: <AgentChat />,
    },
  ];
  return (
    <section className="uf-section" id="services">
      <div className="uf-container">
        <div className="uf-sech">
          <Eyebrow data-reveal style={{ ['--reveal-delay']: '0ms' }}>OUR SERVICES</Eyebrow>
          <h2 className="uf-sech__h" data-reveal style={{ ['--reveal-delay']: '80ms', ['--word-base']: '80ms' }}>
            {splitWords(<>Three pieces of <span className="mint">infrastructure.</span></>)}
          </h2>
          <p className="uf-sech__sub" data-reveal style={{ ['--reveal-delay']: '240ms' }}>No fixed tiers. We start where the leak is biggest and build out from there.</p>
        </div>
        <div className="uf-services">
          {services.map((s, i) => (
            <div className="uf-service" key={s.n} data-reveal style={{ ['--reveal-delay']: `${360 + i * 100}ms` }}>
              <div className="uf-service__num">{s.n}</div>
              <div className="uf-service__h">{s.h}</div>
              <div className="uf-service__desc">{s.desc}</div>
              <div className="uf-service__viz">{s.viz}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { MiniSite, NodeGraph, AgentChat, ServicesSection });
