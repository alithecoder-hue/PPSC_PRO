import React from 'react';
import Link from 'next/link';
import {
  LayoutGrid,
  Flag,
  Moon,
  Newspaper,
  Type,
  Languages,
  FlaskConical,
  Calculator,
  Map,
  Cpu,
  Brain,
  Landmark,
  TrendingUp,
  ScrollText,
  Scale,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';

/**
 * Browse-subjects grid for the marketing landing page.
 *
 * Slugs MUST match the subject page's resolution exactly:
 *   subject/[slug]/page.tsx finds a subject by
 *   s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
 * Question counts are the real totals from backend/prisma/mcq-bank/*.json
 * (the landing is static — no backend fetch).
 */
const SUBJECTS = [
  { name: 'General', slug: 'general', questions: 60, icon: LayoutGrid, accent: '#475569', tint: '#f1f5f9' },
  { name: 'Pakistan Studies', slug: 'pakistan-studies', questions: 91, icon: Flag, accent: '#16a34a', tint: '#dcfce7' },
  { name: 'Islamic Studies', slug: 'islamic-studies', questions: 90, icon: Moon, accent: '#0d9488', tint: '#ccfbf1' },
  { name: 'Current Affairs', slug: 'current-affairs', questions: 70, icon: Newspaper, accent: '#e11d48', tint: '#ffe4e6' },
  { name: 'English', slug: 'english', questions: 90, icon: Type, accent: '#4f46e5', tint: '#e0e7ff' },
  { name: 'Urdu', slug: 'urdu', questions: 80, icon: Languages, accent: '#9333ea', tint: '#f3e8ff' },
  { name: 'Everyday Science', slug: 'everyday-science', questions: 90, icon: FlaskConical, accent: '#0891b2', tint: '#cffafe' },
  { name: 'Basic Mathematics', slug: 'basic-mathematics', questions: 80, icon: Calculator, accent: '#ea580c', tint: '#ffedd5' },
  { name: 'Geography', slug: 'geography', questions: 80, icon: Map, accent: '#65a30d', tint: '#ecfccb' },
  { name: 'Computer Studies', slug: 'computer-studies', questions: 90, icon: Cpu, accent: '#0284c7', tint: '#e0f2fe' },
  { name: 'Logical Reasoning', slug: 'logical-reasoning', questions: 70, icon: Brain, accent: '#7c3aed', tint: '#ede9fe' },
  { name: 'Pakistan Affairs', slug: 'pakistan-affairs', questions: 70, icon: Landmark, accent: '#d97706', tint: '#fef3c7' },
  { name: 'Economics', slug: 'economics', questions: 70, icon: TrendingUp, accent: '#059669', tint: '#d1fae5' },
  { name: 'History', slug: 'history', questions: 70, icon: ScrollText, accent: '#78716c', tint: '#f5f5f4' },
  { name: 'Civics & Constitution', slug: 'civics-constitution', questions: 80, icon: Scale, accent: '#2563eb', tint: '#dbeafe' },
  { name: 'General Knowledge', slug: 'general-knowledge', questions: 90, icon: Lightbulb, accent: '#db2777', tint: '#fce7f3' },
];

export default function SubjectsSection() {
  return (
    <section className="mm-section mm-subjects" id="subjects">
      <div className="mm-container">
        <div className="mm-center">
          <span className="mm-eyebrow">Subjects</span>
          <h2 className="mm-h2">Every subject. One platform.</h2>
          <p className="mm-lead">
            The complete PPSC syllabus, broken into topics exactly the way the
            exam tests them. Pick a subject and start practicing.
          </p>
        </div>
        <div className="mm-subj-grid">
          {SUBJECTS.map((s) => (
            <Link
              key={s.slug}
              href={`/subject/${s.slug}`}
              className="mm-subj-card"
              style={{ '--subj-accent': s.accent } as React.CSSProperties}
            >
              <div className="mm-subj-icon" style={{ background: s.tint, color: s.accent }}>
                <s.icon size={22} />
              </div>
              <div className="mm-subj-body">
                <h3>{s.name}</h3>
                <span>{s.questions} questions</span>
              </div>
              <ArrowRight size={18} className="mm-subj-arrow" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
