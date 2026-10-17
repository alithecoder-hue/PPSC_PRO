import React from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Timer,
  BarChart3,
  CalendarCheck,
  Bell,
  ArrowRight,
  Check,
} from 'lucide-react';
import { TestInterfaceMock, AnalyticsMock } from './components/ProductMock';
import PricingSection from './components/PricingSection';
import FaqSection from './components/FaqSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Merit Master — PPSC, FPSC & NTS Exam Preparation',
  description:
    'Crack the PPSC exam on your first attempt. 50,000+ topic-wise MCQs, 5 years of solved past papers, timed mock tests and performance analytics.',
};

const FEATURES = [
  {
    icon: BookOpen,
    title: '50,000+ topic-wise MCQs',
    text: 'Every subject broken into topics, exactly the way PPSC tests them. Practice what matters, skip what doesn\u2019t.',
  },
  {
    icon: FileText,
    title: '5 years of solved past papers',
    text: 'Real PPSC papers from recent years, fully solved with explanations. Download them as PDFs with Premium.',
  },
  {
    icon: Timer,
    title: 'Timed mock exams',
    text: 'Full-length tests under real exam pressure — 100 questions, real timing, instant scoring.',
  },
  {
    icon: BarChart3,
    title: 'Performance analytics',
    text: 'See your score trend, accuracy by topic and exactly which weak areas are costing you marks.',
  },
  {
    icon: CalendarCheck,
    title: 'Study planner',
    text: 'A day-by-day plan that adapts to your exam date and keeps your preparation on track.',
  },
  {
    icon: Bell,
    title: 'Jobs & exam alerts',
    text: 'Never miss an opening — new PPSC advertisements and paper announcements, all in one board.',
  },
];

const TESTIMONIALS = [
  {
    quote:
      'I practiced past papers on Merit Master every evening for two months. Walked into the exam and half the paper felt familiar.',
    name: 'Sana Fatima',
    detail: 'Lecturer (Education Dept.)',
    initials: 'SF',
  },
  {
    quote:
      'The analytics showed me I was losing marks in Everyday Science. Fixed that one topic and my mock scores jumped 15%.',
    name: 'Ahmed Raza',
    detail: 'ASI, Punjab Police',
    initials: 'AR',
  },
  {
    quote:
      'Timed mocks changed everything for me. I stopped panicking on time and started finishing papers with 20 minutes to spare.',
    name: 'Maria Khan',
    detail: 'Assistant (S&GAD)',
    initials: 'MK',
  },
];

export default function LandingPage() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="mm-hero">
        <div className="mm-container mm-hero-grid">
          <div>
            <span className="mm-eyebrow">PPSC · FPSC · NTS preparation</span>
            <h1>
              Pass the PPSC exam on your <span className="hl">first attempt.</span>
            </h1>
            <p className="mm-hero-sub">
              Merit Master gives you 50,000+ topic-wise MCQs, 5 years of solved
              past papers and timed mock tests — with analytics that show you
              exactly where you stand.
            </p>
            <div className="mm-hero-ctas">
              <Link href="/signup" className="mm-btn mm-btn-primary mm-btn-lg">
                Start preparing — it&apos;s free
              </Link>
              <Link href="/past-papers" className="mm-btn mm-btn-ghost mm-btn-lg">
                Browse past papers
              </Link>
            </div>
            <div className="mm-trust">
              <div className="mm-avatars" aria-hidden="true">
                <span style={{ background: '#0c1b2e' }}>SF</span>
                <span style={{ background: '#b45309' }}>AR</span>
                <span style={{ background: '#166534' }}>MK</span>
                <span style={{ background: '#334155' }}>+</span>
              </div>
              <div className="mm-trust-text">
                <span className="mm-stars">★★★★★</span>
                <br />
                <strong>4.9/5</strong> from 2,300+ aspirants preparing daily
              </div>
            </div>
          </div>
          <TestInterfaceMock />
        </div>
      </section>

      {/* ============ PROOF STRIP ============ */}
      <div className="mm-proof">
        <div className="mm-container mm-proof-inner">
          <span className="mm-proof-label">Built for Pakistan&apos;s exams</span>
          <div className="mm-proof-badges">
            <span>PPSC</span>
            <span>FPSC</span>
            <span>NTS</span>
            <span>OTS</span>
            <span>FIA</span>
          </div>
        </div>
      </div>

      {/* ============ FEATURES ============ */}
      <section className="mm-section mm-features" id="features">
        <div className="mm-container">
          <div className="mm-center">
            <span className="mm-eyebrow">Why Merit Master</span>
            <h2 className="mm-h2">Everything you need. Nothing you don&apos;t.</h2>
            <p className="mm-lead">
              Guidebooks go outdated. Random PDFs are unorganized. Merit Master
              is a complete system — practice, test, analyze, improve.
            </p>
          </div>
          <div className="mm-grid-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="mm-card">
                <div className="mm-card-icon">
                  <f.icon size={22} />
                </div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="mm-section" id="how-it-works">
        <div className="mm-container">
          <div className="mm-center">
            <span className="mm-eyebrow">How it works</span>
            <h2 className="mm-h2">From signup to exam-ready in three steps</h2>
          </div>
          <div className="mm-steps">
            <div className="mm-step">
              <h3>Create your free account</h3>
              <p>
                Sign up in under a minute. Pick your target exam — PPSC
                Lecturer, ASI, Assistant, or any other post.
              </p>
            </div>
            <div className="mm-step">
              <h3>Practice by topic</h3>
              <p>
                Work through MCQs organized by subject and topic, or jump
                straight into solved past papers from recent years.
              </p>
            </div>
            <div className="mm-step">
              <h3>Test, analyze, improve</h3>
              <p>
                Take timed mocks, watch your analytics climb, and fix weak
                areas before exam day — not after.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SHOWCASE ============ */}
      <section className="mm-section mm-showcase">
        <div className="mm-container mm-showcase-grid">
          <div>
            <span className="mm-eyebrow">Analytics</span>
            <h2 className="mm-h2">Know exactly where you stand</h2>
            <p className="mm-lead">
              Most aspirants practice blindly. Merit Master tracks every
              attempt and turns it into a clear picture of your readiness.
            </p>
            <ul className="mm-checklist">
              <li>
                <span className="mm-check">
                  <Check size={14} />
                </span>
                <div>
                  <strong>Score trends over time</strong>
                  <p>Watch your average climb week after week.</p>
                </div>
              </li>
              <li>
                <span className="mm-check">
                  <Check size={14} />
                </span>
                <div>
                  <strong>Topic-level accuracy</strong>
                  <p>See which topics are costing you marks.</p>
                </div>
              </li>
              <li>
                <span className="mm-check">
                  <Check size={14} />
                </span>
                <div>
                  <strong>Streaks &amp; XP</strong>
                  <p>Stay consistent with daily goals that keep you coming back.</p>
                </div>
              </li>
            </ul>
          </div>
          <AnalyticsMock />
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="mm-section mm-testimonials">
        <div className="mm-container">
          <div className="mm-center">
            <span className="mm-eyebrow">Success stories</span>
            <h2 className="mm-h2">Aspirants who made it</h2>
            <p className="mm-lead">
              Real preparation, real results. Here&apos;s what toppers say.
            </p>
          </div>
          <div className="mm-t-grid">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="mm-t-card">
                <div className="mm-t-stars">★★★★★</div>
                <p>&ldquo;{t.quote}&rdquo;</p>
                <div className="mm-t-who">
                  <span className="mm-t-ava">{t.initials}</span>
                  <div>
                    <b>{t.name}</b>
                    <span>{t.detail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ PRICING ============ */}
      <PricingSection />

      {/* ============ FAQ ============ */}
      <section className="mm-section">
        <div className="mm-container">
          <div className="mm-center">
            <span className="mm-eyebrow">FAQ</span>
            <h2 className="mm-h2">Questions, answered</h2>
          </div>
          <FaqSection />
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="mm-section" style={{ paddingTop: 0 }}>
        <div className="mm-container">
          <div className="mm-cta">
            <h2>Your competition started preparing yesterday.</h2>
            <p>
              Join 2,300+ aspirants practicing on Merit Master today — free to
              start, no card required.
            </p>
            <div className="mm-hero-ctas">
              <Link href="/signup" className="mm-btn mm-btn-accent mm-btn-lg">
                Create free account <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
