/* global React */
const { useState: useStateTes } = React;

const TESTIS = [
  {
    initials: 'MJ', name: 'Marcus Jensen', biz: 'Northside Plumbing Co.', city: 'Portland, OR',
    quote: "Voice agent caught 47 after-hours calls in the first month. That's $18k I wasn't seeing before. Wish I'd done it two years ago.",
    stats: [['+38', 'JOBS / MO'], ['+$24k', 'MRR LIFT'], ['11h', 'BACK / WK']],
    audio: true,
  },
  {
    initials: 'HK', name: 'Hannah Kovac', biz: 'Halcomb Heating & Air', city: 'Austin, TX',
    quote: "We went from 38 Google reviews to 412 in six months. Now we rank above the franchises. The phone hasn't stopped.",
    stats: [['412', 'REVIEWS'], ['2.1×', 'BOOK RATE'], ['+$1.4M', 'YR-1 REV']],
    audio: true,
  },
  {
    initials: 'DR', name: 'Diego Reyes', biz: 'Pinecrest Roofing', city: 'Denver, CO',
    quote: "Storm season last year nearly broke us. This year the agent handled intake at 2am while I slept. Booked 14 inspections in one night.",
    stats: [['0', 'MISSED'], ['92%', 'F/U RATE'], ['+6h', 'EVENINGS']],
    audio: false,
  },
  {
    initials: 'SP', name: 'Sarah Patel', biz: 'Greenline Property Care', city: 'Columbus, OH',
    quote: "The new site put booking above the fold. Average job value jumped $180 once spring contracts moved to a clear pricing page.",
    stats: [['+64%', 'WEB LEADS'], ['+$680', 'AVG JOB'], ['−4d', 'QUOTE → BOOK']],
    audio: true,
  },
];

function TestiCard({ t, playing, onPlay }) {
  return (
    <div className="uf-testi__card">
      <div className="uf-testi__head">
        <div className="uf-testi__avatar">{t.initials}</div>
        <div className="uf-testi__who">
          <span className="uf-testi__name">{t.name}</span>
          <span className="uf-testi__biz">{t.biz}</span>
          <span className="uf-testi__city">{t.city}</span>
        </div>
      </div>
      <div className="uf-testi__quote">&ldquo;{t.quote}&rdquo;</div>
      <div className="uf-testi__foot">
        <div className="uf-testi__stats">
          {t.stats.map(([n, l]) => (
            <div className="uf-testi__stat" key={l}>
              <span className="num">{n}</span>
              <span className="lbl">{l}</span>
            </div>
          ))}
        </div>
        {t.audio && (
          <button className={"uf-testi__play" + (playing ? ' playing' : '')} onClick={onPlay}>
            {playing ? (
              <>
                <span className={"uf-testi__bars playing"}>
                  <span /><span /><span /><span /><span />
                </span>
                0:42
              </>
            ) : (
              <>
                <span className="glyph">▶</span> Hear it · 0:42
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function TestimonialsSection() {
  const [playing, setPlaying] = useStateTes(null);
  return (
    <section className="uf-section uf-section--inset" id="proof">
      <div className="uf-container">
        <div className="uf-sech">
          <Eyebrow>PROOF</Eyebrow>
          <h2 className="uf-sech__h">Owners who stopped <span className="mint">leaving money on the table.</span></h2>
          <p className="uf-sech__sub">Every number below came off a Stripe dashboard, a QuickBooks export, or the call log.</p>
        </div>
        <div className="uf-testi">
          {TESTIS.map((t, i) => (
            <TestiCard key={t.name} t={t} playing={playing === i} onPlay={() => setPlaying(playing === i ? null : i)} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ClosingSection({ onBook }) {
  return (
    <section className="uf-closing" id="closing">
      <div className="uf-dotgrid" />
      <div className="uf-container" style={{ position: 'relative', zIndex: 2 }}>
        <Eyebrow dot pulse>BOOK A 30-MIN AUDIT · FREE</Eyebrow>
        <h2 className="uf-closing__h">Every week you wait,<br />the gap <span className="mint">compounds.</span></h2>
        <p className="uf-closing__sub">
          One conversation. We map the leaks and put a number on each.
          Then we either build, or we don&apos;t.
        </p>
        <div className="uf-closing__cta">
          <Btn variant="primary" size="lg" arrow onClick={onBook}>Book a call</Btn>
          <Btn variant="secondary" size="lg" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top</Btn>
        </div>
        <div className="uf-closing__meta">
          <span>NO CARD</span>
          <span>NO PITCH</span>
          <span>RESPONSE &lt; 4H</span>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="uf-foot">
      <div className="uf-container uf-foot__inner">
        <div className="uf-foot__brand">
          <div className="uf-foot__logo">
            <img src="assets/logo-mark-mint.png" alt="" className="uf-foot__logo-mark" draggable="false" />
            <img src="assets/logo-text.png" alt="Upframe AI" className="uf-foot__logo-text" draggable="false" />
          </div>
          <div className="uf-foot__tag">Less drag. More momentum. Built for owner-operators in the trades.</div>
        </div>
        <div>
          <div className="uf-foot__col-h">Services</div>
          <span className="uf-foot__link">Websites</span>
          <span className="uf-foot__link">Workflow automation</span>
          <span className="uf-foot__link">Voice & text agents</span>
        </div>
        <div>
          <div className="uf-foot__col-h">Company</div>
          <span className="uf-foot__link">How it works</span>
          <span className="uf-foot__link">Case studies</span>
          <span className="uf-foot__link">Field notes</span>
        </div>
        <div>
          <div className="uf-foot__col-h">Contact</div>
          <span className="uf-foot__link">Book a call</span>
          <span className="uf-foot__link">hello@upframe.ai</span>
          <span className="uf-foot__link">Refer a trade</span>
        </div>
      </div>
      <div className="uf-container uf-foot__legal">
        <span>© 2026 UPFRAME AI</span>
        <span>PRIVACY · TERMS · SOC 2 IN PROGRESS</span>
      </div>
    </footer>
  );
}

Object.assign(window, { TestimonialsSection, ClosingSection, Footer });
