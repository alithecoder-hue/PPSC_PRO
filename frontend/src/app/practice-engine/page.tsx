'use client';

import { API_BASE } from '@/lib/api';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './practice-engine.module.css';

interface MCQ {
  id: number;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

function PracticeEngineContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [practiceTitle, setPracticeTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEmpty, setIsEmpty] = useState(false);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      let loadedMcqs: MCQ[] = [];
      let title = 'General Practice';

      // Helper to map raw DB MCQs to the MCQ interface
      const mapMcqs = (data: any[]): MCQ[] => data.map((m: any) => ({
        id: m.id,
        question: m.question,
        options: [m.optionA, m.optionB, m.optionC, m.optionD],
        correctOptionIndex: ['A', 'B', 'C', 'D'].indexOf(m.correctOption),
        explanation: m.explanation || undefined
      }));

      try {
        if (type === 'subject') {
          // Step 1: Find the category by matching the slug to a name
          const catRes = await fetch(API_BASE + '/api/mcqs/categories');
          const cats = await catRes.json();
          const subject = cats.find((s: any) => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id);
          if (subject) {
            title = `${subject.name} Practice Mode`;
            // Step 2: Fetch MCQs filtered specifically by this category's ID
            const mcqRes = await fetch(`${API_BASE}/api/mcqs?categoryId=${subject.id}&limit=100`);
            const mcqData = await mcqRes.json();
            loadedMcqs = mapMcqs(mcqData);
          }
        } else if (type === 'job') {
          const res = await fetch(API_BASE + '/api/public/jobs');
          const jobs = await res.json();
          const job = jobs.find((j: any) => String(j.id) === String(id));
          if (job) title = `${job.title} Practice Mode`;
          // Jobs use general MCQ pool — no subject filtering applicable
          const mcqRes = await fetch(API_BASE + '/api/mcqs/exam');
          loadedMcqs = mapMcqs(await mcqRes.json());
        } else if (type === 'past-paper') {
          title = `Past Paper Practice #${id}`;
          const mcqRes = await fetch(API_BASE + '/api/mcqs/exam');
          loadedMcqs = mapMcqs(await mcqRes.json());
        }
      } catch (err) {
        console.error(err);
      }

      if (loadedMcqs.length === 0) {
        setIsEmpty(true);
      }

      setMcqs(loadedMcqs.slice(0, 100));
      setPracticeTitle(title);
      setIsLoading(false);
    };

    fetchData();
  }, [type, id]);

  const handleOptionSelect = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);
    if (idx === mcqs[currentIndex].correctOptionIndex) {
      setCorrectCount(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < mcqs.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      alert(`Practice Session Complete! You got ${correctCount} out of ${mcqs.length} correct.`);
    }
  };

  if (isLoading) {
    return <div className={styles.container}><div className={styles.noData}>Loading Practice Engine...</div></div>;
  }

  if (isEmpty || mcqs.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.noData} style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📚</div>
          <h2 style={{ color: '#F59E0B', marginBottom: '10px' }}>No Questions Yet</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '400px', margin: '0 auto' }}>
            No practice questions are available for this section yet. The admin is working on adding content. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  const currentMcq = mcqs[currentIndex];
  const questionsAttempted = currentIndex + (showExplanation ? 1 : 0);
  const accuracy = questionsAttempted === 0 ? 0 : Math.round((correctCount / questionsAttempted) * 100);

  return (
    <>
      <div className="orb-container">
        <div className="orb orb-1"></div>
      </div>
      
      <div className={styles.container}>
        <div className={styles.workspaceGrid}>
          
          {/* Sidebar: Session Stats */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarTitle}>Session Stats</div>
              
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Accuracy</span>
                <span className={`${styles.statValue} ${styles.cyanText}`}>{accuracy}%</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Correct</span>
                <span className={`${styles.statValue} ${styles.yellowText}`}>{correctCount}</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Attempted</span>
                <span className={`${styles.statValue} ${styles.pinkText}`}>{questionsAttempted}</span>
              </div>
              <div className={styles.statRow}>
                <span className={styles.statLabel}>Remaining</span>
                <span className={styles.statValue}>{mcqs.length - questionsAttempted}</span>
              </div>
            </div>

            <Link href="/" className={styles.exitBtn}>
              &larr; Exit Session
            </Link>
          </div>

          {/* Main Content */}
          <div className={styles.mainContent}>
            <div className={styles.header}>
              <h1 className={styles.title}>{practiceTitle}</h1>
            </div>

            <div className={styles.mcqCard}>
              {(() => {
                const isUrdu = /[\u0600-\u06FF]/.test(currentMcq.question);
                return (
                  <>
                    <h3
                      className={styles.questionText}
                      dir={isUrdu ? 'rtl' : 'ltr'}
                      style={isUrdu ? {
                        fontFamily: "'Noto Naskh Arabic', 'Noto Nastaliq Urdu', serif",
                        textAlign: 'right', lineHeight: 2.2, fontSize: '1.2rem'
                      } : {}}
                    >
                      <span style={{ color: '#F59E0B', marginRight: isUrdu ? 0 : '10px', marginLeft: isUrdu ? '10px' : 0 }}>Q{currentIndex + 1}.</span>
                      {currentMcq.question}
                    </h3>

                    <div className={styles.optionsList}>
                      {currentMcq.options.map((opt, idx) => {
                        let optionStyle = '';
                        if (showExplanation) {
                          if (idx === currentMcq.correctOptionIndex) optionStyle = styles.correct;
                          else if (selectedOption === idx) optionStyle = styles.wrong;
                        } else if (selectedOption === idx) {
                          optionStyle = styles.selected;
                        }

                        return (
                          <button
                            key={idx}
                            className={`${styles.optionBtn} ${optionStyle}${isUrdu ? ' urdu-option' : ''}`}
                            onClick={() => handleOptionSelect(idx)}
                            disabled={showExplanation}
                            dir={isUrdu ? 'rtl' : 'ltr'}
                            style={isUrdu ? {
                              fontFamily: "'Noto Naskh Arabic', serif",
                              textAlign: 'right', lineHeight: 2,
                              flexDirection: 'row-reverse'
                            } : {}}
                          >
                            <span className={styles.optLetter}>{String.fromCharCode(65 + idx)}</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>

            <AnimatePresence>
              {showExplanation && (
                <motion.div 
                  className={styles.explanationBox} 
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4>Explanation:</h4>
                  <p>{currentMcq.explanation || 'No explanation available for this question.'}</p>
                  <div>
                    <button className={styles.nextBtn} onClick={handleNext}>
                      {currentIndex < mcqs.length - 1 ? 'Next Question &rarr;' : 'Finish Practice'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
        </div>
      </div>
    </>
  );
}

export default function PracticeEnginePage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center', color: '#FFF' }}>Loading...</div>}>
      <PracticeEngineContent />
    </Suspense>
  );
}
