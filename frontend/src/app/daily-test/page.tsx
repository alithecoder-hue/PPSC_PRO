'use client';

import { API_BASE } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Lock, PlayCircle, Star } from 'lucide-react';
import styles from './dailyTest.module.css';

export default function DailyTestPage() {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(API_BASE + '/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Assume user has premium if they have active subscriptions
          if (data.subscriptions && data.subscriptions.length > 0) {
            setIsPremium(true);
          } else {
            // Also fallback for admins or premium users without active subscription rows
            setIsPremium(data.role === 'ADMIN' || data.role === 'PREMIUM' ? true : false);
          }
        } else {
          setIsPremium(false);
        }
      } catch (e) {
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };
    checkStatus();
  }, []);

  const startTest = () => {
    router.push('/test-engine?type=daily-test');
  };

  if (loading) {
    return <div className={styles.container} style={{ textAlign: 'center', paddingTop: '200px' }}>Loading...</div>;
  }

  // Paywall State
  if (isPremium === false) {
    return (
      <div className={`${styles.container} ${styles.lockedContainer}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Daily <span className={styles.gradientText}>Premium Exam</span></h1>
          <p className={styles.subtitle}>Curated, high-probability MCQs generated freshly every day.</p>
        </div>

        <div className={styles.lockedState}>
          <Lock size={60} color="#FF3366" style={{ margin: '0 auto' }} />
          <h2>Premium Feature Locked</h2>
          <p>The Daily Test engine is exclusive to Premium members. Upgrade your account to unlock this exam and track your leaderboard score.</p>
          <Link href="/subscription" className={styles.upgradeBtn}>
            Upgrade to Premium
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Daily <span className={styles.gradientText}>Premium Exam</span></h1>
        <p className={styles.subtitle}>Your daily dose of curated MCQs to keep you sharp.</p>
      </div>

      <div className={styles.lockedState} style={{ background: 'rgba(245, 158, 11, 0.05)', borderColor: 'rgba(245, 158, 11, 0.2)' }}>
        <Star size={60} color="#F59E0B" style={{ margin: '0 auto', filter: 'drop-shadow(0 0 10px rgba(0,229,255,0.5))' }} />
        <h2>Welcome, Premium Member!</h2>
        <p>Today's custom test has been compiled. You have 90 minutes to complete the test. Good luck!</p>
        <button className={styles.startBtn} onClick={startTest} style={{ width: 'auto', padding: '15px 40px', marginTop: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <PlayCircle size={20} /> Start Today's Exam
        </button>
      </div>
    </div>
  );
}
