import { useEffect, useRef } from 'react';
import { TOOLS } from './tools.js';
import { ULTRAHUMAN, ATLYS } from './companies.js';

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
  },
  {
    n: '02',
    title: 'QC Bot',
    sub: 'ticket auditing',
    body: 'Automated quality-control bot auditing tickets at scale — flagging tone, SLA breaches and resolution quality so QA stops sampling and starts improving.',
    tags: ['Automation', 'QA', 'LLM'],
  },
  {
    n: '03',
    title: 'Ticket Logger',
    sub: 'hourly & daily',
    body: 'Per-agent ticket activity reported hourly and daily. Made the entire team operationally functional day-to-day with zero manual chasing of numbers.',
    tags: ['Reporting', 'Cron', 'Slack'],
  },
  {
    n: '04',
    title: 'Codex',
    sub: 'LMS platform',
    body: 'Co-built Codex, an internal LMS housing every SOP and document in one searchable place. Added quizzes so onboarding feels like leveling up.',
    tags: ['LMS', 'SOPs', 'Gamified'],
  },
  {
    n: '05',
    title: 'OCR Rebuild',
    sub: 'visa scanning',
    body: 'Rebuilt the OCR pipeline used to scan and parse traveler visa documents at Atlys. Shipped to production with over 90% accuracy, cutting manual verification time and reducing downstream errors.',
    tags: ['OCR', 'Document AI', 'Atlys'],
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

  // Counter animations
  useEffect(() => {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = +el.dataset.target;
        const suffix = el.dataset.suffix || '';
        const dur = 1400;
        const start = performance.now();
        const tick = (t) => {
          const p = Math.min((t - start) / dur, 1);
          const eased = 1 - Math.pow(1 - p, 3);
          const n = Math.round(target * eased);
          el.textContent = n + (p >= 1 ? suffix : '');
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        counterIO.unobserve(el);
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('.num[data-target]').forEach((c) => counterIO.observe(c));
    return () => counterIO.disconnect();
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
          <a href="#skills" onClick={smoothScroll}>Skills</a>
          <a href="#resume" onClick={smoothScroll}>Résumé</a>
          <a href="#contact" onClick={smoothScroll}>Contact</a>
        </div>
      </nav>

      <section className="hero" id="about">
        <div className="meta">Automations · CX Systems · India</div>
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

        <div className="stats">
          {STATS.map((s, i) => (
            <div className="stat" key={i}>
              <div className="num" data-target={s.target} data-suffix={s.suffix}>0</div>
              <div className="lbl">{s.label}</div>
            </div>
          ))}
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
                {p.tags.map((t) => <span key={t}>{t}</span>)}
              </div>
              <span className="arrow">→</span>
            </div>
          ))}
        </div>
      </section>

      <section id="skills">
        <div className="section-head reveal">
          <span className="num">04 —</span>
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
          <span className="num">05 —</span>
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

      <section id="contact">
        <div className="contact-card reveal">
          <span className="tag">— Get in touch —</span>
          <h2>Have a workflow that <em>should</em><br />be automated?</h2>
          <a href="mailto:aryandaspvt@gmail.com" className="email">aryandaspvt@gmail.com</a>
          <div className="socials">
            <a href="https://www.linkedin.com/" target="_blank" rel="noopener">LinkedIn ↗</a>
            <a href="mailto:aryandaspvt@gmail.com">Email ↗</a>
          </div>
        </div>
      </section>

      <footer>
        <div>© {year} Aryan Das</div>
        <div>Designed & built with care.</div>
      </footer>
    </>
  );
}
