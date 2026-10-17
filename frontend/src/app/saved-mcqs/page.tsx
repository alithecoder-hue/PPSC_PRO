'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '@/lib/api';
import { authFetch } from '@/lib/authFetch';
import Link from 'next/link';
import { Bookmark, Eye, Trash2, CheckCircle, ChevronRight, Layers, Shield } from 'lucide-react';
import styles from './saved-mcqs.module.css';

interface SavedMCQ {
  id: number;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
  explanation?: string;
  difficulty: string;
  category?: { name: string };
  savedAt: string;
  savedId: number;
}

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;

export default function SavedMCQsPage() {
  const [activeTab, setActiveTab] = useState<'mcqs' | 'flashcards' | 'weak-areas'>('mcqs');
  const [mcqs, setMcqs] = useState<SavedMCQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  // Flashcard states
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNextFlashcard = () => {
    setIsFlipped(false);
    setFlashcardIndex(prev => (prev + 1) % mcqs.length);
  };

  const handlePrevFlashcard = () => {
    setIsFlipped(false);
    setFlashcardIndex(prev => (prev - 1 + mcqs.length) % mcqs.length);
  };

  const load = useCallback(async () => {
    try {
      const res = await authFetch(`${API_BASE}/api/premium/saved-mcqs`);
      if (res.ok) setMcqs(await res.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { 
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'flashcards' || tab === 'weak-areas') {
      setActiveTab(tab);
    }
    load(); 
  }, [load]);

  const unsave = async (mcqId: number) => {
    await authFetch(`${API_BASE}/api/premium/saved-mcqs/${mcqId}`, { method: 'DELETE' });
    setMcqs(prev => prev.filter(m => m.id !== mcqId));
  };

  const revealAnswer = (id: number) => {
    setRevealed(prev => new Set(prev).add(id));
  };

  const getOption = (mcq: SavedMCQ, key: string) => {
    const map: Record<string, string> = { A: mcq.optionA, B: mcq.optionB, C: mcq.optionC, D: mcq.optionD };
    return map[key];
  };

  const diffColor = (d: string) => d === 'Easy' ? '#10B981' : d === 'Hard' ? '#EF4444' : '#F59E0B';

  return (
    <div className={styles.page}>
      <div className={styles.orb1} /><div className={styles.orb2} />
      <div className={styles.container}>
        <motion.div className={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.headerTabs}>
            <button 
              className={`${styles.headerTab} ${activeTab === 'mcqs' ? styles.headerTabActive : ''}`}
              onClick={() => setActiveTab('mcqs')}
            >
              <Bookmark size={24} /> The Vault
            </button>
            <button 
              className={`${styles.headerTab} ${activeTab === 'flashcards' ? styles.headerTabActive : ''}`}
              onClick={() => setActiveTab('flashcards')}
            >
              <Layers size={24} /> Flashcards
            </button>
            <button 
              className={`${styles.headerTab} ${activeTab === 'weak-areas' ? styles.headerTabActive : ''}`}
              onClick={() => setActiveTab('weak-areas')}
            >
              <Shield size={24} /> Weak Areas
            </button>
          </div>
          {activeTab === 'mcqs' && <Link href="/classroom" className={styles.practiceBtn}>+ Save More</Link>}
        </motion.div>

        {activeTab === 'mcqs' ? (
          <>
            {loading ? (
          <div className={styles.empty}>Loading your saved questions…</div>
        ) : mcqs.length === 0 ? (
          <div className={styles.empty}>
            <Bookmark size={56} style={{ opacity: 0.5, marginBottom: 16 }} />
            <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>No saved MCQs yet.</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', maxWidth: 300, margin: '0 auto' }}>
              While practising, click the bookmark icon on any question to save it here for later review.
            </p>
            <Link href="/classroom" className={styles.practiceBtn} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 24 }}>
              Go Practice <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            {mcqs.map((mcq, idx) => (
              <motion.div
                key={mcq.id}
                className={styles.card}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.04 }}
              >
                {/* Top row */}
                <div className={styles.cardTop}>
                  <div className={styles.meta}>
                    <span className={styles.subject}>{mcq.category?.name || 'General'}</span>
                    <span
                      className={styles.difficulty}
                      style={{ color: diffColor(mcq.difficulty), borderColor: `${diffColor(mcq.difficulty)}40` }}
                    >
                      {mcq.difficulty}
                    </span>
                    <span className={styles.savedDate}>
                      Saved {new Date(mcq.savedAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <button
                    className={styles.unsaveBtn}
                    onClick={() => unsave(mcq.id)}
                    title="Remove from saved"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Question */}
                <p className={styles.question}>
                  <span className={styles.qNum}>Q{idx + 1}.</span> {mcq.question}
                </p>

                {/* Options — always visible, answer hidden until revealed */}
                <div className={styles.options}>
                  {OPTION_KEYS.map(key => {
                    const isCorrect = key === mcq.correctOption;
                    const show = revealed.has(mcq.id);
                    return (
                      <div
                        key={key}
                        className={`${styles.option} ${show && isCorrect ? styles.optionCorrect : ''}`}
                      >
                        <span className={styles.optionKey}>{key}</span>
                        <span>{getOption(mcq, key)}</span>
                        {show && isCorrect && <CheckCircle size={18} className={styles.checkMark} />}
                      </div>
                    );
                  })}
                </div>

                {/* Reveal / Explanation */}
                {!revealed.has(mcq.id) ? (
                  <button className={styles.revealBtn} onClick={() => revealAnswer(mcq.id)}>
                    <Eye size={16} style={{ marginRight: 6 }} /> Show Answer
                  </button>
                ) : mcq.explanation ? (
                  <div className={styles.explanation}>
                    <strong style={{ color: '#10B981', display: 'block', marginBottom: 4 }}>Explanation</strong>
                    {mcq.explanation}
                  </div>
                ) : null}
              </motion.div>
            ))}
          </AnimatePresence>
            )}
          </>
        ) : activeTab === 'flashcards' ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.mockContainer}>
            <div className={styles.mockHeader}>
              <h2 style={{ color: '#fff' }}>Smart Flashcards</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>Active recall sessions based on your saved items.</p>
            </div>
            
            {mcqs.length === 0 ? (
              <div className={styles.empty}>
                <Layers size={56} style={{ opacity: 0.5, marginBottom: 16 }} />
                <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>No flashcards available.</p>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', maxWidth: 300, margin: '0 auto' }}>
                  Save some MCQs from the classroom to start a flashcard session.
                </p>
                <Link href="/classroom" className={styles.practiceBtn} style={{ display: 'inline-flex', marginTop: 24 }}>
                  Go Practice
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ marginBottom: '16px', color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem' }}>
                  Card {flashcardIndex + 1} of {mcqs.length}
                </div>
                
                <div 
                  className={styles.flashcardMock} 
                  onClick={() => setIsFlipped(!isFlipped)}
                  style={{ cursor: 'pointer', perspective: '1000px', width: '100%', maxWidth: '500px', height: '300px', position: 'relative' }}
                >
                  <motion.div
                    initial={false}
                    animate={{ rotateX: isFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 200, damping: 20 }}
                    style={{
                      width: '100%', height: '100%', position: 'absolute',
                      transformStyle: 'preserve-3d'
                    }}
                  >
                    {/* Front */}
                    <div className={styles.flashcardFront} style={{ backfaceVisibility: 'hidden', position: 'absolute', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '30px' }}>
                      <p style={{ color: '#8B5CF6', fontWeight: 600, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem' }}>Question (Click to flip)</p>
                      <h3 style={{ fontSize: '1.2rem', textAlign: 'center', lineHeight: 1.5 }}>{mcqs[flashcardIndex].question}</h3>
                    </div>
                    
                    {/* Back */}
                    <div className={styles.flashcardFront} style={{ backfaceVisibility: 'hidden', position: 'absolute', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '30px', transform: 'rotateX(180deg)', background: 'linear-gradient(145deg, rgba(30, 40, 30, 0.9), rgba(15, 20, 15, 0.9))', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
                      <p style={{ color: '#10B981', fontWeight: 600, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.8rem' }}>Answer (Click to flip back)</p>
                      <h3 style={{ fontSize: '1.5rem', color: '#10B981', textAlign: 'center', fontWeight: 800 }}>
                        {getOption(mcqs[flashcardIndex], mcqs[flashcardIndex].correctOption)}
                      </h3>
                      {mcqs[flashcardIndex].explanation && (
                        <p style={{ marginTop: '20px', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
                          {mcqs[flashcardIndex].explanation}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', marginTop: '30px' }}>
                  <button onClick={handlePrevFlashcard} className={styles.filterBtn}>← Previous</button>
                  <button onClick={handleNextFlashcard} className={styles.practiceBtn} style={{ padding: '8px 24px' }}>Next →</button>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={styles.mockContainer}>
            <div className={styles.mockHeader}>
              <h2 style={{ color: '#fff' }}>Weak Areas Analysis</h2>
              <p style={{ color: 'rgba(255,255,255,0.6)' }}>Review MCQs you answered incorrectly during your mock tests.</p>
            </div>
            <div className={styles.empty}>
              <Shield size={56} style={{ opacity: 0.5, marginBottom: 16 }} />
              <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', marginBottom: 8 }}>No weak areas identified yet.</p>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem', maxWidth: 300, margin: '0 auto' }}>
                Complete more mock tests and drills. Incorrect answers will automatically appear here for review.
              </p>
              <Link href="/classroom?mode=full-mock" className={styles.practiceBtn} style={{ display: 'inline-flex', marginTop: 24 }}>
                Take a Mock Test
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
