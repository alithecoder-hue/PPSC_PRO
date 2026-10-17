'use client';

import { API_BASE } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Lock, Crown } from 'lucide-react';
import styles from './prepCard.module.css';

export default function MockTestsSection({ limit, showViewAll = false }: { limit?: number, showViewAll?: boolean }) {
  const router = useRouter();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [dbJobs, setDbJobs] = useState<any[]>([]);

  useEffect(() => {
    fetch(API_BASE + '/api/public/jobs')
      .then(res => res.json())
      .then(data => setDbJobs(data))
      .catch(err => console.error(err));
  }, []);

  const handleTestClick = (e: React.MouseEvent, test: any) => {
    e.preventDefault();
    router.push(`/classroom`);
  };

  const getBgClass = (index: number) => {
    const variants = [styles.bgVariant5, styles.bgVariant4, styles.bgVariant3, styles.bgVariant2, styles.bgVariant1];
    return variants[index % variants.length];
  };

  const displayedTests = limit ? dbJobs.slice(0, limit) : dbJobs;

  return (
    <React.Fragment>
      <div className={styles.grid}>
        {displayedTests.map((test, idx) => (
          <div 
            key={test.id} 
            className={`${styles.card} ${test.type === 'Coming Soon' ? styles.cardDisabled : ''}`}
            onClick={(e) => handleTestClick(e, test)}
          >
            <div className={`${styles.bgImage} ${getBgClass(idx)}`}>
              <Image src="/images/job_thumbnail.png" alt={test.title} fill style={{ objectFit: 'cover', opacity: 0.8 }} />
            </div>

            <div className={styles.glassContent}>
              <div className={styles.titleWrapper}>
                <h3 className={styles.cardTitle}>{test.title}</h3>
                <p className={styles.cardSubtitle}>
                  💡 High-yield mock test simulation
                </p>
              </div>
              
              <div className={styles.metaRow}>
                <div className={styles.metaItems}>
                  <div className={styles.metaBlock}>
                    <span className={styles.metaVal}>{test.durationMins || 0}</span>
                    <span className={styles.metaLbl}>Mins</span>
                  </div>
                  <div className={styles.metaBlock}>
                    <span className={styles.metaVal}>{test.totalMcqs || 0}</span>
                    <span className={styles.metaLbl}>MCQs</span>
                  </div>
                </div>
                <div className={styles.actionBtn}>
                  {test.type === 'Premium' ? <Lock size={16} /> : <ArrowRight size={18} />}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showViewAll && (
        <div style={{ textAlign: 'center', marginTop: '40px' }}>
          <Link href="/classroom" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#F59E0B',
            padding: '12px 30px',
            borderRadius: '50px',
            fontWeight: 'bold',
            textDecoration: 'none',
            transition: 'all 0.3s ease'
          }}>
            Explore All Mock Tests <ArrowRight size={18} />
          </Link>
        </div>
      )}

      {showPremiumModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowPremiumModal(false)}>
          <div style={{ background: '#1A1A2E', padding: '40px', borderRadius: '20px', maxWidth: '400px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px', color: '#FFD700' }}><Crown size={48} /></div>
            <h3 style={{ color: '#FFF', fontSize: '1.5rem', marginBottom: '10px' }}>Premium Test</h3>
            <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '30px' }}>
              This high-yield mock test is exclusively available for Meritmaster Premium members. Unlock this test and hundreds of others!
            </p>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '10px 20px', borderRadius: '10px', color: '#FFF', cursor: 'pointer' }} onClick={() => setShowPremiumModal(false)}>
                Cancel
              </button>
              <Link href="/subscription" style={{ background: '#FFD700', border: 'none', padding: '10px 20px', borderRadius: '10px', color: '#000', fontWeight: 'bold', textDecoration: 'none' }}>
                View Subscription
              </Link>
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
