/* global React */
const { useState: useStateFab, useEffect: useEffectFab, useRef: useRefFab } = React;

const STARTER_PROMPTS = [
  "How fast can you get a site live?",
  "Will the voice agent sound robotic?",
  "What does this cost?",
  "Can it integrate with my existing CRM?",
];

const SCRIPTED = {
  "How fast can you get a site live?": "Most sites are live in 14 days. Day 1 we map your leaks, day 3 we lock scope, day 14 the system is running — usually paying for itself by day 30.",
  "Will the voice agent sound robotic?": "Not on a real call. We tune voice + cadence to your brand and verticals. The agent qualifies, books, and hands off to a human when it should — no menus.",
  "What does this cost?": "No fixed tiers — scoped per business. Most owners we work with see the system pay for itself within month 1. A 30-min audit puts numbers on both sides.",
  "Can it integrate with my existing CRM?": "Yes. ServiceTitan, Housecall Pro, Jobber, HubSpot, plus most spreadsheets and inboxes. If it has an API or even just an email address, we can plumb it.",
};

function FloatingAgent({ onBook }) {
  const [open, setOpen] = useStateFab(false);
  const [messages, setMessages] = useStateFab([
    { role: 'agent', text: "Hey — Upframe agent here. What's leaking the most in your business right now?" },
  ]);
  const [input, setInput] = useStateFab('');
  const [typing, setTyping] = useStateFab(false);
  const bodyRef = useRefFab(null);

  useEffectFab(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, typing, open]);

  const send = (text) => {
    if (!text || !text.trim()) return;
    const t = text.trim();
    setMessages(m => [...m, { role: 'me', text: t }]);
    setInput('');
    setTyping(true);
    const reply = SCRIPTED[t] || "Best answer to that is a 30-min audit — we'll put a number on each leak. Want me to grab a slot?";
    setTimeout(() => {
      setTyping(false);
      setMessages(m => [...m, { role: 'agent', text: reply }]);
    }, 900);
  };

  return (
    <div className="uf-fab">
      {open && (
        <div className="uf-fab__panel" role="dialog" aria-label="Upframe agent">
          <div className="uf-fab__head">
            <span className="dot" />
            <div>
              <div className="uf-fab__head-title">Upframe agent</div>
              <div className="uf-fab__head-sub">Live · replies in seconds</div>
            </div>
            <button className="uf-fab__close" onClick={() => setOpen(false)} aria-label="Close">✕</button>
          </div>
          <div className="uf-fab__body" ref={bodyRef}>
            {messages.map((m, i) => (
              <div key={i} className={"uf-msg " + (m.role === 'me' ? 'me' : 'agent')}>
                <div>
                  <div className="uf-msg__role">{m.role === 'me' ? 'You' : 'Agent'}</div>
                  <div className="uf-msg__bubble">{m.text}</div>
                </div>
              </div>
            ))}
            {typing && (
              <div className="uf-msg agent">
                <div>
                  <div className="uf-msg__role">Agent</div>
                  <div className="uf-msg__bubble"><span className="uf-msg__typing"><span /><span /><span /></span></div>
                </div>
              </div>
            )}
            <div className="uf-fab__sugg">
              {STARTER_PROMPTS.filter(p => !messages.some(m => m.text === p)).slice(0, 3).map(p => (
                <button key={p} onClick={() => send(p)}>{p}</button>
              ))}
              <button onClick={onBook} style={{ background: 'rgba(134,239,172,0.08)', borderColor: 'var(--mint)', color: 'var(--mint)' }}>↗ Book a 30-min audit</button>
            </div>
          </div>
          <form className="uf-fab__input" onSubmit={(e) => { e.preventDefault(); send(input); }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything…"
              aria-label="Message"
            />
            <button type="submit" className="uf-fab__send" aria-label="Send">↑</button>
          </form>
        </div>
      )}
      <button className="uf-fab__btn" onClick={() => setOpen(o => !o)} aria-label="Open chat">
        {open ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6 18 18M18 6 6 18" /></svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-9 8.38c-1.27 0-2.46-.27-3.53-.76L3 21l1.9-5.05A8.38 8.38 0 1 1 21 11.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}

Object.assign(window, { FloatingAgent });
