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
          <div className="h">Drain emergency? <span className="mint">We're 22 min away.</span></div>
          <div className="sub">Portland, OR · Licensed & bonded · 412 reviews</div>
          <div className="row">
            <span className="uf-mini-site__btn">Book now</span>
            <span className="uf-mini-site__btn uf-mini-site__btn--ghost">Call</span>
          </div>
        </div>
        <div className="uf-mini-site__cards">
          <div className="uf-mini-site__card"><span className="star">★ ★ ★ ★ ★</span><span>"Got someone out within an hour."</span><span className="meta">— Sarah K · Aug</span></div>
          <div className="uf-mini-site__card"><span className="star">★ ★ ★ ★ ★</span><span>"Fair price, no upsell."</span><span className="meta">— Dave R · Aug</span></div>
          <div className="uf-mini-site__card"><span className="star">★ ★ ★ ★ ★</span><span>"Booked online at 11pm. Done by 8am."</span><span className="meta">— Mira T · Jul</span></div>
        </div>
      </div>
    </div>
  );
}

/* Node graph for "Workflow Automation" — pulses traveling through */
function NodeGraph() {
  const [tick, setTick] = useStateSvc(0);
  useEffectSvc(() => {
    const id = setInterval(() => setTick(t => (t + 1) % 100), 80);
    return () => clearInterval(id);
  }, []);

  // Path: A(0) → B(1) → C(2) → D(3) (5 segments around)
  const nodes = [
    { x: 12, y: 50, lbl: 'Trigger', tag: 'Quote sent', cls: 'in' },
    { x: 38, y: 22, lbl: 'Wait 5m', tag: 'delay' },
    { x: 50, y: 78, lbl: 'Send SMS', tag: 'twilio' },
    { x: 72, y: 32, lbl: 'Review ask', tag: 'auto' },
    { x: 90, y: 60, lbl: 'Booked', tag: 'out', cls: 'out' },
  ];
  const edges = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 2],
  ];
  // Pulse progress along each edge (0..1), staggered
  const t = tick / 100;
  const pulses = edges.map((_, i) => ((t + i * 0.18) % 1));

  return (
    <div className="uf-graph">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none">
        {edges.map(([a, b], i) => {
          const na = nodes[a], nb = nodes[b];
          return (
            <line key={i}
              x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
              stroke="#3A3A3A" strokeWidth="0.5" strokeDasharray="1.4 1.4" />
          );
        })}
        {edges.map(([a, b], i) => {
          const na = nodes[a], nb = nodes[b];
          const p = pulses[i];
          const cx = na.x + (nb.x - na.x) * p;
          const cy = na.y + (nb.y - na.y) * p;
          return (
            <g key={'p' + i}>
              <circle cx={cx} cy={cy} r="1.6" fill="#86EFAC" />
              <circle cx={cx} cy={cy} r="3.2" fill="rgba(134,239,172,0.25)" />
            </g>
          );
        })}
      </svg>
      <div className="uf-graph__nodes">
        {nodes.map((n, i) => (
          <div key={i} className={"uf-graph__node " + (n.cls || '')} style={{ left: n.x + '%', top: n.y + '%' }}>
            <span>{n.lbl}</span>
            <span className="tag">{n.tag}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Agent chat — looping sample exchange */
const AGENT_SCRIPT = [
  { role: 'caller', who: 'Caller', text: 'Hi, my water heater is leaking onto the floor.' },
  { role: 'agent',  who: 'Agent',  text: 'Sorry to hear that. Have you shut off the cold supply at the top?' },
  { role: 'caller', who: 'Caller', text: 'Yeah, just did. Floor is still wet though.' },
  { role: 'agent',  who: 'Agent',  text: "We can be there in 40 min. Address & gas or electric?" },
  { role: 'caller', who: 'Caller', text: '4421 Belmont. Gas, about 8 years old.' },
  { role: 'agent',  who: 'Agent',  text: 'Booked — Tuesday 9:00am backup. You\'ll get a text confirmation.' },
];

function AgentChat() {
  const [shown, setShown] = useStateSvc(1);
  const [typing, setTyping] = useStateSvc(false);
  useEffectSvc(() => {
    let cancelled = false;
    const tick = async () => {
      while (!cancelled) {
        await new Promise(r => setTimeout(r, 1400));
        if (cancelled) return;
        if (shown >= AGENT_SCRIPT.length) {
          await new Promise(r => setTimeout(r, 2000));
          if (cancelled) return;
          setShown(1);
          continue;
        }
        setTyping(true);
        await new Promise(r => setTimeout(r, 600));
        if (cancelled) return;
        setTyping(false);
        setShown(s => Math.min(s + 1, AGENT_SCRIPT.length));
      }
    };
    tick();
    return () => { cancelled = true; };
  }, [shown]);

  return (
    <div className="uf-agent-chat">
      <div className="uf-agent-chat__head">
        <span className="dot" />
        <span className="lbl">Live · Voice agent</span>
        <span className="who">+1 (503) 555 · 22:47</span>
      </div>
      {AGENT_SCRIPT.slice(0, shown).map((m, i) => (
        <div key={i} className={"uf-msg " + (m.role === 'caller' ? 'me' : 'agent')}>
          <div>
            <div className="uf-msg__role">{m.who}</div>
            <div className="uf-msg__bubble">{m.text}</div>
          </div>
        </div>
      ))}
      {typing && shown < AGENT_SCRIPT.length && (
        <div className="uf-msg agent">
          <div>
            <div className="uf-msg__role">{AGENT_SCRIPT[shown].who}</div>
            <div className="uf-msg__bubble"><span className="uf-msg__typing"><span /><span /><span /></span></div>
          </div>
        </div>
      )}
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
          <Eyebrow>OUR SERVICES</Eyebrow>
          <h2 className="uf-sech__h">Three pieces of <span className="mint">infrastructure.</span></h2>
          <p className="uf-sech__sub">No fixed tiers. We start where the leak is biggest — usually the phone — and build out from there.</p>
        </div>
        <div className="uf-services">
          {services.map(s => (
            <div className="uf-service" key={s.n}>
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
