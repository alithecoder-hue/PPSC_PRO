'use client';

import React, { useEffect, useMemo, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Flame, Zap, ClipboardList, Clock, BookOpen, Target, Bookmark,
  Briefcase, ArrowRight, Crown, FileText, CalendarDays,
  Minus, Plus, Shield, Search, LayoutDashboard, GraduationCap,
  Brain, Calculator, Coins, Cpu, Flag, FlaskConical, Globe,
  Landmark, Languages, Lightbulb, MoonStar, Newspaper, Scale,
  ScrollText, Sparkles, SpellCheck, LogOut, Check, X,
} from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { authFetch } from '@/lib/authFetch';
import CommandPalette from './CommandPalette';
import styles from './dashboard.module.css';

/* ---------- Real content data (verified against the MCQ bank) ---------- */

interface SubjectTile {
  slug: string;
  name: string;
  mcqs: number;
  notesReady: boolean;
  Icon: React.ComponentType<{ size?: number | string; className?: string }>;
}

const SUBJECTS: SubjectTile[] = [
  { slug: 'general', name: 'General', mcqs: 60, notesReady: false, Icon: Lightbulb },
  { slug: 'pakistan-studies', name: 'Pakistan Studies', mcqs: 91, notesReady: false, Icon: Landmark },
  { slug: 'islamic-studies', name: 'Islamic Studies', mcqs: 90, notesReady: false, Icon: MoonStar },
  { slug: 'current-affairs', name: 'Current Affairs', mcqs: 70, notesReady: false, Icon: Newspaper },
  { slug: 'english', name: 'English', mcqs: 90, notesReady: false, Icon: SpellCheck },
  { slug: 'urdu', name: 'Urdu', mcqs: 80, notesReady: false, Icon: Languages },
  { slug: 'everyday-science', name: 'Everyday Science', mcqs: 90, notesReady: false, Icon: FlaskConical },
  { slug: 'basic-mathematics', name: 'Basic Mathematics', mcqs: 80, notesReady: false, Icon: Calculator },
  { slug: 'geography', name: 'Geography', mcqs: 80, notesReady: false, Icon: Globe },
  { slug: 'computer-studies', name: 'Computer Studies', mcqs: 90, notesReady: true, Icon: Cpu },
  { slug: 'logical-reasoning', name: 'Logical Reasoning', mcqs: 70, notesReady: false, Icon: Brain },
  { slug: 'pakistan-affairs', name: 'Pakistan Affairs', mcqs: 70, notesReady: false, Icon: Flag },
  { slug: 'economics', name: 'Economics', mcqs: 70, notesReady: false, Icon: Coins },
  { slug: 'history', name: 'History', mcqs: 70, notesReady: false, Icon: ScrollText },
  { slug: 'civics-constitution', name: 'Civics & Constitution', mcqs: 80, notesReady: false, Icon: Scale },
  { slug: 'general-knowledge', name: 'General Knowledge', mcqs: 90, notesReady: false, Icon: GraduationCap },
];

interface TrackedJob {
  id: number;
  title: string;
  organization: string;
  deadline: string;
}

interface PremiumData {
  user: {
    name: string;
    email: string;
    role: string;
    xp: number;
    streak: number;
    testsTaken: number;
    hoursStudied: number;
    createdAt: string;
    dailyGoalTarget: number;
  };
  stats: { savedMcqs: number; totalTodos: number; pendingTodos: number };
  trackedJobs: TrackedJob[];
  dailyGoal: { target: number; completed: number };
}

interface TestResult {
  id: number;
  score: number;
  total: number;
  completedAt: string;
  exam: { title: string } | null;
}

interface ProfileData {
  name: string;
  email: string;
  role: string;
  subscriptions: { plan: string }[];
  results: TestResult[];
}

function daysLeft(deadline: string): number {
  return Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
}

function daysLeftLabel(deadline: string): string {
  const diff = daysLeft(deadline);
  if (diff < 0) return 'Deadline passed';
  if (diff === 0) return 'Due today';
  if (diff === 1) return '1 day left';
  return `${diff} days left`;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function readinessLabel(avg: number | null): string {
  if (avg === null) return 'No tests yet';
  if (avg >= 70) return 'Good';
  if (avg >= 50) return 'Building';
  return 'Needs work';
}

/* Monochrome sparkline (Stripe-style): 88x24, navy stroke, soft area fill.
   All-equal input centres the line; all-zero input sits on the baseline. */
function StripSpark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 88;
    const y = max === 0 ? 21 : max === min ? 12 : 21 - ((v - min) / range) * 18;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = pts.join(' ');
  return (
    <svg viewBox="0 0 88 24" width="88" height="24" aria-hidden="true" className={styles.stripSpark}>
      <polygon points={`0,24 ${line} 88,24`} fill="rgba(18,38,63,0.07)" />
      <polyline points={line} fill="none" stroke="#12263f" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* useSearchParams() needs a Suspense boundary at build time (same pattern
   as the classroom). The inner component does the real work. */
function DashboardContent() {
  const router = useRouter();
  const [data, setData] = useState<PremiumData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState<number>(20);
  const [savingGoal, setSavingGoal] = useState(false);
  const [query, setQuery] = useState('');
  const [greeting, setGreeting] = useState('Welcome back');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [payDismissed, setPayDismissed] = useState(false);
  const searchParams = useSearchParams();
  const paySubmitted = searchParams.get('payment') === 'submitted';

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h >= 5 && h < 12 ? 'Good morning' : h >= 12 && h < 17 ? 'Good afternoon' : 'Good evening');
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login');
      return;
    }
    Promise.all([
      authFetch(`${API_BASE}/api/premium/me`).then((r) => (r.ok ? r.json() : null)),
      authFetch(`${API_BASE}/api/auth/me`).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([premium, prof]) => {
        if (!premium && !prof) {
          router.replace('/login');
          return;
        }
        if (premium) {
          setData(premium);
          setGoal(premium.dailyGoal?.target || premium.user?.dailyGoalTarget || 20);
        }
        if (prof) setProfile(prof);
      })
      .catch(() => router.replace('/login'))
      .finally(() => setLoading(false));
  }, [router]);

  const changeGoal = async (next: number) => {
    const clamped = Math.min(100, Math.max(5, next));
    setGoal(clamped);
    setSavingGoal(true);
    try {
      await authFetch(`${API_BASE}/api/auth/me/goal`, {
        method: 'PUT',
        body: JSON.stringify({ target: clamped }),
      });
    } finally {
      setSavingGoal(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    window.dispatchEvent(new Event('mm-auth-change'));
    router.push('/');
  };

  const results = useMemo(() => profile?.results ?? [], [profile]);
  const jobs = useMemo(() => data?.trackedJobs ?? [], [data]);

  const steps = useMemo(
    () => [
      {
        label: 'Take your first test',
        hint: 'See your first readiness score',
        href: '/classroom?tab=test&daily=1',
        cta: 'Take a test',
        done: results.length > 0,
      },
      {
        label: 'Save your first MCQ',
        hint: 'Bookmark questions to revise later',
        href: '/classroom?tab=practice',
        cta: 'Practise',
        done: (data?.stats.savedMcqs ?? 0) > 0,
      },
      {
        label: 'Track your first job',
        hint: 'Never miss a PPSC deadline',
        href: '/jobs',
        cta: 'Browse jobs',
        done: jobs.length > 0,
      },
    ],
    [results, data, jobs]
  );
  const doneCount = steps.filter((s) => s.done).length;

  const avgScore = useMemo(() => {
    if (results.length === 0) return null;
    const summed = results.reduce((acc, r) => acc + (r.total > 0 ? r.score / r.total : 0), 0);
    return Math.round((summed / results.length) * 100);
  }, [results]);

  const bestScore = useMemo(() => {
    if (results.length === 0) return null;
    return Math.max(...results.map((r) => (r.total > 0 ? Math.round((r.score / r.total) * 100) : 0)));
  }, [results]);

  const nearestJob = useMemo(() => {
    const upcoming = jobs.filter((j) => daysLeft(j.deadline) >= 0).sort((a, b) => daysLeft(a.deadline) - daysLeft(b.deadline));
    return upcoming[0] ?? null;
  }, [jobs]);

  const insight = useMemo(() => {
    if (nearestJob && daysLeft(nearestJob.deadline) <= 14) {
      return `Your ${nearestJob.title} deadline is in ${daysLeft(nearestJob.deadline)} days — take a mock test this week to check where you stand.`;
    }
    if (avgScore !== null && avgScore < 60) {
      const weakest = [...results].sort((a, b) => a.score / a.total - b.score / b.total)[0];
      return `Your recent average is ${avgScore}%. Your weakest test was ${weakest.exam?.title ?? 'a practice session'} (${weakest.score}/${weakest.total}) — review it before your next mock.`;
    }
    if ((data?.user.streak ?? 0) >= 3) {
      return `You're on a ${data?.user.streak}-day streak — keep it alive with today's ${goal} MCQs.`;
    }
    if (avgScore !== null) {
      return `Your recent average is ${avgScore}% — solid. Take today's test to push it higher.`;
    }
    return 'Start with Computer Studies — full notes and 90 MCQs are ready. The other 15 subjects are on the way.';
  }, [nearestJob, avgScore, results, data, goal]);

  /* 5-number strip (design #4): personal numbers only, derived from real
     results — never the catalogue counts, never invented figures. */
  const strip = useMemo(() => {
    const sorted = [...results].sort(
      (a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime()
    );
    const weekAgo = Date.now() - 7 * 86400000;
    const weekResults = sorted.filter((r) => new Date(r.completedAt).getTime() >= weekAgo);
    const weekMcqs = weekResults.reduce((acc, r) => acc + (r.total || 0), 0);
    // Daily MCQs for the last 7 days (oldest -> today) for the sparkline.
    const daily: number[] = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(Date.now() - (6 - i) * 86400000);
      const key = day.toDateString();
      return sorted
        .filter((r) => new Date(r.completedAt).toDateString() === key)
        .reduce((acc, r) => acc + (r.total || 0), 0);
    });
    const scoreSeries = sorted
      .slice(-10)
      .map((r) => (r.total > 0 ? Math.round((r.score / r.total) * 100) : 0));
    // Weakest area: lowest average score grouped by exam title.
    const byTitle = new Map<string, { sum: number; n: number }>();
    sorted.forEach((r) => {
      const t = (r.exam?.title ?? 'Practice session').trim();
      const cur = byTitle.get(t) ?? { sum: 0, n: 0 };
      cur.sum += r.total > 0 ? (r.score / r.total) * 100 : 0;
      cur.n += 1;
      byTitle.set(t, cur);
    });
    const weakest = Array.from(byTitle.entries()).reduce<{ title: string; avg: number } | null>(
      (best, [title, v]) => {
        const avg = Math.round(v.sum / v.n);
        return !best || avg < best.avg ? { title, avg } : best;
      },
      null
    );
    return { weekMcqs, weekTests: weekResults.length, daily, scoreSeries, weakest };
  }, [results]);

  const filteredSubjects = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SUBJECTS;
    return SUBJECTS.filter((s) => s.name.toLowerCase().includes(q));
  }, [query]);

  if (loading) {
    return (
      <div className={styles.shell}>
        <div className={styles.loading}>Loading your dashboard…</div>
      </div>
    );
  }

  const user = data?.user;
  const firstName = (user?.name || profile?.name || 'there').split(' ')[0];
  const isAdmin = (user?.role || profile?.role) === 'ADMIN';
  const isPremium =
    isAdmin ||
    (user?.role || profile?.role) === 'PREMIUM' ||
    (profile?.subscriptions?.length ?? 0) > 0;

  const rail = [
    { href: '/dashboard', Icon: LayoutDashboard, label: 'Dashboard', active: true },
    { href: '/classroom', Icon: GraduationCap, label: 'Classroom' },
    { href: '/classroom?tab=practice', Icon: BookOpen, label: 'Practice' },
    { href: '/classroom?tab=test', Icon: ClipboardList, label: 'Mock tests' },
    { href: '/past-papers', Icon: FileText, label: 'Past papers' },
    { href: '/jobs', Icon: Briefcase, label: 'Jobs' },
    { href: '/subscription', Icon: Crown, label: 'Subscription' },
  ];

  return (
    <div className={styles.shell}>
      {/* Left icon rail */}
      <nav className={styles.rail} aria-label="Dashboard sections">
        {rail.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.railBtn} ${item.active ? styles.railActive : ''}`}
            title={item.label}
            aria-label={item.label}
          >
            <item.Icon size={20} />
          </Link>
        ))}
        {isAdmin && (
          <Link href="/admin" className={styles.railBtn} title="Admin panel" aria-label="Admin panel">
            <Shield size={20} />
          </Link>
        )}
      </nav>

      <div className={styles.main}>
        {/* App header */}
        <header className={styles.appHeader}>
          <Link href="/" className={styles.brand}>
            <Image src="/images/logo.png" alt="Merit Master" width={34} height={34} />
            <span className={styles.brandWord}>
              <span className={styles.brandMerit}>MERIT</span>{' '}
              <span className={styles.brandMaster}>MASTER</span>
            </span>
          </Link>
          <select
            className={styles.subjectSelect}
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) router.push(`/classroom?subject=${e.target.value}`);
            }}
            aria-label="Jump to a subject"
          >
            <option value="" disabled>
              Jump to a subject…
            </option>
            {SUBJECTS.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>
          <div className={styles.searchBox}>
            <Search size={16} />
            <input
              type="text"
              placeholder="Search subjects…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search subjects"
            />
            <button
              type="button"
              className={styles.kbdBtn}
              onClick={() => setPaletteOpen(true)}
              title="Search everything (Ctrl+K)"
              aria-label="Open command palette"
            >
              ⌘K
            </button>
          </div>
          <span className={styles.userChip}>
            <span className={styles.avatar} title={user?.name || profile?.name || ''}>
              {firstName.charAt(0).toUpperCase()}
            </span>
            <span className={styles.userName}>{firstName}</span>
          </span>
          <button type="button" className={styles.logoutBtn} onClick={handleLogout} title="Log out" aria-label="Log out">
            <LogOut size={17} />
          </button>
        </header>

        {/* Post-payment banner (billing redirects here after a payment is submitted) */}
        {paySubmitted && !payDismissed && (
          <div className={styles.payBanner} role="status">
            <span className={styles.payBannerIcon}>
              <Check size={17} />
            </span>
            <p>
              <strong>Payment submitted.</strong> We will verify it and activate Premium,
              usually within 24 hours. You can keep studying on the free plan meanwhile.
            </p>
            <button type="button" onClick={() => setPayDismissed(true)} aria-label="Dismiss notification">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Heading + status pills */}
        <div className={styles.headingRow}>
          <div>
            <h1 className={styles.title}>
              {greeting}, {firstName}
            </h1>
            <p className={styles.subtitle}>Here is where your preparation stands today.</p>
          </div>
          <div className={styles.pills}>
            <span className={`${styles.pill} ${styles.pillOk}`}>Computer Studies · Notes ready</span>
            <span className={styles.pill}>
              <Flame size={13} /> {user?.streak ?? 0}-day streak
            </span>
            <span className={styles.pill}>{isPremium ? (isAdmin ? 'Admin' : 'Premium plan') : 'Free plan'}</span>
            <span className={styles.pill}>1,271 MCQs in bank</span>
          </div>
        </div>

        {/* Hero + readiness */}
        <div className={styles.heroGrid}>
          <motion.section
            className={styles.heroCard}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <div className={styles.heroVisual}>
              <div className={styles.heroGlow} aria-hidden="true" />
              <span className={styles.heroTag}>Featured · Computer Studies</span>
              <div className={styles.heroCopy}>
                <p className={styles.heroKicker}>Your first subject is ready</p>
                <p className={styles.heroStats}>90 MCQs · 103 notes · 22 topics</p>
              </div>
            </div>
            <div className={styles.heroBody}>
              <div className={styles.assistantHead}>
                <span className={styles.assistantIcon}>
                  <Sparkles size={17} />
                </span>
                <div>
                  <p className={styles.assistantTitle}>Merit AI</p>
                  <p className={styles.assistantSub}>Your study assistant</p>
                </div>
              </div>
              <p className={styles.assistantText}>
                Hi {firstName}, {insight}
              </p>
              <div className={styles.heroActions}>
                <Link href="/classroom" className={styles.primaryBtn}>
                  Open classroom <ArrowRight size={16} />
                </Link>
                <Link href="/classroom?tab=test&daily=1" className={styles.ghostBtn}>
                  Today&apos;s test
                </Link>
              </div>
            </div>
          </motion.section>

        </div>

        {/* 5-number strip — your numbers, not the catalogue's */}
        <motion.section
          className={styles.statStrip}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12, ease: 'easeOut' }}
          aria-label="Your preparation at a glance"
        >
          <div className={styles.statTile}>
            <p className={styles.stripLabel}>Readiness</p>
            <span className={styles.stripValue}>{avgScore === null ? '—' : `${avgScore}%`}</span>
            <p className={styles.stripSub}>{readinessLabel(avgScore)}</p>
            <StripSpark values={strip.scoreSeries} />
          </div>
          <div className={styles.statTile}>
            <p className={styles.stripLabel}>MCQs this week</p>
            <span className={styles.stripValue}>{strip.weekMcqs}</span>
            <p className={styles.stripSub}>
              {strip.weekTests === 0
                ? 'No tests this week'
                : `${strip.weekTests} test${strip.weekTests === 1 ? '' : 's'} this week`}
            </p>
            <StripSpark values={strip.daily} />
          </div>
          <div className={styles.statTile}>
            <p className={styles.stripLabel}>Streak</p>
            <span className={styles.stripValue}>{user?.streak ?? 0}d</span>
            <p className={styles.stripSub}>
              {(user?.streak ?? 0) >= 2 ? 'Keep it alive today' : 'Take a test to start one'}
            </p>
            <span className={styles.streakDots} aria-hidden="true">
              {Array.from({ length: 7 }, (_, i) => (
                <i key={i} className={i < Math.min(user?.streak ?? 0, 7) ? styles.dotOn : ''} />
              ))}
            </span>
          </div>
          <div className={styles.statTile}>
            <p className={styles.stripLabel}>Weakest area</p>
            <span className={`${styles.stripValue} ${styles.stripValueSm}`}>
              {strip.weakest ? strip.weakest.title.slice(0, 18) : '—'}
            </span>
            <p className={styles.stripSub}>
              {strip.weakest ? `${strip.weakest.avg}% average — revise it` : 'Take a test to find it'}
            </p>
            {strip.weakest && (
              <span className={styles.stripBar} aria-hidden="true">
                <i style={{ width: `${strip.weakest.avg}%` }} />
              </span>
            )}
          </div>
          <div className={styles.statTile}>
            <p className={styles.stripLabel}>Next deadline</p>
            <span className={styles.stripValue}>{nearestJob ? `${daysLeft(nearestJob.deadline)}d` : '—'}</span>
            <p className={styles.stripSub}>
              {nearestJob
                ? `${nearestJob.title.slice(0, 24)} · ${shortDate(nearestJob.deadline)}`
                : 'No jobs tracked yet'}
            </p>
            {nearestJob && daysLeft(nearestJob.deadline) <= 7 && (
              <span className={`${styles.stripBadge} ${styles.stripBadgeWarn}`}>Due within a week</span>
            )}
          </div>
        </motion.section>

        {/* Continue studying — one row, not a 16-tile grid of boxes */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18, ease: 'easeOut' }}
        >
          <div className={styles.sectionHead}>
            <h2>CONTINUE STUDYING</h2>
            <Link href="/classroom" className={styles.cardLink}>
              All subjects <ArrowRight size={14} />
            </Link>
          </div>
          <Link href="/classroom?subject=computer-studies" className={styles.continueRow}>
            <span className={styles.continueThumb}>
              <img src="/images/subjects/computer-studies.jpg" alt="Computer Studies" loading="lazy" />
            </span>
            <span className={styles.continueBody}>
              <span className={styles.continueName}>Computer Studies</span>
              <span className={styles.continueMeta}>90 MCQs · 103 notes · 22 topics — notes ready</span>
            </span>
            <span className={styles.continueCta}>
              Open classroom <ArrowRight size={15} />
            </span>
          </Link>
          {query.trim() !== '' &&
            (filteredSubjects.length === 0 ? (
              <div className={styles.emptyGrid}>No subject matches “{query}”.</div>
            ) : (
              <ul className={styles.subjectList}>
                {filteredSubjects.map((sub) => (
                  <li key={sub.slug}>
                    <Link href={`/classroom?subject=${sub.slug}`} className={styles.subjectListRow}>
                      <sub.Icon size={17} />
                      <span className={styles.subjectListName}>{sub.name}</span>
                      <span className={styles.subjectListMeta}>
                        {sub.mcqs} MCQs · {sub.notesReady ? 'Notes ready' : 'Notes soon'}
                      </span>
                      <ArrowRight size={15} />
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
        </motion.section>

        {/* Up next — plain columns, no card boxes */}
        <div className={styles.upNext}>
          <motion.section
            className={styles.upNextCol}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.24, ease: 'easeOut' }}
          >
            <h3 className={styles.upNextHead}>
              <Target size={18} /> Your first steps
              <span className={styles.stepsProgress}>{doneCount} of 3 done</span>
            </h3>
            <ul className={styles.stepsList}>
              {steps.map((st, i) => (
                <li key={st.label} className={styles.stepRow}>
                  <span className={`${styles.stepCheck} ${st.done ? styles.stepDone : ''}`}>
                    {st.done ? <Check size={15} /> : <span>{i + 1}</span>}
                  </span>
                  <div className={styles.stepText}>
                    <p className={styles.stepLabel}>{st.label}</p>
                    <p className={styles.stepHint}>{st.hint}</p>
                  </div>
                  {st.done ? (
                    <span className={styles.stepDoneLabel}>Done</span>
                  ) : (
                    <Link href={st.href} className={styles.cardLink}>
                      {st.cta} <ArrowRight size={14} />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <div className={styles.goalRow}>
              <span>Today&apos;s goal</span>
              <div className={styles.stepper}>
                <button
                  type="button"
                  aria-label="Lower daily goal"
                  onClick={() => changeGoal(goal - 5)}
                  disabled={savingGoal || goal <= 5}
                >
                  <Minus size={16} />
                </button>
                <span className={styles.goalValue}>
                  {goal} <span>MCQs</span>
                </span>
                <button
                  type="button"
                  aria-label="Raise daily goal"
                  onClick={() => changeGoal(goal + 5)}
                  disabled={savingGoal || goal >= 100}
                >
                  <Plus size={16} />
                </button>
              </div>
              <span className={styles.goalHint}>{savingGoal ? 'Saving…' : 'Saved'}</span>
            </div>
          </motion.section>

          <motion.section
            className={styles.upNextCol}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3, ease: 'easeOut' }}
          >
            <h3 className={styles.upNextHead}>
              <FileText size={18} /> Recent tests
              <Link href="/classroom?tab=test" className={styles.cardLink}>
                All tests <ArrowRight size={14} />
              </Link>
            </h3>
            {results.length === 0 ? (
              <div className={styles.empty}>
                <p>No tests taken yet.</p>
                <Link href="/classroom?tab=test&daily=1" className={styles.emptyCta}>
                  Take your first daily test <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <ul className={styles.resultList}>
                {results.slice(0, 5).map((r) => (
                  <li key={r.id} className={styles.resultRow}>
                    <div>
                      <p className={styles.resultTitle}>{r.exam?.title ?? 'Practice session'}</p>
                      <p className={styles.resultMeta}>{shortDate(r.completedAt)}</p>
                    </div>
                    <span className={styles.score}>
                      {r.score}
                      <span className={styles.scoreTotal}>/{r.total}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <p className={styles.jobsLine}>
              <Briefcase size={15} />
              {jobs.length === 0 ? (
                <>No jobs tracked yet — <Link href="/jobs">Browse PPSC openings</Link> to track one</>
              ) : (
                <>{jobs.length} job{jobs.length === 1 ? '' : 's'} tracked — <Link href="/jobs">View jobs</Link></>
              )}
            </p>
          </motion.section>
        </div>
      </div>
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} subjects={SUBJECTS} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className={styles.shell}><div className={styles.loading}>Loading your dashboard…</div></div>}>
      <DashboardContent />
    </Suspense>
  );
}
