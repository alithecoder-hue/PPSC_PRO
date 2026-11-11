'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Flame, Zap, ClipboardList, Clock, BookOpen, Target, Bookmark,
  Briefcase, ArrowRight, Crown, FileText, CalendarDays,
  Minus, Plus, Shield, Search, LayoutDashboard, GraduationCap,
  Brain, Calculator, Coins, Cpu, Flag, FlaskConical, Globe,
  Landmark, Languages, Lightbulb, MoonStar, Newspaper, Scale,
  ScrollText, Sparkles, SpellCheck, LogOut, Check,
} from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { authFetch } from '@/lib/authFetch';
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

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<PremiumData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState<number>(20);
  const [savingGoal, setSavingGoal] = useState(false);
  const [query, setQuery] = useState('');
  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h >= 5 && h < 12 ? 'Good morning' : h >= 12 && h < 17 ? 'Good afternoon' : 'Good evening');
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
        href: '/daily-test',
        cta: 'Take a test',
        done: results.length > 0,
      },
      {
        label: 'Save your first MCQ',
        hint: 'Bookmark questions to revise later',
        href: '/practice-engine',
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
  const ringPct = avgScore ?? 0;
  const ringR = 52;
  const ringC = 2 * Math.PI * ringR;

  const rail = [
    { href: '/dashboard', Icon: LayoutDashboard, label: 'Dashboard', active: true },
    { href: '/classroom', Icon: GraduationCap, label: 'Classroom' },
    { href: '/practice-engine', Icon: BookOpen, label: 'Practice' },
    { href: '/mock-tests', Icon: ClipboardList, label: 'Mock tests' },
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
                <Link href="/daily-test" className={styles.ghostBtn}>
                  Today&apos;s test
                </Link>
              </div>
            </div>
          </motion.section>

          <motion.aside
            className={avgScore === null ? styles.readinessEmpty : styles.readinessCard}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.06, ease: 'easeOut' }}
          >
            {avgScore === null ? (
              <>
                <p className={styles.readinessLabelDark}>READINESS</p>
                <div className={styles.emptyRing}>
                  <Target size={34} />
                </div>
                <p className={styles.emptyTitle}>Not measured yet</p>
                <p className={styles.emptyText}>
                  Take a short test and your readiness score will appear here.
                </p>
                <Link href="/daily-test" className={styles.primaryBtn}>
                  Take your first test <ArrowRight size={16} />
                </Link>
              </>
            ) : (
              <>
                <p className={styles.readinessLabel}>READINESS</p>
                <div className={styles.gaugeWrap}>
                  <svg viewBox="0 0 120 120" className={styles.gauge} role="img" aria-label={`Readiness ${avgScore} percent`}>
                    <circle cx="60" cy="60" r={ringR} className={styles.gaugeTrack} />
                    <circle
                      cx="60"
                      cy="60"
                      r={ringR}
                      className={styles.gaugeFill}
                      strokeDasharray={ringC}
                      strokeDashoffset={ringC - (ringC * ringPct) / 100}
                    />
                  </svg>
                  <div className={styles.gaugeCenter}>
                    <span>{avgScore}%</span>
                  </div>
                </div>
                <p className={styles.readinessCondition}>
                  Condition: <strong>{readinessLabel(avgScore)}</strong>
                </p>
                <div className={styles.readinessStats}>
                  <div>
                    <span>{user?.testsTaken ?? 0}</span>
                    <p>Tests taken</p>
                  </div>
                  <div>
                    <span>{bestScore === null ? '—' : `${bestScore}%`}</span>
                    <p>Best score</p>
                  </div>
                  <div>
                    <span>{user?.xp ?? 0}</span>
                    <p>XP earned</p>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </div>

        {/* Content stats strip */}
        <motion.section
          className={styles.statStrip}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.12, ease: 'easeOut' }}
        >
          {[
            { value: '1,271', label: 'MCQs in bank' },
            { value: '16', label: 'Subjects' },
            { value: '575', label: 'Subtopics' },
            { value: '103', label: 'Notes ready' },
          ].map((s) => (
            <div key={s.label} className={styles.statTile}>
              <span>{s.value}</span>
              <p>{s.label}</p>
            </div>
          ))}
        </motion.section>

        {/* Subject grid */}
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18, ease: 'easeOut' }}
        >
          <div className={styles.sectionHead}>
            <h2>SUBJECTS</h2>
            <span>{filteredSubjects.length} of 16 shown</span>
          </div>
          {filteredSubjects.length === 0 ? (
            <div className={styles.emptyGrid}>No subject matches “{query}”.</div>
          ) : (
            <div className={styles.subjectGrid}>
              {filteredSubjects.map((s) => (
                <Link key={s.slug} href={`/classroom?subject=${s.slug}`} className={styles.subjectTile}>
                  <span className={styles.subjectThumb}>
                    <img src={`/images/subjects/${s.slug}.jpg`} alt={s.name} loading="lazy" />
                    <span className={`${styles.subjectStatus} ${s.notesReady ? styles.statusReady : styles.statusSoon}`}>
                      {s.notesReady ? 'Notes ready' : 'Notes soon'}
                    </span>
                  </span>
                  <span className={styles.subjectBody}>
                    <span className={styles.subjectName}>{s.name}</span>
                    <span className={styles.subjectMeta}>{s.mcqs} MCQs</span>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </motion.section>

        {/* Bottom grid */}
        <div className={styles.bottomGrid}>
          <motion.section
            className={styles.card}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.24, ease: 'easeOut' }}
          >
            <div className={styles.cardHead}>
              <h3>
                <Target size={18} /> Your first steps
              </h3>
              <span className={styles.stepsProgress}>{doneCount} of 3 done</span>
            </div>
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
          </motion.section>

          <motion.section
            className={styles.card}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.3, ease: 'easeOut' }}
          >
            <div className={styles.cardHead}>
              <h3>
                <FileText size={18} /> Recent tests
              </h3>
              <Link href="/mock-tests" className={styles.cardLink}>
                All tests <ArrowRight size={14} />
              </Link>
            </div>
            {results.length === 0 ? (
              <div className={styles.empty}>
                <p>No tests taken yet.</p>
                <Link href="/daily-test" className={styles.emptyCta}>
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
          </motion.section>

          <motion.section
            className={styles.card}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.36, ease: 'easeOut' }}
          >
            <div className={styles.cardHead}>
              <h3>
                <Briefcase size={18} /> Tracked jobs
              </h3>
              <Link href="/jobs" className={styles.cardLink}>
                Browse jobs <ArrowRight size={14} />
              </Link>
            </div>
            {jobs.length === 0 ? (
              <div className={styles.empty}>
                <p>You aren&apos;t tracking any jobs yet.</p>
                <Link href="/jobs" className={styles.emptyCta}>
                  Find PPSC openings to track <ArrowRight size={15} />
                </Link>
              </div>
            ) : (
              <ul className={styles.jobList}>
                {jobs.map((j) => (
                  <li key={j.id} className={styles.jobRow}>
                    <div>
                      <p className={styles.jobTitle}>{j.title}</p>
                      <p className={styles.jobMeta}>{j.organization}</p>
                    </div>
                    <span className={styles.deadline}>
                      <CalendarDays size={14} /> {daysLeftLabel(j.deadline)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.section>

          <motion.section
            className={styles.card}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.42, ease: 'easeOut' }}
          >
            <div className={styles.cardHead}>
              <h3>
                <Target size={18} /> Today&apos;s goal
              </h3>
            </div>
            <p className={styles.goalText}>How many MCQs will you finish today?</p>
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
            <p className={styles.goalHint}>{savingGoal ? 'Saving…' : 'Saved automatically'}</p>
            <div className={styles.miniStats}>
              <div className={styles.miniStat}>
                <Bookmark size={16} />
                <div>
                  <strong>{data?.stats.savedMcqs ?? 0}</strong>
                  <span>Saved MCQs</span>
                </div>
              </div>
              <div className={styles.miniStat}>
                <Clock size={16} />
                <div>
                  <strong>{user?.hoursStudied ?? 0}h</strong>
                  <span>Studied</span>
                </div>
              </div>
            </div>
            <div className={styles.quickGrid}>
              <Link href="/practice-engine" className={styles.quickBtn}>
                <BookOpen size={16} /> Practice
              </Link>
              <Link href="/mock-tests" className={styles.quickBtn}>
                <ClipboardList size={16} /> Mock tests
              </Link>
              <Link href="/past-papers" className={styles.quickBtn}>
                <FileText size={16} /> Past papers
              </Link>
              <Link href="/subscription" className={styles.quickBtn}>
                <Crown size={16} /> Subscription
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
