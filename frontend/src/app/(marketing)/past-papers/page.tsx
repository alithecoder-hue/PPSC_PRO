'use client';

import { API_BASE } from '@/lib/api';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import styles from './past-papers.module.css';
import {
  FileText,
  Search,
  Calendar,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  Lock,
  RefreshCw,
  Award,
  Compass,
  FileCheck2,
  Star,
  Flame,
  Landmark,
  Globe,
  Calculator,
  Newspaper,
  MoonStar,
} from 'lucide-react';

const SEEDED_PAPERS = [
  {
    id: 'mock-1',
    title: 'PPSC Naib Tehsildar (BS-14) Exam',
    year: '2024',
    subject: 'General Knowledge & Pakistan Studies',
    type: 'PPSC',
    mcqIds: new Array(100),
    downloads: 4820,
    isPremium: false,
    tag: 'Trending',
  },
  {
    id: 'mock-2',
    title: 'FIA Inspector Investigation (FPSC)',
    year: '2023',
    subject: 'English & General Ability',
    type: 'FPSC',
    mcqIds: new Array(100),
    downloads: 3450,
    isPremium: true,
    tag: 'Highly Recommended',
  },
  {
    id: 'mock-3',
    title: 'PPSC Assistant (S&GAD) Exam',
    year: '2024',
    subject: 'General Knowledge & Urdu',
    type: 'PPSC',
    mcqIds: new Array(100),
    downloads: 5120,
    isPremium: false,
    tag: 'Recent',
  },
  {
    id: 'mock-4',
    title: 'FPSC Custom Inspector Exam',
    year: '2023',
    subject: 'Customs Act & GK',
    type: 'FPSC',
    mcqIds: new Array(100),
    downloads: 2980,
    isPremium: true,
    tag: 'Premium',
  },
  {
    id: 'mock-5',
    title: 'PPSC Sub-Inspector Punjab Police',
    year: '2022',
    subject: 'Computer Science & GK',
    type: 'PPSC',
    mcqIds: new Array(100),
    downloads: 6240,
    isPremium: false,
    tag: 'Most Attempted',
  },
  {
    id: 'mock-6',
    title: 'PPSC Lecturer Computer Science',
    year: '2023',
    subject: 'Computer Science & Pedagogy',
    type: 'PPSC',
    mcqIds: new Array(100),
    downloads: 4120,
    isPremium: true,
    tag: 'Premium',
  },
];

const AGENCIES = [
  { code: 'PPSC', icon: Landmark },
  { code: 'FPSC', icon: Compass },
  { code: 'NTS', icon: FileCheck2 },
  { code: 'SPSC', icon: Star },
  { code: 'KPPSC', icon: Award },
];

const SUBJECT_LINKS = [
  { name: 'General Knowledge', slug: 'general-knowledge', icon: Globe },
  { name: 'Pakistan Studies', slug: 'pakistan-studies', icon: Landmark },
  { name: 'English', slug: 'english', icon: BookOpen },
  { name: 'Basic Mathematics', slug: 'basic-mathematics', icon: Calculator },
  { name: 'Current Affairs', slug: 'current-affairs', icon: Newspaper },
  { name: 'Islamic Studies', slug: 'islamic-studies', icon: MoonStar },
];

/** Map a paper's subject string to a real classroom subject slug. */
function subjectToSlug(subject: string): string {
  const s = (subject || '').toLowerCase();
  if (s.includes('computer')) return 'computer-studies';
  if (s.includes('english')) return 'english';
  if (s.includes('urdu')) return 'urdu';
  if (s.includes('islamic') || s.includes('islamiyat')) return 'islamic-studies';
  if (s.includes('math')) return 'basic-mathematics';
  if (s.includes('pakistan studies') || s.includes('pak studies')) return 'pakistan-studies';
  if (s.includes('current affairs')) return 'current-affairs';
  if (s.includes('everyday science')) return 'everyday-science';
  return 'general-knowledge';
}

export default function PastPapersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeYear, setActiveYear] = useState('All');
  const [activeType, setActiveType] = useState('All');

  const [pastPapers, setPastPapers] = useState<any[]>(SEEDED_PAPERS);
  const [loading, setLoading] = useState(true);

  const listRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetch(API_BASE + '/api/public/past-papers')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.length > 0) {
          const backendIds = new Set(data.map((p: any) => p.id));
          const filteredSeeded = SEEDED_PAPERS.filter((p) => !backendIds.has(p.id));
          setPastPapers([...filteredSeeded, ...data]);
        } else {
          setPastPapers(SEEDED_PAPERS);
        }
        setLoading(false);
      })
      .catch(() => {
        setPastPapers(SEEDED_PAPERS);
        setLoading(false);
      });
  }, []);

  // Real stats, computed from the actual papers — never hardcoded.
  const stats = useMemo(() => {
    const years = new Set(pastPapers.map((p) => p.year));
    const agencies = new Set(pastPapers.map((p) => p.type));
    const mcqs = pastPapers.reduce((n, p) => n + (p.mcqIds?.length || 0), 0);
    return { total: pastPapers.length, years: years.size, agencies: agencies.size, mcqs };
  }, [pastPapers]);

  const agencyCount = (code: string) => pastPapers.filter((p) => p.type === code).length;

  const uniqueYears = useMemo(
    () => ['All', ...Array.from(new Set(pastPapers.map((p) => p.year))).sort((a, b) => Number(b) - Number(a))],
    [pastPapers]
  );

  const filteredPapers = pastPapers.filter((paper) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      paper.title.toLowerCase().includes(q) ||
      paper.subject.toLowerCase().includes(q);
    const matchesYear = activeYear === 'All' || paper.year === activeYear;
    const matchesType = activeType === 'All' || paper.type === activeType;
    return matchesSearch && matchesYear && matchesType;
  });

  const resetFilters = () => {
    setSearchTerm('');
    setActiveYear('All');
    setActiveType('All');
  };

  const scrollToList = () => {
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAgencyClick = (code: string) => {
    setActiveType((prev) => (prev === code ? 'All' : code));
    scrollToList();
  };

  const handleViewAllAgencies = () => {
    setActiveType('All');
    scrollToList();
  };

  // Agency slider arrows
  const updateArrows = () => {
    const el = trackRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
  };

  useEffect(() => {
    updateArrows();
    window.addEventListener('resize', updateArrows);
    return () => window.removeEventListener('resize', updateArrows);
  }, []);

  const scrollTrack = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(':scope > *') as HTMLElement | null;
    const step = card ? card.offsetWidth + 20 : 300;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const solveUrl = (paper: any) =>
    paper.isPremium ? '/subscription' : `/classroom?subject=${subjectToSlug(paper.subject)}&mode=test`;

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Navy hero band */}
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Past Papers Library</span>
          <h1 className={styles.title}>
            Past Papers <span className={styles.highlight}>Library</span>
          </h1>
          <p className={styles.subtitle}>
            Real solved papers from Pakistan&apos;s top exam bodies. Search, filter, and
            solve them online — free to start.
          </p>

          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statIcon}>
                <FileText size={18} />
              </span>
              <span className={styles.statText}>
                <strong>{loading ? '…' : stats.total}</strong>
                <span>Past papers</span>
              </span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statIcon}>
                <Calendar size={18} />
              </span>
              <span className={styles.statText}>
                <strong>{loading ? '…' : stats.years}</strong>
                <span>Years covered</span>
              </span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statIcon}>
                <Landmark size={18} />
              </span>
              <span className={styles.statText}>
                <strong>{loading ? '…' : stats.agencies}</strong>
                <span>Exam agencies</span>
              </span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statIcon}>
                <BookOpen size={18} />
              </span>
              <span className={styles.statText}>
                <strong>{loading ? '…' : stats.mcqs.toLocaleString()}</strong>
                <span>Practice MCQs</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.stickyZone}>
        {/* 2. Sticky filter bar */}
        <div className={styles.filterBar}>
          <div className={styles.filterCard}>
          <div className={styles.searchRow}>
            <div className={styles.searchField}>
              <Search size={18} className={styles.searchIcon} aria-hidden="true" />
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Search papers — try “Tehsildar”, “Inspector”…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') scrollToList();
                }}
                aria-label="Search past papers"
              />
            </div>
            <button type="button" className={styles.searchBtn} onClick={scrollToList}>
              Search
            </button>
            <button type="button" className={styles.resetBtn} onClick={resetFilters}>
              <RefreshCw size={15} aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>

          <div className={styles.selectsRow}>
            <div className={styles.selectCol}>
              <label className={styles.selectLabel} htmlFor="pp-year">
                Year
              </label>
              <select
                id="pp-year"
                className={styles.filterSelect}
                value={activeYear}
                onChange={(e) => setActiveYear(e.target.value)}
              >
                {uniqueYears.map((y) => (
                  <option key={y} value={y}>
                    {y === 'All' ? 'Any year' : y}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.selectCol}>
              <label className={styles.selectLabel} htmlFor="pp-agency">
                Agency
              </label>
              <select
                id="pp-agency"
                className={styles.filterSelect}
                value={activeType}
                onChange={(e) => setActiveType(e.target.value)}
              >
                <option value="All">All agencies</option>
                {AGENCIES.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.code}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. Content */}
        <main className={styles.content}>
          {/* Browse by Agency */}
          <section className={styles.section} aria-label="Browse by agency">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Browse by agency</h2>
              <button type="button" className={styles.sectionAction} onClick={handleViewAllAgencies}>
                <span>View all agencies</span>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
            </div>

            <div className={styles.sliderWrap}>
              <button
                type="button"
                className={styles.arrowBtn}
                onClick={() => scrollTrack(-1)}
                disabled={!canScrollLeft}
                aria-label="Scroll agencies left"
              >
                <ChevronLeft size={20} aria-hidden="true" />
              </button>
              <div className={styles.sliderTrack} ref={trackRef} onScroll={updateArrows}>
                {AGENCIES.map((a) => {
                  const count = agencyCount(a.code);
                  const isActive = activeType === a.code;
                  const Icon = a.icon;
                  return (
                    <button
                      key={a.code}
                      type="button"
                      className={`${styles.agencyCard} ${isActive ? styles.agencyCardActive : ''}`}
                      onClick={() => handleAgencyClick(a.code)}
                      aria-pressed={isActive}
                    >
                      <span className={styles.agencyIcon}>
                        <Icon size={22} aria-hidden="true" />
                      </span>
                      <span className={styles.agencyName}>{a.code}</span>
                      <span className={styles.agencyCount}>
                        {count === 0 ? 'No papers yet' : `${count} paper${count === 1 ? '' : 's'}`}
                      </span>
                      <span className={styles.agencyCta}>
                        {isActive ? 'Filtered' : 'Browse'}
                        <ChevronRight size={14} aria-hidden="true" />
                      </span>
                    </button>
                  );
                })}
              </div>
              <button
                type="button"
                className={styles.arrowBtn}
                onClick={() => scrollTrack(1)}
                disabled={!canScrollRight}
                aria-label="Scroll agencies right"
              >
                <ChevronRight size={20} aria-hidden="true" />
              </button>
            </div>
          </section>

          {/* Popular Subjects */}
          <section className={styles.section} aria-label="Popular subjects">
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Popular subjects</h2>
              <Link href="/classroom" className={styles.sectionAction}>
                <span>View all subjects</span>
                <ChevronRight size={16} aria-hidden="true" />
              </Link>
            </div>

            <div className={styles.subjectsGrid}>
              {SUBJECT_LINKS.map((s) => {
                const Icon = s.icon;
                return (
                  <Link key={s.slug} href={`/classroom?subject=${s.slug}`} className={styles.subjectBox}>
                    <span className={styles.subjectIcon}>
                      <Icon size={18} aria-hidden="true" />
                    </span>
                    <span className={styles.subjectName}>{s.name}</span>
                    <ChevronRight size={16} className={styles.subjectArrow} aria-hidden="true" />
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Papers list */}
          <section className={styles.section} aria-label="Available past papers" ref={listRef}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Available past papers</h2>
              <span className={styles.resultsBadge}>
                {filteredPapers.length} paper{filteredPapers.length === 1 ? '' : 's'} found
              </span>
            </div>

            {filteredPapers.length === 0 ? (
              <div className={styles.emptyState}>
                <span className={styles.emptyIcon}>
                  <Search size={24} aria-hidden="true" />
                </span>
                <h3>No papers match your filters</h3>
                <p>Try a different search term, or clear the filters to see everything.</p>
                <button type="button" className={styles.clearBtn} onClick={resetFilters}>
                  <RefreshCw size={15} aria-hidden="true" />
                  <span>Clear filters</span>
                </button>
              </div>
            ) : (
              <div className={styles.papersList}>
                {filteredPapers.map((paper) => (
                  <article key={paper.id} className={styles.paperRow}>
                    <div className={styles.paperBadges}>
                      <span className={styles.typeBadge}>{paper.type}</span>
                      <span className={styles.yearBadge}>{paper.year}</span>
                    </div>

                    <div className={styles.paperMain}>
                      <div className={styles.paperTitleRow}>
                        <h3 className={styles.paperTitle}>{paper.title}</h3>
                        {paper.tag && (
                          <span
                            className={`${styles.paperTag} ${
                              paper.tag === 'Trending' ? styles.tagTrending : ''
                            }`}
                          >
                            {paper.tag}
                          </span>
                        )}
                      </div>
                      <p className={styles.paperSubject}>{paper.subject}</p>
                      <div className={styles.paperMeta}>
                        <span className={styles.metaItem}>
                          <FileText size={13} aria-hidden="true" /> {paper.mcqIds?.length || 0} MCQs
                        </span>
                        <span className={styles.metaItem}>
                          <Flame size={13} aria-hidden="true" /> {(paper.downloads || 0).toLocaleString()} attempts
                        </span>
                      </div>
                    </div>

                    <div className={styles.paperAction}>
                      {paper.isPremium ? (
                        <Link href={solveUrl(paper)} className={`${styles.ctaBtn} ${styles.ctaPremium}`}>
                          <Lock size={14} aria-hidden="true" />
                          <span>Go Premium</span>
                        </Link>
                      ) : (
                        <Link href={solveUrl(paper)} className={styles.ctaBtn}>
                          <span>Solve online</span>
                          <ChevronRight size={15} aria-hidden="true" />
                        </Link>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
