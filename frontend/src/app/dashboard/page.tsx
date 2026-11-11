'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Flame, Zap, ClipboardList, Clock, BookOpen, Target, Bookmark,
  Briefcase, ArrowRight, Crown, FileText, CalendarDays, GraduationCap,
  Minus, Plus, Shield,
} from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { authFetch } from '@/lib/authFetch';
import styles from './dashboard.module.css';

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

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function daysLeft(deadline: string): string {
  const diff = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
  if (diff < 0) return 'Deadline passed';
  if (diff === 0) return 'Due today';
  if (diff === 1) return '1 day left';
  return `${diff} days left`;
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<PremiumData | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [goal, setGoal] = useState<number>(20);
  const [savingGoal, setSavingGoal] = useState(false);

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

  if (loading) {
    return (
      <div className={styles.page}>
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
  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
    : null;
  const results = profile?.results ?? [];
  const jobs = data?.trackedJobs ?? [];

  const stats = [
    { icon: Flame, label: 'Day streak', value: String(user?.streak ?? 0), tint: styles.tintAmber },
    { icon: Zap, label: 'XP earned', value: String(user?.xp ?? 0), tint: styles.tintBlue },
    { icon: ClipboardList, label: 'Tests taken', value: String(user?.testsTaken ?? 0), tint: styles.tintGreen },
    { icon: Clock, label: 'Hours studied', value: String(user?.hoursStudied ?? 0), tint: styles.tintPurple },
  ];

  return (
    <div className={styles.page}>
      <motion.section
        className={styles.hero}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div>
          <p className={styles.heroDate}>{today}</p>
          <h1 className={styles.heroTitle}>
            {greeting()}, {firstName}
          </h1>
          <p className={styles.heroSub}>
            {memberSince ? `Member since ${memberSince} · ` : ''}Your preparation, all in one place.
          </p>
        </div>
        <div className={styles.heroChips}>
          <span className={styles.chip}>
            <Flame size={15} /> {user?.streak ?? 0}-day streak
          </span>
          <span className={styles.chip}>
            <Zap size={15} /> {user?.xp ?? 0} XP
          </span>
          {isPremium ? (
            <span className={`${styles.chip} ${styles.chipGold}`}>
              <Crown size={15} /> {isAdmin ? 'Admin' : 'Premium'}
            </span>
          ) : (
            <Link href="/subscription" className={`${styles.chip} ${styles.chipGold} ${styles.chipLink}`}>
              <Crown size={15} /> Free · Upgrade
            </Link>
          )}
        </div>
      </motion.section>

      <motion.section
        className={styles.continueCard}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.06, ease: 'easeOut' }}
      >
        <div className={styles.continueIcon}>
          <GraduationCap size={26} />
        </div>
        <div className={styles.continueText}>
          <h2>Continue studying</h2>
          <p>Notes, MCQs and mock tests across all 16 subjects — pick up right where you left off.</p>
        </div>
        <div className={styles.continueActions}>
          <Link href="/classroom" className={styles.primaryBtn}>
            Open classroom <ArrowRight size={16} />
          </Link>
          <Link href="/daily-test" className={styles.ghostBtn}>
            Today&apos;s test
          </Link>
        </div>
      </motion.section>

      <motion.section
        className={styles.statGrid}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12, ease: 'easeOut' }}
      >
        {stats.map((s) => (
          <div key={s.label} className={styles.statCard}>
            <span className={`${styles.statIcon} ${s.tint}`}>
              <s.icon size={19} />
            </span>
            <span className={styles.statValue}>{s.value}</span>
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </motion.section>

      <div className={styles.mainGrid}>
        <motion.div
          className={styles.column}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.18, ease: 'easeOut' }}
        >
          <section className={styles.card}>
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
                <Link href="/daily-test" className={styles.textLink}>
                  Take your first daily test →
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
                      {r.score}<span className={styles.scoreTotal}>/{r.total}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={styles.card}>
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
                <Link href="/jobs" className={styles.textLink}>
                  Find PPSC openings to track →
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
                      <CalendarDays size={14} /> {daysLeft(j.deadline)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </motion.div>

        <motion.div
          className={styles.column}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.24, ease: 'easeOut' }}
        >
          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h3>
                <Target size={18} /> Today&apos;s goal
              </h3>
            </div>
            <p className={styles.goalText}>
              How many MCQs will you finish today?
            </p>
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
                <BookOpen size={16} />
                <div>
                  <strong>{data?.stats.pendingTodos ?? 0}</strong>
                  <span>Tasks to do</span>
                </div>
              </div>
            </div>
          </section>

          <section className={styles.card}>
            <div className={styles.cardHead}>
              <h3>
                <Zap size={18} /> Quick actions
              </h3>
            </div>
            <div className={styles.quickGrid}>
              <Link href="/practice-engine" className={styles.quickBtn}>
                <BookOpen size={17} /> Practice
              </Link>
              <Link href="/mock-tests" className={styles.quickBtn}>
                <ClipboardList size={17} /> Mock tests
              </Link>
              <Link href="/past-papers" className={styles.quickBtn}>
                <FileText size={17} /> Past papers
              </Link>
              <Link href="/subscription" className={styles.quickBtn}>
                <Crown size={17} /> Subscription
              </Link>
            </div>
            {isAdmin && (
              <Link href="/admin" className={styles.adminLink}>
                <Shield size={15} /> Open admin panel <ArrowRight size={14} />
              </Link>
            )}
          </section>
        </motion.div>
      </div>
    </div>
  );
}
