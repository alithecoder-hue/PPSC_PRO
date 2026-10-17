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
 * Topic counts are hardcoded from backend/prisma/mcq-bank/_hierarchy.json
 * (the landing is static — no backend fetch).
 */
const SUBJECTS = [
  { name: 'General', slug: 'general', topics: 5, icon: LayoutGrid },
  { name: 'Pakistan Studies', slug: 'pakistan-studies', topics: 7, icon: Flag },
  { name: 'Islamic Studies', slug: 'islamic-studies', topics: 8, icon: Moon },
  { name: 'Current Affairs', slug: 'current-affairs', topics: 6, icon: Newspaper },
  { name: 'English', slug: 'english', topics: 5, icon: Type },
  { name: 'Urdu', slug: 'urdu', topics: 5, icon: Languages },
  { name: 'Everyday Science', slug: 'everyday-science', topics: 6, icon: FlaskConical },
  { name: 'Basic Mathematics', slug: 'basic-mathematics', topics: 5, icon: Calculator },
  { name: 'Geography', slug: 'geography', topics: 6, icon: Map },
  { name: 'Computer Studies', slug: 'computer-studies', topics: 22, icon: Cpu },
  { name: 'Logical Reasoning', slug: 'logical-reasoning', topics: 5, icon: Brain },
  { name: 'Pakistan Affairs', slug: 'pakistan-affairs', topics: 6, icon: Landmark },
  { name: 'Economics', slug: 'economics', topics: 5, icon: TrendingUp },
  { name: 'History', slug: 'history', topics: 5, icon: ScrollText },
  { name: 'Civics & Constitution', slug: 'civics-constitution', topics: 7, icon: Scale },
  { name: 'General Knowledge', slug: 'general-knowledge', topics: 7, icon: Lightbulb },
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
            <Link key={s.slug} href={`/subject/${s.slug}`} className="mm-subj-card">
              <div className="mm-subj-icon">
                <s.icon size={22} />
              </div>
              <div className="mm-subj-body">
                <h3>{s.name}</h3>
                <span>
                  {s.topics} topic{s.topics === 1 ? '' : 's'}
                </span>
              </div>
              <ArrowRight size={18} className="mm-subj-arrow" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
