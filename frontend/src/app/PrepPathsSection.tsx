'use client';

import { API_BASE } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import styles from './prepPaths.module.css';
import { BookOpen, Briefcase } from 'lucide-react';
import SubjectGrid from './SubjectGrid';
import MockTestsSection from './MockTestsSection';

export default function PrepPathsSection() {
  const [activeTab, setActiveTab] = useState<'subject' | 'post'>('subject');
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await fetch(API_BASE + '/api/mcqs/categories');
        if (res.ok) {
          const data = await res.json();
          // Add dummy slug for routing if not returned from DB
          const formatted = data.map((d: any) => ({
            ...d,
            slug: d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
          }));
          setDbSubjects(formatted);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchSubjects();
  }, []);

  return (
    <div className={styles.sectionWrapper}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Choose Your <span>Preparation Path</span></h2>
          <p className={styles.subtitle}>Whether you want to master a specific subject or tackle a full job-specific mock exam, we have you covered.</p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '40px' }}>
          {/* Prepare by Toggle */}
          <div className={styles.toggleContainer} style={{ marginBottom: 0 }}>
            <span className={styles.prepareText}>Prepare by:</span>
            <div className={styles.toggleSwitch}>
              <div className={`${styles.activeHighlight} ${activeTab === 'subject' ? styles.highlightSubject : styles.highlightPost}`}></div>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'subject' ? styles.active : ''}`}
                onClick={() => setActiveTab('subject')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
              >
                <BookOpen size={16} /> Subject
              </button>
              <button 
                className={`${styles.tabBtn} ${activeTab === 'post' ? styles.active : ''}`}
                onClick={() => setActiveTab('post')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
              >
                <Briefcase size={16} /> Post
              </button>
            </div>
          </div>
        </div>

        <div className={styles.contentArea}>
          {activeTab === 'subject' ? (
            <div key="subject">
              <SubjectGrid subjects={dbSubjects} limit={3} showViewAll={true} />
            </div>
          ) : (
            <div key="post">
              <MockTestsSection limit={3} showViewAll={true} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
