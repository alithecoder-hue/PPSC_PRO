'use client';

import { API_BASE } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './past-papers.module.css';
import { 
  FileText, 
  Flame, 
  Search, 
  Calendar, 
  BookOpen, 
  Award, 
  ChevronRight, 
  Lock, 
  ShieldCheck,
  Star,
  RefreshCw,
  Book,
  Grid,
  MapPin,
  Clock,
  Compass,
  FileCheck2,
  ChevronLeft
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
    paperType: 'Original Past Paper'
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
    paperType: 'Original Past Paper'
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
    paperType: 'Original Past Paper'
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
    paperType: 'Original Past Paper'
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
    paperType: 'Original Past Paper'
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
    paperType: 'Original Past Paper'
  }
];

export default function PastPapersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeYear, setActiveYear] = useState('All');
  const [activeSubject, setActiveSubject] = useState('All');
  const [activeType, setActiveType] = useState('All');
  const [activePaperType, setActivePaperType] = useState('All');
  
  const [pastPapers, setPastPapers] = useState<any[]>(SEEDED_PAPERS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_BASE + '/api/public/past-papers')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          const backendIds = new Set(data.map((p: any) => p.id));
          const filteredSeeded = SEEDED_PAPERS.filter(p => !backendIds.has(p.id));
          setPastPapers([...filteredSeeded, ...data]);
        } else {
          setPastPapers(SEEDED_PAPERS);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setPastPapers(SEEDED_PAPERS);
        setLoading(false);
      });
  }, []);

  const resetFilters = () => {
    setSearchTerm('');
    setActiveYear('All');
    setActiveSubject('All');
    setActiveType('All');
    setActivePaperType('All');
  };

  const uniqueYears = ['All', ...Array.from(new Set(pastPapers.map(p => p.year))).sort((a, b) => Number(b) - Number(a))];
  const uniqueSubjects = ['All', ...Array.from(new Set(pastPapers.map(p => p.subject))).sort()];
  const uniqueTypes = ['All', ...Array.from(new Set(pastPapers.map(p => p.type))).sort()];
  const uniquePaperTypes = ['All', 'Original Past Paper', 'Solved Mock Test', 'Subject-Specific Test'];

  const filteredPapers = pastPapers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          paper.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = activeYear === 'All' || paper.year === activeYear;
    const matchesSubject = activeSubject === 'All' || paper.subject === activeSubject;
    const matchesType = activeType === 'All' || paper.type === activeType;
    const matchesPaperType = activePaperType === 'All' || 
                             (paper.paperType && paper.paperType === activePaperType) || 
                             (activePaperType === 'Original Past Paper' && !paper.paperType); // Seeded default is past paper
    return matchesSearch && matchesYear && matchesSubject && matchesType && matchesPaperType;
  });

  return (
    <div className={styles.pageWrapper}>
      {/* 1. Dark Header Section */}
      <header className={styles.darkHeader}>
        <div className={styles.darkHeaderInner}>
          <div className={styles.badgeCapsule}>
            <Book size={13} className={styles.badgeIcon} />
            <span>PAST PAPERS LIBRARY</span>
          </div>

          <h1 className={styles.title}>
            Past Papers <span className={styles.highlight}>Library</span>
          </h1>

          <p className={styles.subtitle}>
            Access and practice past papers from all major exams and subjects. Analyze patterns, improve accuracy, and ace your preparation.
          </p>

          {/* Stats Grid */}
          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <div className={styles.statIconRing}>
                <FileText size={18} />
              </div>
              <div className={styles.statTextCol}>
                <span className={styles.statVal}>25,000+</span>
                <span className={styles.statLbl}>Past Papers</span>
              </div>
            </div>

            <div className={styles.statBox}>
              <div className={styles.statIconRing}>
                <Calendar size={18} />
              </div>
              <div className={styles.statTextCol}>
                <span className={styles.statVal}>20+</span>
                <span className={styles.statLbl}>Years Covered</span>
              </div>
            </div>

            <div className={styles.statBox}>
              <div className={styles.statIconRing}>
                <BookOpen size={18} />
              </div>
              <div className={styles.statTextCol}>
                <span className={styles.statVal}>50+</span>
                <span className={styles.statLbl}>Subjects</span>
              </div>
            </div>

            <div className={styles.statBox}>
              <div className={styles.statIconRing}>
                <ShieldCheck size={18} />
              </div>
              <div className={styles.statTextCol}>
                <span className={styles.statVal}>100%</span>
                <span className={styles.statLbl}>Authentic Papers</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Floating Search & Filter Section */}
      <section className={styles.filterSectionWrapper}>
        <div className={styles.filterCard}>
          <div className={styles.searchBarRow}>
            <div className={styles.searchInputContainer}>
              <Search size={18} className={styles.searchIcon} />
              <input 
                type="text" 
                className={styles.searchInput} 
                placeholder="Search for an exam (e.g., Tehsildar, Inspector...)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className={styles.searchBtn}>Search</button>
            <button className={styles.resetBtn} onClick={resetFilters}>
              <RefreshCw size={15} />
              <span>Reset Filters</span>
            </button>
          </div>

          <div className={styles.selectsRow}>
            <div className={styles.selectCol}>
              <label className={styles.selectLabel}>YEAR</label>
              <select 
                className={styles.filterSelect}
                value={activeYear}
                onChange={(e) => setActiveYear(e.target.value)}
              >
                {uniqueYears.map(y => <option key={y} value={y}>{y === 'All' ? 'Any Year' : y}</option>)}
              </select>
            </div>

            <div className={styles.selectCol}>
              <label className={styles.selectLabel}>SUBJECT / DOMAIN</label>
              <select 
                className={styles.filterSelect}
                value={activeSubject}
                onChange={(e) => setActiveSubject(e.target.value)}
              >
                {uniqueSubjects.map(s => <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>)}
              </select>
            </div>

            <div className={styles.selectCol}>
              <label className={styles.selectLabel}>AGENCY (OPTIONAL)</label>
              <select 
                className={styles.filterSelect}
                value={activeType}
                onChange={(e) => setActiveType(e.target.value)}
              >
                {uniqueTypes.map(t => <option key={t} value={t}>{t === 'All' ? 'All Agencies' : t}</option>)}
              </select>
            </div>

            <div className={styles.selectCol}>
              <label className={styles.selectLabel}>PAPER TYPE</label>
              <select 
                className={styles.filterSelect}
                value={activePaperType}
                onChange={(e) => setActivePaperType(e.target.value)}
              >
                {uniquePaperTypes.map(pt => <option key={pt} value={pt}>{pt === 'All' ? 'All Paper Types' : pt}</option>)}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Light Theme Content Area */}
      <main className={styles.lightContent}>
        {/* Browse by Agency */}
        <section className={styles.sectionArea}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Browse by Agency</h2>
            <Link href="/classroom" className={styles.sectionLink}>
              <span>View All Agencies</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className={styles.sliderContainer}>
            <div className={styles.sliderTrack}>
              {/* Agency Card: PPSC */}
              <div className={`${styles.agencyCard} ${styles.ppscCard}`}>
                <div className={styles.agencyIconWrapper}>
                  {/* Styled Emblem */}
                  <div className={`${styles.emblemSquare} ${styles.ppscBg}`}>
                    <Award size={24} className={styles.emblemIcon} />
                  </div>
                </div>
                <div className={styles.agencyInfo}>
                  <h3 className={styles.agencyName}>PPSC</h3>
                  <p className={styles.papersCount}>12,520+ Papers</p>
                </div>
                <div className={styles.agencyTags}>
                  <span className={styles.agencyTag}>General</span>
                  <span className={styles.agencyTag}>Subject</span>
                  <span className={styles.agencyTag}>Professional</span>
                </div>
                <Link href="/classroom?agency=PPSC" className={styles.exploreLink}>
                  Explore Papers <ChevronRight size={14} />
                </Link>
              </div>

              {/* Agency Card: FPSC */}
              <div className={`${styles.agencyCard} ${styles.fpscCard}`}>
                <div className={styles.agencyIconWrapper}>
                  <div className={`${styles.emblemSquare} ${styles.fpscBg}`}>
                    <Compass size={24} className={styles.emblemIcon} />
                  </div>
                </div>
                <div className={styles.agencyInfo}>
                  <h3 className={styles.agencyName}>FPSC</h3>
                  <p className={styles.papersCount}>8,320+ Papers</p>
                </div>
                <div className={styles.agencyTags}>
                  <span className={styles.agencyTag}>CSS</span>
                  <span className={styles.agencyTag}>Subject</span>
                  <span className={styles.agencyTag}>Professional</span>
                </div>
                <Link href="/classroom?agency=FPSC" className={styles.exploreLink}>
                  Explore Papers <ChevronRight size={14} />
                </Link>
              </div>

              {/* Agency Card: NTS */}
              <div className={`${styles.agencyCard} ${styles.ntsCard}`}>
                <div className={styles.agencyIconWrapper}>
                  <div className={`${styles.emblemSquare} ${styles.ntsBg}`}>
                    <FileCheck2 size={24} className={styles.emblemIcon} />
                  </div>
                </div>
                <div className={styles.agencyInfo}>
                  <h3 className={styles.agencyName}>NTS</h3>
                  <p className={styles.papersCount}>5,210+ Papers</p>
                </div>
                <div className={styles.agencyTags}>
                  <span className={styles.agencyTag}>General</span>
                  <span className={styles.agencyTag}>Subject</span>
                </div>
                <Link href="/classroom?agency=NTS" className={styles.exploreLink}>
                  Explore Papers <ChevronRight size={14} />
                </Link>
              </div>

              {/* Agency Card: SPSC */}
              <div className={`${styles.agencyCard} ${styles.spscCard}`}>
                <div className={styles.agencyIconWrapper}>
                  <div className={`${styles.emblemSquare} ${styles.spscBg}`}>
                    <Star size={24} className={styles.emblemIcon} />
                  </div>
                </div>
                <div className={styles.agencyInfo}>
                  <h3 className={styles.agencyName}>SPSC</h3>
                  <p className={styles.papersCount}>3,450+ Papers</p>
                </div>
                <div className={styles.agencyTags}>
                  <span className={styles.agencyTag}>General</span>
                  <span className={styles.agencyTag}>Subject</span>
                </div>
                <Link href="/classroom?agency=SPSC" className={styles.exploreLink}>
                  Explore Papers <ChevronRight size={14} />
                </Link>
              </div>

              {/* Agency Card: KPPSC */}
              <div className={`${styles.agencyCard} ${styles.kppscCard}`}>
                <div className={styles.agencyIconWrapper}>
                  <div className={`${styles.emblemSquare} ${styles.kppscBg}`}>
                    <Award size={24} className={styles.emblemIcon} />
                  </div>
                </div>
                <div className={styles.agencyInfo}>
                  <h3 className={styles.agencyName}>KPPSC</h3>
                  <p className={styles.papersCount}>2,850+ Papers</p>
                </div>
                <div className={styles.agencyTags}>
                  <span className={styles.agencyTag}>General</span>
                  <span className={styles.agencyTag}>Subject</span>
                </div>
                <Link href="/classroom?agency=KPPSC" className={styles.exploreLink}>
                  Explore Papers <ChevronRight size={14} />
                </Link>
              </div>
            </div>
            <button className={styles.sliderArrow} title="Next">
              <ChevronRight size={20} />
            </button>
          </div>
        </section>

        {/* Popular Subjects */}
        <section className={styles.sectionArea}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Popular Subjects</h2>
            <Link href="/classroom" className={styles.sectionLinkAmber}>
              <span>View All Subjects</span>
              <ChevronRight size={16} />
            </Link>
          </div>

          <div className={styles.subjectsGrid}>
            {/* Subject 1 */}
            <Link href="/classroom?subject=General Knowledge" className={styles.subjectBox}>
              <div className={`${styles.subjectIconBox} ${styles.gkIconBg}`}>
                <Star size={18} className={styles.gkIcon} />
              </div>
              <div className={styles.subjectTextBox}>
                <span className={styles.subjectName}>General Knowledge</span>
                <span className={styles.subjectCount}>8,450+ Papers</span>
              </div>
            </Link>

            {/* Subject 2 */}
            <Link href="/classroom?subject=Pakistan Studies" className={styles.subjectBox}>
              <div className={`${styles.subjectIconBox} ${styles.pakIconBg}`}>
                <Compass size={18} className={styles.pakIcon} />
              </div>
              <div className={styles.subjectTextBox}>
                <span className={styles.subjectName}>Pakistan Studies</span>
                <span className={styles.subjectCount}>6,250+ Papers</span>
              </div>
            </Link>

            {/* Subject 3 */}
            <Link href="/classroom?subject=English" className={styles.subjectBox}>
              <div className={`${styles.subjectIconBox} ${styles.engIconBg}`}>
                <BookOpen size={18} className={styles.engIcon} />
              </div>
              <div className={styles.subjectTextBox}>
                <span className={styles.subjectName}>English</span>
                <span className={styles.subjectCount}>5,980+ Papers</span>
              </div>
            </Link>

            {/* Subject 4 */}
            <Link href="/classroom?subject=Mathematics" className={styles.subjectBox}>
              <div className={`${styles.subjectIconBox} ${styles.mathIconBg}`}>
                <Grid size={18} className={styles.mathIcon} />
              </div>
              <div className={styles.subjectTextBox}>
                <span className={styles.subjectName}>Mathematics</span>
                <span className={styles.subjectCount}>4,750+ Papers</span>
              </div>
            </Link>

            {/* Subject 5 */}
            <Link href="/classroom?subject=Current Affairs" className={styles.subjectBox}>
              <div className={`${styles.subjectIconBox} ${styles.caIconBg}`}>
                <Calendar size={18} className={styles.caIcon} />
              </div>
              <div className={styles.subjectTextBox}>
                <span className={styles.subjectName}>Current Affairs</span>
                <span className={styles.subjectCount}>4,120+ Papers</span>
              </div>
            </Link>

            {/* Subject 6 */}
            <Link href="/classroom?subject=Islamic Studies" className={styles.subjectBox}>
              <div className={`${styles.subjectIconBox} ${styles.islamIconBg}`}>
                <Award size={18} className={styles.islamIcon} />
              </div>
              <div className={styles.subjectTextBox}>
                <span className={styles.subjectName}>Islamic Studies</span>
                <span className={styles.subjectCount}>3,850+ Papers</span>
              </div>
            </Link>
          </div>
        </section>

        {/* Papers list */}
        <section className={`${styles.sectionArea} ${styles.papersListSection}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Available Past Papers</h2>
            <span className={styles.resultsBadge}>{filteredPapers.length} Papers found</span>
          </div>

          <div className={styles.papersListStack}>
            {filteredPapers.map(paper => (
              <div key={paper.id} className={styles.listItemRow}>
                <div className={styles.listItemLeft}>
                  <div className={styles.listItemTypeBadge}>{paper.type}</div>
                  <div className={styles.listItemYearBadge}>{paper.year}</div>
                </div>

                <div className={styles.listItemMiddle}>
                  <div className={styles.listItemTitleRow}>
                    <h4 className={styles.listItemTitle}>{paper.title}</h4>
                    {paper.tag && (
                      <span className={`${styles.listItemTag} ${paper.tag === 'Trending' ? styles.trendingTag : ''}`}>
                        {paper.tag}
                      </span>
                    )}
                  </div>
                  <p className={styles.listItemSub}>{paper.subject}</p>
                  
                  <div className={styles.listItemMeta}>
                    <span className={styles.metaLabelItem}>
                      <FileText size={13} /> {paper.mcqIds?.length || 100} MCQs
                    </span>
                    <span className={styles.metaLabelItem}>
                      <Flame size={13} /> {paper.downloads || 0} Attempts
                    </span>
                  </div>
                </div>

                <div className={styles.listItemRight}>
                  <Link 
                    href={`/test-engine?type=past-paper&id=${paper.id}`} 
                    className={`${styles.listItemBtn} ${paper.isPremium ? styles.listItemPremiumBtn : ''}`}
                  >
                    <span>Solve Online</span>
                    {paper.isPremium ? <Lock size={14} /> : <ChevronRight size={15} />}
                  </Link>
                </div>
              </div>
            ))}

            {filteredPapers.length === 0 && (
              <div className={styles.noResultsBox}>
                <p>No papers match your filters. Try resetting filters.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
