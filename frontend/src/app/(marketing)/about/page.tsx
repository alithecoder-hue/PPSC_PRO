import React from 'react';
import Link from 'next/link';
import { BookOpen, BarChart3, HeartHandshake, ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About — Merit Master',
  description:
    'Merit Master is the focused preparation platform for PPSC, FPSC and NTS exams — built by aspirants, for aspirants.',
};

const PILLARS = [
  {
    icon: BookOpen,
    t: 'Real exam content',
    d: '50,000+ topic-wise MCQs and 5 years of solved past papers — organized exactly the way the exams test them.',
  },
  {
    icon: BarChart3,
    t: 'Practice that guides you',
    d: 'Timed mocks with instant scoring and analytics that show your weak topics, so every hour of study counts.',
  },
  {
    icon: HeartHandshake,
    t: 'Honest and accessible',
    d: 'Free to start, no card required. Premium costs less than a single guidebook — because preparation shouldn\u2019t be a luxury.',
  },
];

const STATS = [
  { v: '50,000+', l: 'Practice MCQs' },
  { v: '5 years', l: 'Solved past papers' },
  { v: '16', l: 'Subjects covered' },
  { v: '4.9/5', l: 'Student rating' },
];

export default function AboutPage() {
  return (
    <>
      <section className="mm-section">
        <div className="mm-container mm-center">
          <span className="mm-eyebrow">About Merit Master</span>
          <h1 className="mm-h2">Built by aspirants, for aspirants.</h1>
          <p className="mm-lead">
            We&apos;re building the preparation platform we wished existed when
            we were studying for competitive exams.
          </p>
        </div>
      </section>

      <section className="mm-section" style={{ paddingTop: 0 }}>
        <div className="mm-container">
          <div className="mm-center" style={{ maxWidth: 720, margin: '0 auto' }}>
            <p className="mm-lead" style={{ textAlign: 'left', marginBottom: 20 }}>
              Every year, thousands of capable students miss PPSC cutoffs — not
              for lack of hard work, but for lack of the right preparation.
              Guidebooks go outdated the moment they&apos;re printed. Random
              PDFs are unorganized. Coaching centers cost a fortune most
              families can&apos;t afford.
            </p>
            <p className="mm-lead" style={{ textAlign: 'left', marginBottom: 0 }}>
              Merit Master is our answer: a complete, focused system — practice,
              test, analyze, improve — available to every aspirant in Pakistan,
              free to start.
            </p>
          </div>
        </div>
      </section>

      <section className="mm-section" style={{ paddingTop: 0 }}>
        <div className="mm-container">
          <div className="mm-center">
            <span className="mm-eyebrow">What we stand for</span>
            <h2 className="mm-h2">Three promises</h2>
          </div>
          <div className="mm-grid-3" style={{ marginTop: 48 }}>
            {PILLARS.map((p) => (
              <div key={p.t} className="mm-card">
                <div className="mm-card-icon">
                  <p.icon size={22} />
                </div>
                <h3>{p.t}</h3>
                <p>{p.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mm-section" style={{ paddingTop: 0 }}>
        <div className="mm-container">
          <div className="mm-founder-card">
            <div className="mm-founder-photo">
              <img src="/images/founder-ali-tahir.png" alt="Ali Tahir, Founder of Merit Master" />
            </div>
            <div className="mm-founder-note">
              <span className="mm-eyebrow">A note from the founder</span>
              <p>Assalam-o-Alaikum,</p>
              <p>
                My name is <strong>Ali Tahir</strong>, and I built Merit
                Master for one reason: the students preparing for competitive
                exams like PPSC, FPSC and NTS.
              </p>
              <p>
                I know what this journey feels like — the scattered PDFs, the
                outdated guidebooks, the feeling of studying hard but not
                knowing whether you&apos;re studying right. I wanted to create
                one place where you can find everything: practice questions,
                past papers, mock tests, and the guidance to actually improve.
              </p>
              <p>
                This platform will always stay updated. I will keep adding the
                latest and most effective material, and I will keep working to
                make your preparation easier with every update.
              </p>
              <p>
                I pray for your success — study hard, stay consistent, and
                trust the process.
              </p>
              <p className="mm-founder-sign">
                Regards,
                <strong>Ali Tahir</strong>
                <span>Founder, Merit Master · BS IT student, Taunsa Sharif</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mm-section" style={{ paddingTop: 0 }}>
        <div className="mm-container">
          <div className="mm-stats-light">
            {STATS.map((s) => (
              <div key={s.l}>
                <strong>{s.v}</strong>
                <span>{s.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mm-section mm-cta-wrap">
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
