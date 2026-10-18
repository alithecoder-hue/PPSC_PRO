'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  ChevronLeft,
  ChevronRight,
  FileQuestion,
  Layers,
} from 'lucide-react';

/**
 * Scrollable glassmorphic subject carousel for the marketing landing page.
 *
 * Slugs MUST match the subject page's resolution exactly:
 *   subject/[slug]/page.tsx finds a subject by
 *   s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
 * Question/topic counts are the real totals from backend/prisma/mcq-bank
 * (the landing is static — no backend fetch).
 * `img: true` once public/images/subjects/<slug>.jpg exists.
 */
const SUBJECTS = [
  { name: 'General', slug: 'general', questions: 60, topics: 5, icon: LayoutGrid, accent: '#475569', tint: '#e2e8f0', img: true },
  { name: 'Pakistan Studies', slug: 'pakistan-studies', questions: 91, topics: 7, icon: Flag, accent: '#16a34a', tint: '#bbf7d0', img: true },
  { name: 'Islamic Studies', slug: 'islamic-studies', questions: 90, topics: 8, icon: Moon, accent: '#0d9488', tint: '#99f6e4', img: true },
  { name: 'Current Affairs', slug: 'current-affairs', questions: 70, topics: 6, icon: Newspaper, accent: '#e11d48', tint: '#fecdd3', img: true },
  { name: 'English', slug: 'english', questions: 90, topics: 5, icon: Type, accent: '#4f46e5', tint: '#c7d2fe', img: false },
  { name: 'Urdu', slug: 'urdu', questions: 80, topics: 5, icon: Languages, accent: '#9333ea', tint: '#e9d5ff', img: false },
  { name: 'Everyday Science', slug: 'everyday-science', questions: 90, topics: 6, icon: FlaskConical, accent: '#0891b2', tint: '#a5f3fc', img: false },
  { name: 'Basic Mathematics', slug: 'basic-mathematics', questions: 80, topics: 5, icon: Calculator, accent: '#ea580c', tint: '#fed7aa', img: false },
  { name: 'Geography', slug: 'geography', questions: 80, topics: 6, icon: Map, accent: '#65a30d', tint: '#d9f99d', img: false },
  { name: 'Computer Studies', slug: 'computer-studies', questions: 90, topics: 22, icon: Cpu, accent: '#0284c7', tint: '#bae6fd', img: false },
  { name: 'Logical Reasoning', slug: 'logical-reasoning', questions: 70, topics: 5, icon: Brain, accent: '#7c3aed', tint: '#ddd6fe', img: false },
  { name: 'Pakistan Affairs', slug: 'pakistan-affairs', questions: 70, topics: 6, icon: Landmark, accent: '#d97706', tint: '#fde68a', img: false },
  { name: 'Economics', slug: 'economics', questions: 70, topics: 5, icon: TrendingUp, accent: '#059669', tint: '#a7f3d0', img: false },
  { name: 'History', slug: 'history', questions: 70, topics: 5, icon: ScrollText, accent: '#78716c', tint: '#e7e5e4', img: false },
  { name: 'Civics & Constitution', slug: 'civics-constitution', questions: 80, topics: 7, icon: Scale, accent: '#2563eb', tint: '#bfdbfe', img: false },
  { name: 'General Knowledge', slug: 'general-knowledge', questions: 90, topics: 7, icon: Lightbulb, accent: '#db2777', tint: '#fbcfe8', img: false },
];

export default function SubjectsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);

  const update = useCallback(() => {
    const el = trackRef.current;
    if (!el || el.clientWidth === 0) return;
    const p = Math.max(1, Math.ceil(el.scrollWidth / el.clientWidth));
    setPages(p);
    setPage(Math.min(p - 1, Math.round(el.scrollLeft / el.clientWidth)));
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    const t = setTimeout(update, 300);
    return () => {
      window.removeEventListener('resize', update);
      clearTimeout(t);
    };
  }, [update]);

  const go = (dir: number) => {
    const el = trackRef.current;
    if (!el) return;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
  };

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: i * el.clientWidth, behavior: smooth ? 'smooth' : 'auto' });
  };

  return (
    <section className="mm-section mm-subjects-carousel" id="subjects">
      <div className="mm-aurora" aria-hidden="true" />
      <div className="mm-container mm-subj-head">
        <div>
          <span className="mm-eyebrow">Subjects</span>
          <h2 className="mm-h2">Every subject. One platform.</h2>
          <p className="mm-lead">
            The complete PPSC syllabus, broken into topics exactly the way the
            exam tests them. Pick a subject and start practicing.
          </p>
        </div>
        <div className="mm-carousel-nav">
          <button type="button" onClick={() => go(-1)} disabled={page === 0} aria-label="Previous subjects">
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            disabled={page >= pages - 1}
            aria-label="Next subjects"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="mm-container">
        <div
          className="mm-carousel-track"
          ref={trackRef}
          onScroll={update}
          tabIndex={0}
          role="region"
          aria-label="Subjects carousel — use left and right arrow keys to scroll"
        >
          {SUBJECTS.map((s) => (
            <Link
              key={s.slug}
              href={`/classroom?subject=${s.slug}`}
              className="mm-glass-card"
              style={{ '--subj-accent': s.accent } as React.CSSProperties}
            >
              <div className="mm-glass-img">
                {s.img ? (
                  <img src={`/images/subjects/${s.slug}.jpg`} alt="" loading="lazy" />
                ) : (
                  <div
                    className="mm-glass-img-fallback"
                    style={{ background: `linear-gradient(135deg, ${s.tint}, ${s.accent})` }}
                  >
                    <s.icon size={46} strokeWidth={1.6} />
                  </div>
                )}
                <span className="mm-glass-count">{s.questions} MCQs</span>
              </div>
              <div className="mm-glass-body">
                <h3>{s.name}</h3>
                <div className="mm-glass-stats">
                  <span>
                    <FileQuestion size={14} /> {s.questions} questions
                  </span>
                  <span>
                    <Layers size={14} /> {s.topics} topics
                  </span>
                </div>
                <span className="mm-glass-cta">
                  Practice now <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
        {pages > 1 && pages <= 10 && (
          <div className="mm-carousel-dots" role="tablist" aria-label="Subject pages">
            {Array.from({ length: pages }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === page}
                aria-label={`Go to page ${i + 1}`}
                className={i === page ? 'active' : ''}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
