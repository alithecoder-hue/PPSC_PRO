'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  FileText,
  Timer,
  BarChart3,
  CalendarCheck,
  Bell,
  ArrowRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

/**
 * Interactive tabbed feature showcase for the marketing landing page.
 * Theme-aware: all colors come from --mm-* tokens.
 * Copy (titles + text) is identical to the previous FEATURES array.
 */
const FEATURES: { icon: LucideIcon; title: string; text: string; tags?: string[] }[] = [
  {
    icon: BookOpen,
    title: '50,000+ topic-wise MCQs',
    text: 'Every subject broken into topics, exactly the way PPSC tests them. Practice what matters, skip what doesn\u2019t.',
    tags: ['Islamiyat', 'Pak Studies', 'Everyday Science', 'English', '+12 more'],
  },
  {
    icon: FileText,
    title: '5 years of solved past papers',
    text: 'Real PPSC papers from recent years, fully solved with explanations. Download them as PDFs with Premium.',
    tags: ['2024', '2023', '2022', '2021', '2020'],
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

export default function FeaturesShowcase() {
  const [active, setActive] = useState(0);
  const f = FEATURES[active];

  return (
    <div className="mm-featshow">
      <div className="mm-featshow-tabs" role="tablist" aria-label="Platform features">
        {FEATURES.map((feat, i) => (
          <button
            key={feat.title}
            type="button"
            role="tab"
            aria-selected={i === active}
            className={i === active ? 'on' : ''}
            onClick={() => setActive(i)}
          >
            <span className="mm-featshow-num" aria-hidden="true">
              {String(i + 1).padStart(2, '0')}
            </span>
            <span className="mm-featshow-tabicon" aria-hidden="true">
              <feat.icon size={18} />
            </span>
            <span className="mm-featshow-tabtitle">{feat.title}</span>
            <ArrowRight size={16} className="mm-featshow-tabarrow" aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="mm-featshow-panel" role="tabpanel" aria-live="polite">
        <div key={active} className="mm-featshow-panel-inner">
          <div className="mm-featshow-visual" aria-hidden="true">
            <span className="mm-featshow-orb" />
            <f.icon size={72} strokeWidth={1.3} />
          </div>
          <div className="mm-featshow-body">
            <span className="mm-featshow-kicker">
              Feature {String(active + 1).padStart(2, '0')} / {String(FEATURES.length).padStart(2, '0')}
            </span>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
            {f.tags && (
              <div className="mm-featshow-tags">
                {f.tags.map((t) => (
                  <span key={t} className={t.startsWith('+') ? 'more' : ''}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
