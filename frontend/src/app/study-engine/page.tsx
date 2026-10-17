'use client';

import { API_BASE } from '@/lib/api';
import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './study-engine.module.css';

function StudyEngineContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const id = searchParams.get('id');

  const [studyData, setStudyData] = useState<any>(null);
  const [activeTopicIndex, setActiveTopicIndex] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      let data: any = {
        title: 'General Study Material',
        topics: [
          { name: 'Introduction', content: 'This is the generic introduction to the topic.', notes: 'No extra notes.' }
        ]
      };

      try {
        if (type === 'subject') {
          const res = await fetch(API_BASE + '/api/mcqs/categories');
          const cats = await res.json();
          const subject = cats.find((s: any) => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id);
          if (subject) {
            data = {
              title: `${subject.name} Study Notes`,
              topics: [
                { 
                  name: 'Content Coming Soon', 
                  content: `Study notes for ${subject.name} have not been added yet. The admin will upload detailed notes and syllabus breakdowns shortly.`,
                  notes: 'In the meantime, practice MCQs for this subject using the Practice Mode button.'
                }
              ]
            };
          }
        } else if (type === 'job') {
          const res = await fetch(API_BASE + '/api/public/jobs');
          const jobs = await res.json();
          const job = jobs.find((j: any) => String(j.id) === String(id));
          if (job) {
            data = {
              title: `Study Guide: ${job.title}`,
              topics: [
                { 
                  name: '1. Job Requirements', 
                  content: job.description || 'No description provided for this job post.', 
                  notes: 'Ensure you meet all physical and educational criteria before applying.' 
                },
                { 
                  name: '2. Exam Strategy', 
                  content: 'Review past papers and practice MCQs relevant to this post. Focus on General Knowledge, Current Affairs, and Pakistan Studies as they appear in most PPSC exams.',
                  notes: 'Use the Practice Mode or take a full Timed Test to measure your readiness.'
                }
              ]
            };
          }
        } else if (type === 'past-paper') {
          data = {
            title: `Study Notes: Past Paper #${id}`,
            topics: [
              { 
                name: 'Notes Coming Soon', 
                content: 'Detailed analysis and answer explanations for this past paper will be available shortly.',
                notes: 'You can attempt this paper in Practice Mode to check your own answers.'
              }
            ]
          };
        }
      } catch (err) {
        console.error(err);
      }

      setStudyData(data);
      setActiveTopicIndex(0); // Reset on load
    };

    fetchData();
  }, [type, id]);

  if (!studyData) {
    return <div className={styles.container}><div className={styles.noData}>Loading Study Engine...</div></div>;
  }

  const activeTopic = studyData.topics[activeTopicIndex];

  return (
    <>
      <div className="orb-container">
        <div className="orb orb-2"></div>
      </div>

      <div className={styles.container}>
        <div className={styles.workspaceGrid}>
          
          {/* Sidebar: Table of Contents */}
          <div className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <div className={styles.sidebarTitle}>Table of Contents</div>
              <div className={styles.tocList}>
                {studyData.topics.map((topic: any, idx: number) => (
                  <button 
                    key={idx}
                    className={`${styles.tocBtn} ${idx === activeTopicIndex ? styles.active : ''}`}
                    onClick={() => setActiveTopicIndex(idx)}
                  >
                    <span className={styles.tocNum}>{idx + 1}</span>
                    {topic.name}
                  </button>
                ))}
              </div>
            </div>

            <Link href="/" className={styles.exitBtn}>
              &larr; Exit Study Mode
            </Link>
          </div>

          {/* Main Content */}
          <div className={styles.mainContent}>
            <div className={styles.header}>
              <h1 className={styles.title}>{studyData.title}</h1>
              <p className={styles.subtitle}>Select a chapter from the sidebar to begin reading.</p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={activeTopicIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className={styles.topicCard}
              >
                <h3 className={styles.topicName}>{activeTopic.name}</h3>
                <div className={styles.topicContent} dangerouslySetInnerHTML={{ __html: activeTopic.content }} />
                
                {activeTopic.notes && (
                  <div className={styles.topicNotes}>
                    <strong>Expert Tip:</strong> {activeTopic.notes}
                  </div>
                )}

                <div style={{ marginTop: '40px' }}>
                  <Link href={`/practice-engine?type=${type}&id=${id}`} className={styles.practiceBtn}>
                    Practice this Topic &rarr;
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>

          </div>
        </div>
      </div>
    </>
  );
}

export default function StudyEnginePage() {
  return (
    <Suspense fallback={<div style={{ padding: '100px', textAlign: 'center', color: '#FFF' }}>Loading Study Engine...</div>}>
      <StudyEngineContent />
    </Suspense>
  );
}
