import { useEffect, useRef, useState } from 'react';
import { TOOLS } from './tools.js';
import { ULTRAHUMAN, ATLYS } from './companies.js';

// Change this to control who can submit a testimonial
const TESTIMONIAL_PASS = 'aryan2025';
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/xqevqyqq';

// JSONBin (live testimonial storage)
// NOTE: This master key is bundled into client-side JS and visible in the source.
// For better security, replace with a bin-scoped Access Key from the JSONBin dashboard.
const JSONBIN_BIN_ID = '6a3ee8dff5f4af5e293636c9';
const JSONBIN_KEY = '$2a$10$Pkd5HAjY4OOPgv.t9kQmL.rpEfUd12xBcapjg6YN6YFQv5opMQQHO';
const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`;

const TESTIMONIALS = [
  {
    quote: "Aryan rebuilt our QC pipeline from scratch — what used to take a manager half a day now runs in the background. He thinks like ops, ships like an engineer.",
    name: 'Add yours',
    role: 'Add yours',
    company: 'Add yours',
    placeholder: true,
  },
  {
    quote: "The Codex LMS he co-built is the first internal docs system our new hires actually open on day one. Quizzes were a small touch that completely changed onboarding.",
    name: 'Add yours',
    role: 'Add yours',
    company: 'Add yours',
    placeholder: true,
  },
  {
    quote: "Drop in, find the gap, ship the fix. Three weeks in and our ticket logger was running hourly — we stopped chasing numbers and started running the team.",
    name: 'Add yours',
    role: 'Add yours',
    company: 'Add yours',
    placeholder: true,
  },
];

const STATS = [
  { target: 10, suffix: '+', label: 'Tools shipped' },
  { target: 2, suffix: '', label: 'Companies' },
  { target: 100, suffix: '', label: '% QC coverage' },
  { target: 24, suffix: '', label: '/7 reporting' },
];

const JOBS = [
  {
    when: 'Jun 2025 — Present',
    role: 'Automations',
    company: 'Ultrahuman',
    logo: ULTRAHUMAN,
    dark: true,
    badge: 'Current',
    body: 'Owning the automation layer for the CX org — Console tools, QC bots, ticket loggers, and Codex LMS. Turning repetitive workflows into self-running systems.',
  },
  {
    when: 'Nov 2024 — May 2025',
    role: 'Product Experience',
    company: 'Atlys',
    logo: ATLYS,
    dark: false,
    badge: 'Past',
    body: 'Front lines of product experience — handling traveler queries end-to-end, spotting process gaps, and learning what great support feels like from the inside.',
  },
];

const PROJECTS = [
  {
    n: '01',
    title: 'Console',
    sub: 'CRM platform',
    body: 'Internal ticket-handling CRM purpose-built for the CX team. Centralized data metrics, agent workflows and member context in one calm console.',
    tags: ['CRM', 'Data Metrics', 'CX Ops'],
    status: 'live',
  },
  {
    n: '02',
    title: 'QC Bot',
    sub: 'ticket auditing',
    body: 'Automated quality-control bot auditing tickets at scale — flagging tone, SLA breaches and resolution quality so QA stops sampling and starts improving.',
    tags: ['Automation', 'QA', 'LLM'],
    status: 'running',
  },
  {
    n: '03',
    title: 'Ticket Logger',
    sub: 'hourly & daily',
    body: 'Per-agent ticket activity reported hourly and daily. Made the entire team operationally functional day-to-day with zero manual chasing of numbers.',
    tags: ['Reporting', 'Cron', 'Slack'],
    status: 'running',
  },
  {
    n: '04',
    title: 'Codex',
    sub: 'LMS platform',
    body: 'Co-built Codex, an internal LMS housing every SOP and document in one searchable place. Added quizzes so onboarding feels like leveling up.',
    tags: ['LMS', 'SOPs', 'Gamified'],
    status: 'live',
  },
  {
    n: '05',
    title: 'OCR Rebuild',
    sub: 'visa scanning',
    body: 'Rebuilt the OCR pipeline used to scan and parse traveler visa documents at Atlys. Shipped to production with over 90% accuracy, cutting manual verification time and reducing downstream errors.',
    tags: ['OCR', 'Document AI', 'Atlys'],
    status: 'shipped',
  },
];

const SKILLS = [
  { h: 'CX Automation', p: 'Ticket QC bots, agent loggers, SLA monitors, ops dashboards.' },
  { h: 'Internal Tooling', p: 'CRM-style consoles, admin panels, knowledge platforms.' },
  { h: 'Data & Metrics', p: 'Operational reporting that teams actually open every morning.' },
  { h: 'L&D Systems', p: 'SOP libraries, quizzes, gamified onboarding flows.' },
  { h: 'Product Experience', p: 'Years on the front line — I build for the agent and the user.' },
  { h: 'Process Design', p: 'Translating messy human workflows into clean automated ones.' },
];

export default function App() {
  const scrollBarRef = useRef(null);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState('pass'); // 'pass' | 'form' | 'sent'
  const [pass, setPass] = useState('');
  const [passError, setPassError] = useState('');
  const [form, setForm] = useState({ name: '', role: '', company: '', quote: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [liveTestimonials, setLiveTestimonials] = useState([]);

  // Fetch live testimonials from JSONBin on mount
  useEffect(() => {
    fetch(`${JSONBIN_URL}/latest`, {
      headers: { 'X-Master-Key': JSONBIN_KEY },
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const list = data?.record?.testimonials;
        if (Array.isArray(list)) setLiveTestimonials(list);
      })
      .catch(() => {});
  }, []);

  const submitPass = (e) => {
    e.preventDefault();
    if (pass.trim().toLowerCase() === TESTIMONIAL_PASS.toLowerCase()) {
      setPassError('');
      setStep('form');
    } else {
      setPassError('Hmm, that code didn\'t match. Ask Aryan for it.');
    }
  };

  const submitForm = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    const entry = {
      quote: form.quote.trim(),
      name: form.name.trim(),
      role: form.role.trim(),
      company: form.company.trim(),
      submittedAt: new Date().toISOString(),
    };

    try {
      // 1. Read current testimonials from JSONBin
      const readRes = await fetch(`${JSONBIN_URL}/latest`, {
        headers: { 'X-Master-Key': JSONBIN_KEY },
      });
      if (!readRes.ok) throw new Error('read failed');
      const readData = await readRes.json();
      const current = Array.isArray(readData?.record?.testimonials)
        ? readData.record.testimonials
        : [];

      // 2. Append new entry and write back
      const updated = [...current, entry];
      const writeRes = await fetch(JSONBIN_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': JSONBIN_KEY,
        },
        body: JSON.stringify({ testimonials: updated }),
      });
      if (!writeRes.ok) throw new Error('write failed');

      // 3. Fire-and-forget Formspree notification (so Aryan gets an email too)
      fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          ...entry,
          _subject: `Testimonial from ${entry.name} (${entry.company})`,
        }),
      }).catch(() => {});

      // 4. Update local state so it appears on the page immediately
      setLiveTestimonials(updated);
      setStep('sent');
    } catch (err) {
      setSubmitError("Couldn't save that — try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setTimeout(() => {
      setStep('pass'); setPass(''); setPassError('');
      setForm({ name: '', role: '', company: '', quote: '' });
      setSubmitError(''); setSubmitting(false);
    }, 300);
  };

  // Reveal-on-scroll observer
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Looping counter animations — restart every ~7s while visible
  useEffect(() => {
    const visible = new Set();
    const timers = new Map();

    const runOnce = (el) => {
      const target = +el.dataset.target;
      const suffix = el.dataset.suffix || '';
      const dur = 1400;
      const start = performance.now();
      const tick = (t) => {
        const p = Math.min((t - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const n = Math.round(target * eased);
        el.textContent = n + (p >= 1 ? suffix : '');
        if (p < 1 && visible.has(el)) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const scheduleLoop = (el) => {
      runOnce(el);
      const id = setInterval(() => {
        if (visible.has(el)) runOnce(el);
      }, 7000);
      timers.set(el, id);
    };

    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const el = e.target;
        if (e.isIntersecting) {
          if (!visible.has(el)) {
            visible.add(el);
            scheduleLoop(el);
          }
        } else {
          visible.delete(el);
          const id = timers.get(el);
          if (id) { clearInterval(id); timers.delete(el); }
        }
      });
    }, { threshold: 0.4 });

    document.querySelectorAll('.num[data-target]').forEach((c) => io.observe(c));
    return () => {
      io.disconnect();
      timers.forEach((id) => clearInterval(id));
    };
  }, []);

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight) * 100;
      if (scrollBarRef.current) scrollBarRef.current.style.width = p + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Magnetic buttons
  useEffect(() => {
    const btns = document.querySelectorAll('.btn,.book-btn');
    const handlers = [];
    btns.forEach((btn) => {
      const move = (e) => {
        const r = btn.getBoundingClientRect();
        const x = e.clientX - r.left - r.width / 2;
        const y = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.3}px)`;
      };
      const leave = () => { btn.style.transform = ''; };
      btn.addEventListener('mousemove', move);
      btn.addEventListener('mouseleave', leave);
      handlers.push([btn, move, leave]);
    });
    return () => handlers.forEach(([b, m, l]) => {
      b.removeEventListener('mousemove', m);
      b.removeEventListener('mouseleave', l);
    });
  }, []);

  // Hero parallax on mouse
  useEffect(() => {
    const h1 = document.querySelector('.hero h1');
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      if (h1) h1.style.transform = `translate(${x}px,${y}px)`;
    };
    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  // Smooth scroll on hash links
  const smoothScroll = (e) => {
    const href = e.currentTarget.getAttribute('href');
    if (href && href.startsWith('#') && href.length > 1) {
      const el = document.querySelector(href);
      if (el) {
        e.preventDefault();
        window.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' });
      }
    }
  };

  const year = new Date().getFullYear();

  return (
    <>
      <div className="scroll-bar" ref={scrollBarRef} />

      <nav>
        <div className="logo">Aryan<span className="dot"></span></div>
        <div className="nav-links">
          <a href="#about" onClick={smoothScroll}>About</a>
          <a href="#experience" onClick={smoothScroll}>Experience</a>
          <a href="#tools" onClick={smoothScroll}>Tools</a>
          <a href="#work" onClick={smoothScroll}>Work</a>
          <a href="#testimonials" onClick={smoothScroll}>Testimonials</a>
          <a href="#skills" onClick={smoothScroll}>Skills</a>
          <a href="#resume" onClick={smoothScroll}>Résumé</a>
          <a href="#contact" onClick={smoothScroll}>Contact</a>
        </div>
      </nav>

      <section className="hero" id="about">
        <div className="blob b1" aria-hidden="true"></div>
        <div className="blob b2" aria-hidden="true"></div>
        <div className="meta">Automations · CX Systems · India</div>

        <div className="hero-grid">
          <div>
            <h1>
              <span className="word"><span style={{ animationDelay: '.1s' }}>Automation&nbsp;</span></span>
              <span className="word"><span style={{ animationDelay: '.22s' }}>specialist&nbsp;</span></span>
              <span className="word"><span style={{ animationDelay: '.34s' }}>building&nbsp;</span></span><br />
              <span className="word"><span style={{ animationDelay: '.46s' }}><em>operational</em>&nbsp;</span></span>
              <span className="word"><span style={{ animationDelay: '.58s' }}>leverage&nbsp;</span></span>
              <span className="word"><span style={{ animationDelay: '.7s' }}>for&nbsp;</span></span>
              <span className="word"><span style={{ animationDelay: '.82s' }}>CX&nbsp;teams.</span></span>
            </h1>
            <p className="lead">
              I'm Aryan Das — currently leading internal automations at <b>Ultrahuman</b>, previously
              in Product Experience at <b>Atlys</b>. I design and ship the internal tools, QA bots and
              reporting systems that help customer support orgs scale without losing quality.
            </p>
            <div className="cta-row">
              <a href="#work" className="btn primary" onClick={smoothScroll}>
                <span>View work</span> <span className="arrow">→</span>
              </a>
              <a href="#contact" className="btn ghost" onClick={smoothScroll}>
                <span>Get in touch</span> <span className="arrow">→</span>
              </a>
            </div>
          </div>

          <div className="right">
            <div className="available-card">
              <div className="left">
                <span className="pulse"></span>
                <div>
                  <div className="label">Status</div>
                  <div className="status">Open to projects</div>
                </div>
              </div>
              <div className="year">'26</div>
            </div>

            <div className="stats">
              {STATS.map((s, i) => (
                <div className="stat" key={i}>
                  <div className="num" data-target={s.target} data-suffix={s.suffix}>0</div>
                  <div className="lbl">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="focus-card">
              <div className="label">Currently shipping</div>
              <div className="focus-row">
                <div className="co-mark"><img src={ULTRAHUMAN} alt="Ultrahuman" /></div>
                <div>
                  <div className="role">Automations</div>
                  <div className="at">Ultrahuman · Jun 2025 → Present</div>
                </div>
              </div>
              <div className="focus-row">
                <div className="co-mark light"><img src={ATLYS} alt="Atlys" /></div>
                <div>
                  <div className="role">Product Experience</div>
                  <div className="at">Atlys · Nov 2024 → May 2025</div>
                </div>
              </div>
            </div>

            <div className="agent-card" aria-hidden="true">
              <div className="top">
                <span className="d r"></span><span className="d y"></span><span className="d g"></span>
                <span className="title">agent.run</span>
              </div>
              <div className="row ok">
                <span className="p">›</span>
                <span className="v">qc_bot <span className="k">// auditing tickets</span></span>
              </div>
              <div className="row ok">
                <span className="p">›</span>
                <span className="v">ticket_logger <span className="k">// hourly sync</span></span>
              </div>
              <div className="row ok">
                <span className="p">›</span>
                <span className="v">codex_lms <span className="k">// 24 SOPs indexed</span></span>
              </div>
              <div className="row">
                <span className="p">›</span>
                <span className="v">listening<span className="blink"></span></span>
              </div>
            </div>
          </div>
        </div>

        <div className="scroll-hint">Scroll <span className="line"></span></div>
      </section>

      <section id="experience">
        <div className="section-head reveal">
          <span className="num">01 —</span>
          <h2>Experience, <em>in brief</em>.</h2>
        </div>
        <div className="timeline">
          {JOBS.map((j, i) => (
            <div className={`job reveal${i ? ' d1' : ''}`} key={j.company}>
              <div className="when">{j.when}</div>
              <div className="job-inner">
                <div className={`co-logo${j.dark ? ' dark' : ''}`} title={j.company}>
                  <img src={j.logo} alt={j.company} />
                </div>
                <div>
                  <h3>{j.role}</h3>
                  <div className="co">{j.company}</div>
                  <p>{j.body}</p>
                </div>
              </div>
              <span className="badge">{j.badge}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="tools" style={{ paddingBottom: 60 }}>
        <div className="section-head reveal" style={{ marginBottom: 24 }}>
          <span className="num">02 —</span>
          <h2>Tools I <em>work with</em>.</h2>
        </div>
      </section>

      <div className="tools-wrap reveal">
        <div className="logo-track">
          {[...TOOLS, ...TOOLS].map((t, i) => (
            <div className="logo-item" key={i}>
              <span dangerouslySetInnerHTML={{ __html: t.svg }} />
              <div className="ll">{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section id="work">
        <div className="section-head reveal">
          <span className="num">03 —</span>
          <h2>Selected <em>work</em>.</h2>
        </div>
        <div className="projects">
          {PROJECTS.map((p, i) => (
            <div className={`project reveal${i ? ' d' + Math.min(i, 3) : ''}`} key={p.n}>
              <div className="num">{p.n}</div>
              <div>
                <h3>{p.title} <em>— {p.sub}</em></h3>
                <p>{p.body}</p>
              </div>
              <div className="tags">
                <div className="status-row">
                  <span className={`live-badge${p.status === 'shipped' ? ' archived' : ''}`}>{p.status}</span>
                </div>
                {p.tags.map((t) => <span key={t}>{t}</span>)}
              </div>
              <span className="arrow">→</span>
            </div>
          ))}
        </div>
      </section>

      <section id="testimonials">
        <div className="section-head reveal">
          <span className="num">04 —</span>
          <h2>Kind <em>words</em>.</h2>
        </div>
        <div className="testimonials-grid">
          {(liveTestimonials.length > 0 ? liveTestimonials : TESTIMONIALS).map((t, i) => (
            <figure className={`tcard reveal${i ? ' d' + Math.min(i, 3) : ''}${t.placeholder ? ' placeholder' : ''}`} key={t.submittedAt || i}>
              <div className="quote-mark">“</div>
              <blockquote>{t.quote}</blockquote>
              <figcaption>
                <div className="t-name">{t.name}</div>
                <div className="t-role">{t.role}{t.company && t.company !== t.role && ` · ${t.company}`}</div>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="testimonial-cta reveal">
          <span>Worked with me?</span>
          <button className="btn ghost" onClick={() => setShowModal(true)}>
            <span>Share a testimonial</span> <span className="arrow">→</span>
          </button>
        </div>
      </section>

      {showModal && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal} aria-label="Close">×</button>
            {step === 'pass' && (
              <form onSubmit={submitPass}>
                <div className="modal-eyebrow">Invite-only</div>
                <h3>Got a share code?</h3>
                <p>Testimonials are gated to people I've actually worked with. Ask Aryan for the code, then paste it below.</p>
                <input
                  type="text"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  placeholder="share code"
                  autoFocus
                />
                {passError && <div className="form-err">{passError}</div>}
                <button type="submit" className="btn primary"><span>Continue</span> <span className="arrow">→</span></button>
              </form>
            )}
            {step === 'form' && (
              <form onSubmit={submitForm}>
                <div className="modal-eyebrow">Almost there</div>
                <h3>Tell me what worked.</h3>
                <p>I'll review and add approved ones to the site. Your submission goes straight to my inbox — nothing is shared publicly without your name attached.</p>
                <input required disabled={submitting} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <input required disabled={submitting} placeholder="Your role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                <input required disabled={submitting} placeholder="Company" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} />
                <textarea required disabled={submitting} rows="4" placeholder="What did we build / fix together?" value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} />
                {submitError && <div className="form-err">{submitError}</div>}
                <button type="submit" className="btn primary" disabled={submitting}>
                  <span>{submitting ? 'Sending…' : 'Send'}</span>
                  {!submitting && <span className="arrow">→</span>}
                </button>
              </form>
            )}
            {step === 'sent' && (
              <div className="sent-block">
                <div className="modal-eyebrow">Received ✓</div>
                <h3>Got it — thanks for the kind words.</h3>
                <p>Your testimonial landed in my inbox. I'll review and add it to the site shortly. Appreciate it.</p>
                <button className="btn primary" onClick={closeModal}><span>Done</span></button>
              </div>
            )}
          </div>
        </div>
      )}

      <section id="skills">
        <div className="section-head reveal">
          <span className="num">05 —</span>
          <h2>What I <em>bring</em>.</h2>
        </div>
        <div className="skills-grid">
          {SKILLS.map((s, i) => (
            <div className={`skill reveal${i % 2 ? ' d1' : ''}`} key={s.h}>
              <h4>{s.h}</h4>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="resume">
        <div className="section-head reveal">
          <span className="num">06 —</span>
          <h2>Résumé.</h2>
        </div>
        <div className="resume-block reveal">
          <div>
            <h3>The full story, <em>on one page.</em></h3>
            <p>A clean, ATS-friendly résumé — no graphics, no parsing surprises. Reviewed by recruiters, opened by hiring managers.</p>
            <div className="actions">
              <a href={`${import.meta.env.BASE_URL}resume.html`} target="_blank" rel="noopener" className="btn primary">
                <span>Download résumé</span> <span className="arrow">↓</span>
              </a>
              <a href={`${import.meta.env.BASE_URL}resume.html`} target="_blank" rel="noopener" className="btn ghost">
                <span>Preview in new tab</span> <span className="arrow">→</span>
              </a>
            </div>
          </div>
          <div className="resume-preview" aria-hidden="true">
            <div className="rp-head">Aryan Das</div>
            <div className="rp-sub">Automation Specialist · CX</div>
            <div className="rp-label">Experience</div>
            <div className="rp-line med" /><div className="rp-line short" />
            <div className="rp-line" /><div className="rp-line med" /><div className="rp-line short" />
            <div className="rp-label">Skills</div>
            <div className="rp-line" /><div className="rp-line med" />
            <div className="rp-label">Education</div>
            <div className="rp-line med" /><div className="rp-line short" />
            <div className="watermark" />
          </div>
        </div>
      </section>

      <section id="contact" className="contact-cta reveal">
        <span className="small">Get in touch</span>
        <h2>
          <span className="reveal-word"><span>Still&nbsp;</span></span>
          <span className="reveal-word"><span>have&nbsp;</span></span>
          <span className="reveal-word"><span>a&nbsp;</span></span>
          <span className="reveal-word"><span><em>workflow</em>&nbsp;</span></span>
          <span className="reveal-word"><span>to&nbsp;</span></span>
          <span className="reveal-word"><span>automate?</span></span>
          <br />
          <span className="reveal-word"><span><em>Let's&nbsp;</em></span></span>
          <span className="reveal-word"><span><em>talk&nbsp;</em></span></span>
          <span className="reveal-word"><span><em>it&nbsp;</em></span></span>
          <span className="reveal-word"><span><em>through.</em></span></span>
        </h2>

        <a href="mailto:aryandaspvt@gmail.com" className="email-big">aryandaspvt@gmail.com →</a>

        <div className="row-meta">
          <div className="left">
            <b>Free 30-minute call.</b><br />
            No pitch, just a real conversation about your CX ops, automations or hiring.
          </div>
        </div>
      </section>

      <footer className="site-foot">
        <div className="foot-top">
          <div className="foot-brand">
            <div className="mark">Aryan<span className="dot"></span></div>
            <p>Automation specialist building internal tools, QA bots and reporting systems for CX teams.</p>
          </div>

          <div className="foot-col">
            <h5>Navigate</h5>
            <ul>
              <li><a href="#about" onClick={smoothScroll}>About</a></li>
              <li><a href="#experience" onClick={smoothScroll}>Experience</a></li>
              <li><a href="#work" onClick={smoothScroll}>Work</a></li>
              <li><a href="#tools" onClick={smoothScroll}>Tools</a></li>
            </ul>
          </div>

          <div className="foot-col">
            <h5>Connect</h5>
            <ul>
              <li><a href="mailto:aryandaspvt@gmail.com">Email <span className="ext">↗</span></a></li>
              <li><a href="https://www.linkedin.com/" target="_blank" rel="noopener">LinkedIn <span className="ext">↗</span></a></li>
              <li><a href="https://github.com/Aryandas2002" target="_blank" rel="noopener">GitHub <span className="ext">↗</span></a></li>
            </ul>
          </div>

          <div className="foot-col">
            <h5>Resources</h5>
            <ul>
              <li><a href={`${import.meta.env.BASE_URL}resume.html`} target="_blank" rel="noopener">Résumé <span className="ext">↗</span></a></li>
              <li><a href="#contact" onClick={smoothScroll}>Book a call</a></li>
            </ul>
          </div>
        </div>

        <div className="foot-bottom">
          © {year} Aryan Das. All rights reserved.&nbsp;&nbsp;·&nbsp;&nbsp;Bengaluru, India&nbsp;&nbsp;·&nbsp;&nbsp;Built with care
        </div>
      </footer>
    </>
  );
}
