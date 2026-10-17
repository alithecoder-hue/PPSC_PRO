'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, CheckSquare, Bookmark, BarChart, Target, Briefcase, Flame, Zap, FileText, Clock, BookOpen, Activity, ArrowRight, Shield, Globe, TrendingUp, Layers, List } from 'lucide-react';
import { API_BASE } from '@/lib/api';
import { authFetch } from '@/lib/authFetch';
import NewsTicker from './NewsTicker';
import styles from './premium-dashboard.module.css';

interface DashboardData {
  user: { name: string; xp: number; streak: number; testsTaken: number; hoursStudied: number; avgScore?: number };
  stats: { savedMcqs: number; totalTodos: number; pendingTodos: number };
  trackedJobs: { id: number; title: string; organization: string; deadline: string }[];
  dailyGoal: { target: number; completed: number };
}

export default function PremiumDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const userName = typeof window !== 'undefined' ? localStorage.getItem('userName') || 'there' : 'there';
  const [activeJob, setActiveJob] = useState<any>(null);
  const [showJobSelector, setShowJobSelector] = useState(false);
  const [allJobs, setAllJobs] = useState<any[]>([]);

  const fetchAllJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/jobs`);
      if (res.ok) {
        setAllJobs(await res.json());
      } else {
        throw new Error('Fallback');
      }
    } catch {
      setAllJobs([
        { id: 1, title: 'Lecturer Computer Science', organization: 'PPSC' },
        { id: 2, title: 'Sub-Inspector Police', organization: 'PPSC' },
        { id: 3, title: 'Assistant Director NAB', organization: 'FPSC' },
        { id: 4, title: 'Tehsildar', organization: 'PPSC' },
        { id: 5, title: 'Inspector Customs', organization: 'FBR' }
      ]);
    }
  }, []);

  const load = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/premium/me`);
      if (res.ok) setData(await res.json());
    } catch { /* fallback to local storage name */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); fetchAllJobs(); }, [load, fetchAllJobs]);

  const user = data?.user;
  const stats = data?.stats;
  const goalPct = data ? Math.round((data.dailyGoal.completed / data.dailyGoal.target) * 100) : 0;
  const circumference = 2 * Math.PI * 28;

  const jobList = allJobs.length > 0 ? allJobs : (data?.trackedJobs?.length ? data.trackedJobs : [
    { id: 1, title: 'Lecturer Computer Science', organization: 'PPSC' },
    { id: 2, title: 'Sub-Inspector Police', organization: 'PPSC' },
    { id: 3, title: 'Assistant Director NAB', organization: 'FPSC' }
  ]);
  const currentTarget = activeJob || (data?.trackedJobs?.length ? data.trackedJobs[0] : jobList[0]);

  const tools = [
    { icon: <Calendar size={20} />, label: 'Study Planner', sub: 'Organize your prep', href: '/todo?tab=planner', color: '#3B82F6' },
    { icon: <Layers size={20} />, label: 'Smart Flashcards', sub: 'Active recall sessions', href: '/saved-mcqs?tab=flashcards', color: '#10B981' },
    { icon: <Shield size={20} />, label: 'Weak Areas', sub: 'Review mistakes', href: '/saved-mcqs?tab=weak-areas', color: '#EF4444' },
  ];

  const learningTools = [
    { icon: <BookOpen size={24} />, label: 'Topic Masterclass', sub: 'Chapter-wise deep dives', meta: '120+ Topics', href: '/classroom?mode=study', theme: styles.themeEmerald },
    { icon: <FileText size={24} />, label: 'Notes Library', sub: 'Exclusive online notes', meta: '45 mins/doc', href: '/classroom?mode=notes', theme: styles.themePurple },
    { icon: <Globe size={24} />, label: 'Current Affairs', sub: 'Daily GK & Updates', meta: 'Updated Today', href: '/classroom?mode=current-affairs', theme: styles.themeBlue },
  ];

  const practiceTools = [
    { icon: <Activity size={24} />, label: 'Speed Drill', sub: '15s per MCQ — instant feedback', meta: '15s per MCQ', href: '/classroom?mode=speed-drill', theme: styles.themeGold },
    { icon: <Zap size={24} />, label: 'Mixed Practice', sub: 'Randomized topic drill', meta: '10,000+ MCQs', href: '/classroom?mode=mixed', theme: styles.themeIndigo },
    { icon: <Target size={24} />, label: 'Custom Quiz', sub: 'Build your own drill', meta: 'Customizable', href: '/classroom?mode=custom-quiz', theme: styles.themeEmerald },
  ];

  const testTools = [
    { icon: <Target size={24} />, label: 'Full Mock Exam', sub: 'Simulate real conditions', meta: '100 Marks | 90 Mins', href: '/classroom?mode=full-mock', theme: styles.themeRose },
    { icon: <Clock size={24} />, label: 'Mini Mock', sub: 'Short 30-min tests', meta: '30 Marks | 30 Mins', href: '/classroom?mode=mini-mock', theme: styles.themeGold },
    { icon: <FileText size={24} />, label: 'Past Papers', sub: 'PPSC/FPSC Archives', meta: '2015-2024 Archive', href: '/classroom?mode=past-papers', theme: styles.themeBlue },
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingPulse}>
          <div className={styles.loadingBar} />
          <div className={styles.loadingBar} style={{ width: '60%' }} />
          <div className={styles.loadingBar} style={{ width: '80%' }} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <NewsTicker />
      {/* Gold orbs */}
      <div className={styles.orbGold1} />
      <div className={styles.orbGold2} />

      <div className={styles.inner}>
        {/* Full Viewport Hero Section */}
        <div className={styles.heroViewport}>
          {/* Hero Section Split */}
          <div className={styles.heroGrid}>
            {/* Left Column: Greeting & CTA */}
            <motion.div
              className={styles.heroLeft}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={styles.premiumBadge}><Flame size={14} color="#F59E0B" /> PREMIUM EXCLUSIVE</div>
              <h1 className={styles.heroTitle}>
                <span className={styles.heroTitleSmall}>Welcome back,</span><br />
                <span className={styles.gradientTextGold}>
                  {user?.name || userName}
                </span>
              </h1>
              <p className={styles.heroSubtitle}>
                {user?.streak ? `You are crushing it on a ${user.streak}-day learning streak! The ultimate PPSC preparation engine is ready for your next session.` : 'Dive into the ultimate PPSC preparation engine. Your success journey begins today.'}
              </p>
              <div className={styles.heroActions}>
                <Link href="/classroom" className={styles.heroPrimaryBtn}>
                  Enter Classroom <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>

            {/* Right Column: Tracking System */}
            <motion.div
              className={styles.heroRight}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className={styles.trackingPanel}>
                <div className={styles.trackingHeader}>
                  <Target size={18} color="#F59E0B" />
                  <h3>Progress Tracker</h3>
                </div>
                
                <div className={styles.trackingBody}>
                  {/* Circular Goal Chart */}
                  <div className={styles.trackingGoal}>
                    <svg className={styles.heroGoalRing} viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(245,158,11,0.15)" strokeWidth="8" />
                      <circle
                        cx="50" cy="50" r="44" fill="none"
                        stroke="url(#goldGradient)" strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 44}
                        strokeDashoffset={(2 * Math.PI * 44) - ((2 * Math.PI * 44) * goalPct) / 100}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}
                      />
                      <defs>
                        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#FCD34D" />
                          <stop offset="50%" stopColor="#F59E0B" />
                          <stop offset="100%" stopColor="#D97706" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className={styles.heroGoalContent}>
                      <span className={styles.heroGoalPercent}>{goalPct}%</span>
                      <span className={styles.heroGoalLabel}>Daily Goal</span>
                    </div>
                  </div>

                  {/* Tracked Job Info */}
                  <div className={styles.trackingJob}>
                    <div className={styles.prepLabel}>Active Track</div>
                    {data?.trackedJobs && data.trackedJobs.length > 0 ? (
                      <div className={styles.jobDetails}>
                        <div className={styles.jobTitle}>{data.trackedJobs[0].title}</div>
                        <div className={styles.progressBarTrackMini}>
                          <div className={styles.progressBarFillMini} style={{ width: '34%' }} />
                        </div>
                        <Link href={`/classroom?mode=study&job=${data.trackedJobs[0].id}`} className={styles.jobLink}>
                          Resume Practice →
                        </Link>
                      </div>
                    ) : (
                      <div className={styles.jobDetails}>
                        <p className={styles.jobEmpty}>No specific post tracked yet.</p>
                        <Link href="/jobs" className={styles.jobLink}>Find a Job →</Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Stats Strip */}
          <motion.div
            className={styles.statsStrip}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {[
              { icon: <Flame size={22} />, value: user?.streak ?? 0, label: 'Day Streak' },
              { icon: <TrendingUp size={22} />, value: `${user?.avgScore ?? 75}%`, label: 'Avg Score' },
              { icon: <FileText size={22} />, value: user?.testsTaken ?? 0, label: 'Tests Taken' },
              { icon: <Clock size={22} />, value: `${Math.round(user?.hoursStudied ?? 0)}h`, label: 'Studied' },
            ].map((s, i) => (
              <div key={i} className={styles.statCard}>
                <span className={styles.statIcon}>{s.icon}</span>
                <span className={styles.statVal}>{s.value}</span>
                <span className={styles.statLbl}>{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

      </div>

      {/* Full Screen Modal Extracted to Root */}
      {showJobSelector && (
        <div className={styles.jobModalOverlay} onClick={() => setShowJobSelector(false)}>
          <motion.div 
            className={styles.jobModalContainer}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.jobModalHeader}>
              <h3>Select Target Job</h3>
              <p>Choose an exam target to unlock specific premium materials.</p>
            </div>
            <div className={styles.jobModalGrid}>
              {jobList.map((job: any) => (
                <div 
                  key={job.id} 
                  className={styles.jobModalCard}
                  onClick={() => {
                    setActiveJob(job);
                    setShowJobSelector(false);
                  }}
                >
                  <Briefcase className={styles.jobModalIcon} size={24} />
                  <div className={styles.jobModalDetails}>
                    <h4>{job.title}</h4>
                    <span>{job.organization}</span>
                  </div>
                  <ArrowRight className={styles.jobModalArrow} size={20} />
                </div>
              ))}
            </div>
            <button className={styles.jobModalCloseBtn} onClick={() => setShowJobSelector(false)}>
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
