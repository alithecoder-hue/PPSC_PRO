'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Brain, CheckCircle2, Clock, Heart, Play, Sparkles, Users, XCircle } from 'lucide-react';
import styles from './hero.module.css';
import PremiumDashboard from './PremiumDashboard';
import NewsTicker from './NewsTicker';

/* ─── Count-up hook ─────────────────────────────────────────── */
function useCountUp(target: number, duration = 1800, delay = 700) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => {
      let start = 0;
      const step = target / (duration / 16);
      const id = setInterval(() => {
        start = Math.min(start + step, target);
        setCount(Math.floor(start));
        if (start >= target) clearInterval(id);
      }, 16);
      return () => clearInterval(id);
    }, delay);
    return () => clearTimeout(t);
  }, [inView, target, duration, delay]);
  return { count, ref };
}

/* ─── MCQ Data ───────────────────────────────────────────────── */
const QUESTIONS = [
  {
    subject: 'Pakistan Studies', q: 12, total: 100,
    question: "When was Pakistan's Constitution of 1973 officially enforced?",
    options: [
      { id: 'A', text: '10 April 1973' },
      { id: 'B', text: '14 August 1973' },
      { id: 'C', text: '23 March 1974' },
      { id: 'D', text: '7 October 1958' },
    ],
    correct: 'B',
    explanation: "The 1973 Constitution was enforced on 14 August 1973 — Pakistan's 26th Independence Day — signed by President Zulfikar Ali Bhutto.",
  },
  {
    subject: 'General Knowledge', q: 7, total: 100,
    question: "Which gas is most abundant in the Earth's atmosphere?",
    options: [
      { id: 'A', text: 'Oxygen' },
      { id: 'B', text: 'Carbon Dioxide' },
      { id: 'C', text: 'Nitrogen' },
      { id: 'D', text: 'Argon' },
    ],
    correct: 'C',
    explanation: "Nitrogen makes up about 78% of Earth's atmosphere, making it the most abundant gas — followed by oxygen at ~21%.",
  },
  {
    subject: 'English', q: 3, total: 100,
    question: 'Which of the following is a synonym for "Benevolent"?',
    options: [
      { id: 'A', text: 'Hostile' },
      { id: 'B', text: 'Generous' },
      { id: 'C', text: 'Indifferent' },
      { id: 'D', text: 'Strict' },
    ],
    correct: 'B',
    explanation: '"Benevolent" means well-meaning and generous. It comes from Latin bene (well) + volens (wishing). The correct synonym is "Generous".',
  },
];

/* ─── Component ─────────────────────────────────────────────── */
export default function HeroSection() {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showExpl, setShowExpl] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUserRole(localStorage.getItem('role'));
  }, []);

  const mcq = QUESTIONS[qIndex];

  const handleSelect = (id: string) => {
    if (selected) return;
    setSelected(id);
    setTimeout(() => setShowExpl(true), 500);
  };

  const handleNext = () => {
    setSelected(null);
    setShowExpl(false);
    setQIndex(i => (i + 1) % QUESTIONS.length);
  };

  /* count-up stats */
  const stat1 = useCountUp(10000, 1600, 900);
  const stat2 = useCountUp(500000, 1800, 950);

  const fmt = (n: number, t: number) => {
    if (t === 10000) return n >= 10000 ? '10k+' : `${(n / 1000).toFixed(1)}k`;
    return n >= 500000 ? '500k+' : `${Math.floor(n / 1000)}k+`;
  };

  if (mounted && (userRole === 'PREMIUM' || userRole === 'ADMIN')) {
    return <PremiumDashboard />;
  }

  return (
    <div className={styles.heroContainer}>
      <div className={styles.heroGlow} />
      <div className={styles.heroGlowSecondary} />

      {/* Ticker */}
      <div className="hero-announcement-strip">
        <NewsTicker embedded={true} />
      </div>

      {/* ── Hero inner wrapper (centers vertically) ── */}
      <div className={styles.heroInner}>

        {/* Two-column grid */}
        <div className={styles.heroContent}>

          {/* LEFT */}
          <motion.div
            className={styles.leftCol}
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
          >
            <div className={styles.badge}>
              <Sparkles size={13} /> AI-POWERED PREP FOR PAKISTAN'S TOUGHEST EXAMS
            </div>

            <h1 className={styles.title}>
              Pakistan's Smartest Platform for{' '}
              <span className={styles.gradientText}>PPSC Preparation</span>
            </h1>

            <p className={styles.subtitle}>
              Practice real MCQs, get instant AI feedback, and follow guided prep paths — all in one focused study space.
            </p>

            <div className={styles.btnGroup}>
              <Link href="#prep-paths" className={styles.primaryBtn}>
                Start learning <ArrowRight size={17} />
              </Link>
              <Link href="/signup" className={styles.secondaryBtn}>
                <Play size={15} /> Watch demo
              </Link>
            </div>
          </motion.div>

          {/* RIGHT — Interactive MCQ card */}
          <motion.div
            className={styles.rightCol}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut', delay: 0.15 }}
          >
            <div className={styles.mcqCard}>

              {/* Header */}
              <div className={styles.mcqHeader}>
                <div className={styles.mcqMeta}>
                  <Brain size={14} className={styles.mcqBrainIcon} />
                  <span>{mcq.subject}</span>
                  <span className={styles.mcqDotSep} />
                  <span>{String(qIndex + 1).padStart(2, '0')} / {String(mcq.total).padStart(2, '0')}</span>
                </div>
                <div className={styles.mcqProgressTrack}>
                  <motion.div
                    className={styles.mcqProgressFill}
                    animate={{ width: `${((qIndex + 1) / QUESTIONS.length) * 100}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Question */}
              <motion.p
                key={qIndex + '-q'}
                className={styles.mcqQuestion}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
              >
                {mcq.question}
              </motion.p>

              {/* Options */}
              <motion.div
                key={qIndex + '-opts'}
                className={styles.mcqOptions}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.1 }}
              >
                {mcq.options.map(opt => {
                  const isChosen = selected === opt.id;
                  const isCorrect = opt.id === mcq.correct;
                  const revealed = selected !== null;
                  let variant = '';
                  if (revealed && isCorrect) variant = styles.optCorrect;
                  else if (revealed && isChosen) variant = styles.optWrong;
                  else if (revealed) variant = styles.optDimmed;

                  return (
                    <button
                      key={opt.id}
                      className={`${styles.mcqOpt} ${variant}`}
                      onClick={() => handleSelect(opt.id)}
                      disabled={!!selected}
                    >
                      <span className={styles.optId}>{opt.id}</span>
                      <span className={styles.optText}>{opt.text}</span>
                      {revealed && isCorrect && <CheckCircle2 size={15} className={styles.iconOk} />}
                      {revealed && isChosen && !isCorrect && <XCircle size={15} className={styles.iconBad} />}
                    </button>
                  );
                })}
              </motion.div>

              {/* AI Explanation */}
              {showExpl && (
                <motion.div
                  className={styles.mcqExpl}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.38 }}
                >
                  <p className={styles.mcqExplLabel}><Brain size={12} /> AI Explanation</p>
                  <p className={styles.mcqExplText}>{mcq.explanation}</p>
                </motion.div>
              )}

              {/* Footer */}
              <div className={styles.mcqFooter}>
                {!selected
                  ? <span className={styles.mcqHint}>Select an answer to continue</span>
                  : (
                    <button className={styles.mcqNextBtn} onClick={handleNext}>
                      Next Question <ArrowRight size={13} />
                    </button>
                  )
                }
                <span className={styles.mcqAiBadge}><Sparkles size={11} /> AI-powered</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Full-width Stats Strip ── */}
        <motion.div
          className={styles.statsStrip}
          ref={stat1.ref}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.5 }}
        >
          <div className={styles.statsDivider} />

          <div className={styles.statsRow}>

            {/* Avatar trust group */}
            <div className={styles.trustGroup}>
              <div className={styles.avatarStack}>
                {['A', 'B', 'C', 'D'].map((l, i) => (
                  <div key={i} className={styles.avatarCircle} style={{ zIndex: 4 - i }}>{l}</div>
                ))}
              </div>
              <div className={styles.trustText}>
                <strong>Trusted by 10,000+</strong>
                <span>aspirants across Pakistan</span>
              </div>
            </div>

            <div className={styles.statSep} />

            {/* Stat 1 — Active aspirants */}
            <div className={styles.statItem}>
              <div className={styles.statIcon}><Users size={18} /></div>
              <div className={styles.statBody}>
                <strong>{fmt(stat1.count, 10000)}</strong>
                <span>Active aspirants</span>
              </div>
            </div>

            <div className={styles.statSep} />

            {/* Stat 2 — MCQs practiced */}
            <div className={styles.statItem}>
              <div className={styles.statIcon}><Sparkles size={18} /></div>
              <div className={styles.statBody}>
                <strong>{fmt(stat2.count, 500000)}</strong>
                <span>MCQs practiced</span>
              </div>
            </div>

            <div className={styles.statSep} />

            {/* Stat 3 — Success rate */}
            <div className={styles.statItem}>
              <div className={styles.statIcon}><Heart size={18} /></div>
              <div className={styles.statBody}>
                <strong>95%</strong>
                <span>Success rate</span>
              </div>
            </div>

            <div className={styles.statSep} />

            {/* Stat 4 — AI Study Assistant */}
            <div className={styles.statItem}>
              <div className={styles.statIcon}><Clock size={18} /></div>
              <div className={styles.statBody}>
                <strong>24/7</strong>
                <span>AI Study Assistant</span>
              </div>
            </div>

          </div>

          <div className={styles.statsDivider} />
        </motion.div>

      </div>{/* /heroInner */}
    </div>
  );
}
