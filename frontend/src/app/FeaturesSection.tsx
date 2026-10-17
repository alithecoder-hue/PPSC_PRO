'use client';

import React from 'react';
import Link from 'next/link';
import { Brain, Infinity, ShieldCheck } from 'lucide-react';
import styles from './features.module.css';

export default function FeaturesSection() {
  return (
    <div className={styles.featuresContainer}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Why Upgrade to <span>Premium?</span></h2>
          <p className={styles.subtitle}>Unlock the full potential of your preparation with cutting-edge tools designed for top performers.</p>
        </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <Brain size={40} />
          </div>
          <h3 className={styles.cardTitle}>AI-Powered Analytics</h3>
          <p className={styles.cardDesc}>
            Our AI tracks your performance across all topics, instantly identifying your weak areas so you can focus exactly where it matters most.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <Infinity size={40} />
          </div>
          <h3 className={styles.cardTitle}>Unlimited Mock Exams</h3>
          <p className={styles.cardDesc}>
            Never run out of practice. Gain unlimited access to an ever-growing library of updated, hyper-realistic past papers and timed mock tests.
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.iconWrapper}>
            <ShieldCheck size={40} />
          </div>
          <h3 className={styles.cardTitle}>Ad-Free Focused Learning</h3>
          <p className={styles.cardDesc}>
            Prepare in a 100% ad-free environment. No distractions, no interruptions—just pure, focused preparation for your crucial exams.
          </p>
        </div>
      </div>

        <div className={styles.actionWrapper}>
          <Link href="/subscription" className={styles.premiumBtn}>
            Unlock Premium Access Now
          </Link>
        </div>
      </div>
    </div>
  );
}
