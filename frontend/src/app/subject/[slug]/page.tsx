import { API_BASE } from '@/lib/api';
import React from 'react';
import Link from 'next/link';
import { BookOpen, Crosshair, Trophy, ArrowLeft } from 'lucide-react';
import styles from './subjectDashboard.module.css';
import type { Metadata } from 'next';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  let title = 'Subject Not Found';
  try {
    const res = await fetch(API_BASE + '/api/mcqs/categories', { cache: 'no-store' });
    const cats = await res.json();
    const subject = cats.find((s: any) => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === params.slug);
    if (subject) title = subject.name;
  } catch (err) {
    console.error(err);
  }
  
  return {
    title: `${title} Preparation Dashboard - Meritmaster`,
    description: `Master ${title} with our topic-wise study engine, practice quizzes, and final mock exams.`,
    openGraph: {
      title: `${title} Preparation Dashboard - Meritmaster`,
      description: `Master ${title} with our premium platform.`,
      images: ['/images/og-card.png'],
    }
  };
}

export default async function SubjectPage({ params }: { params: { slug: string } }) {
  let subject = null;
  try {
    const res = await fetch(API_BASE + '/api/mcqs/categories', { cache: 'no-store' });
    const cats = await res.json();
    subject = cats.find((s: any) => s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === params.slug);
  } catch (err) {
    console.error(err);
  }

  if (!subject) {
    return (
      <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>
        <h2>Subject not found</h2>
        <Link href="/" className={styles.backLink}>
          <ArrowLeft size={18} /> Back to Home
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="orb-container">
        <div className="orb orb-1"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className={styles.dashboardContainer}>
        <div className="container">
          <Link href="/#subjects" className={styles.backLink}>
            <ArrowLeft size={18} /> Back to Subjects
          </Link>
          
          <div className={styles.header}>
            <h1 className={styles.title}><span>{subject.name}</span> Dashboard</h1>
            <p className={styles.subtitle}>Choose your learning path. Master the syllabus, hone your speed, or take the ultimate final exam.</p>
          </div>

          <div className={styles.grid}>
            {/* Topic-Wise Study */}
            <Link href={`/classroom?mode=study&subject=${params.slug}`} className={`${styles.card} ${styles.cardTopics}`}>
              <div className={styles.iconWrapper}>
                <BookOpen size={45} />
              </div>
              <h2 className={styles.cardTitle}>Topic-Wise Study</h2>
              <p className={styles.cardDesc}>
                Learn systematically. Break down the entire syllabus into manageable modules and master each topic one by one.
              </p>
              <span className={styles.btn}>Start Learning</span>
            </Link>

            {/* Practice Engine */}
            <Link href={`/classroom?mode=mixed&subject=${params.slug}`} className={`${styles.card} ${styles.cardPractice}`}>
              <div className={styles.iconWrapper}>
                <Crosshair size={45} />
              </div>
              <h2 className={styles.cardTitle}>Practice Engine</h2>
              <p className={styles.cardDesc}>
                Hone your speed and accuracy. Select specific topics, set your custom difficulty, and drill MCQs until you are flawless.
              </p>
              <span className={styles.btn}>Enter Practice Mode</span>
            </Link>

            {/* Final Exam */}
            <Link href={`/classroom?mode=full-mock&subject=${params.slug}`} className={`${styles.card} ${styles.cardExam}`}>
              <div className={styles.iconWrapper}>
                <Trophy size={45} />
              </div>
              <h2 className={styles.cardTitle}>Final Mock Exam</h2>
              <p className={styles.cardDesc}>
                The ultimate test. 100 MCQs, a strict 90-minute countdown timer, and realistic PPSC conditions. Are you ready?
              </p>
              <span className={styles.btn}>Take Final Exam</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
