import { useEffect, useRef, useState } from 'react';
import { TOOLS } from './tools.js';
import { ULTRAHUMAN, ATLYS } from './companies.js';

import TestimonialDialog from './TestimonialDialog.jsx';
import { APPROVED_TESTIMONIALS } from './testimonials.js';

const STATS = [
  { target: 10, suffix: '+', label: 'Tools shipped' },
  { target: 2, suffix: '', label: 'Companies' },
  { target: 100, suffix: '', label: '% QC coverage · 70% accuracy' },
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
    body: 'Automated quality-control bot auditing tickets at scale with 100% coverage and 70% accuracy — flagging tone, SLA breaches and resolution quality so QA stops sampling and starts improving.',
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);

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

  // Count once when visible; respect reduced-motion preferences.
  useEffect(() => {
    const frames = new Set();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(({ target: el, isIntersecting }) => {
        if (!isIntersecting) return;
        io.unobserve(el);
        const target = Number(el.dataset.target);
        const suffix = el.dataset.suffix || '';
        if (reducedMotion) {
          el.textContent = target + suffix;
          return;
        }
        let start;
        const tick = (time) => {
          if (start === undefined) start = time;
          const progress = Math.max(0, Math.min((time - start) / 1400, 1));
          el.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3))) + (progress === 1 ? suffix : '');
          if (progress < 1) schedule(tick);
        };
        const schedule = (callback) => {
          const id = requestAnimationFrame((time) => {
            frames.delete(id);
            callback(time);
          });
          frames.add(id);
        };
        schedule(tick);
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.num[data-target]').forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      frames.forEach(cancelAnimationFrame);
    };
  }, []);

  // Scroll progress
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const distance = h.scrollHeight - h.clientHeight;
      const p = distance > 0 ? h.scrollTop / distance * 100 : 0;
      if (scrollBarRef.current) scrollBarRef.current.style.width = p + '%';
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Magnetic buttons
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const h1 = document.querySelector('.hero h1');
    const onMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 8;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      if (h1) h1.style.transform = `translate(${x}px,${y}px)`;
    };
    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  // Native anchors preserve URL hashes, focus, and browser history.
  const closeMenu = () => setMenuOpen(false);

  const year = new Date().getFullYear();

  return (
    <>
      <div className="scroll-bar" ref={scrollBarRef} />

      <a className="skip-link" href="#about">Skip to content</a>
      <nav aria-label="Main navigation" onKeyDown={(event) => {
        if (event.key === 'Escape' && menuOpen) {
          setMenuOpen(false);
          menuButtonRef.current?.focus();
        }
      }}>
        <a className="logo" href="#about" onClick={closeMenu}>Aryan<span className="dot" /></a>
        <button ref={menuButtonRef} className="menu-toggle" type="button"
          aria-expanded={menuOpen} aria-controls="main-navigation"
          onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? 'Close menu' : 'Menu'}
        </button>
        <div id="main-navigation" className={`nav-links${menuOpen ? ' is-open' : ''}`}>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#experience" onClick={closeMenu}>Experience</a>
          <a href="#work" onClick={closeMenu}>Work</a>
          <a href="#skills" onClick={closeMenu}>Skills &amp; Tools</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
          <a href={`${import.meta.env.BASE_URL}resume.html`} className="nav-resume"
            target="_blank" rel="noopener noreferrer" onClick={closeMenu}>View résumé ↗</a>
        </div>
      </nav>

      <section className="hero" id="about" tabIndex={-1}>
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
              <a href="#work" className="btn primary" onClick={closeMenu}>
                <span>View work</span> <span className="arrow">→</span>
              </a>
              <a href="#contact" className="btn ghost" onClick={closeMenu}>
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
              <div className="year">'{String(year).slice(-2)}</div>
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
              <div className="label">Career snapshot</div>
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

      <section id="experience" tabIndex={-1}>
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

      <section id="work" tabIndex={-1}>
        <div className="section-head reveal">
          <span className="num">02 —</span>
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
            </div>
          ))}
        </div>
      </section>

      {APPROVED_TESTIMONIALS.length > 0 && (
        <section id="testimonials" aria-labelledby="testimonials-title">
          <div className="section-head reveal">
            <h2 id="testimonials-title">Kind <em>words</em>.</h2>
          </div>
          <div className="testimonials-grid">
            {APPROVED_TESTIMONIALS.map((testimonial) => (
              <figure className="tcard reveal" key={testimonial.id}>
                <blockquote>{testimonial.quote}</blockquote>
                <figcaption>
                  <div className="t-name">{testimonial.name}</div>
                  <div className="t-role">{[testimonial.role, testimonial.company].filter(Boolean).join(' · ')}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {showModal && <TestimonialDialog onClose={() => setShowModal(false)} />}

      <section id="skills" tabIndex={-1}>
        <div className="section-head reveal">
          <span className="num">03 —</span>
          <h2>Skills &amp; <em>tools</em>.</h2>
        </div>
        <div className="skills-grid">
          {SKILLS.map((s, i) => (
            <div className={`skill reveal${i % 2 ? ' d1' : ''}`} key={s.h}>
              <h4>{s.h}</h4>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
        <h3 className="tools-heading">Tools I work with</h3>
        <div className="tools-wrap">
          <div className="logo-track">
            {[0, 1].map((copy) => (
              <div className="logo-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
                {TOOLS.map((tool) => (
                  <div className="logo-item" key={tool.label}>
                    <span aria-hidden="true" dangerouslySetInnerHTML={{ __html: tool.svg }} />
                    <div className="ll">{tool.label}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="contact-cta reveal" tabIndex={-1}>
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
            <b>Discuss a project or role.</b><br />
            Email me about your CX operations, automation needs, or hiring plans.
          </div>
        </div>
        <div className="testimonial-cta">
          <span>Worked with me?</span>
          <button className="btn ghost" type="button" onClick={() => setShowModal(true)}>
            Share a testimonial →
          </button>
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
              <li><a href="#about" onClick={closeMenu}>About</a></li>
              <li><a href="#experience" onClick={closeMenu}>Experience</a></li>
              <li><a href="#work" onClick={closeMenu}>Work</a></li>
              <li><a href="#skills" onClick={closeMenu}>Skills &amp; Tools</a></li>
            </ul>
          </div>

          <div className="foot-col">
            <h5>Connect</h5>
            <ul>
              <li><a href="mailto:aryandaspvt@gmail.com">Email <span className="ext">↗</span></a></li>
              <li><a href="https://www.linkedin.com/in/das-aryan/" target="_blank" rel="noopener">LinkedIn <span className="ext">↗</span></a></li>
              <li><a href="https://github.com/Aryandas2002" target="_blank" rel="noopener">GitHub <span className="ext">↗</span></a></li>
            </ul>
          </div>

          <div className="foot-col">
            <h5>Resources</h5>
            <ul>
              <li><a href={`${import.meta.env.BASE_URL}resume.html`} target="_blank" rel="noopener">Résumé <span className="ext">↗</span></a></li>
              <li><a href="#contact" onClick={closeMenu}>Get in touch</a></li>
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
