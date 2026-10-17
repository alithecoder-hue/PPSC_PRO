'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, FolderOpen } from 'lucide-react';
import Image from 'next/image';
import styles from './prepCard.module.css';

export default function SubjectGrid({ subjects, limit, showViewAll = false }: { subjects: any[], limit?: number, showViewAll?: boolean }) {
  if (!subjects || subjects.length === 0) return (
    <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '60px 20px' }}>
      <FolderOpen size={48} style={{ opacity: 0.5, marginBottom: '15px' }} />
      <p style={{ fontSize: '1rem' }}>No subjects added yet. Add them from the Admin Panel to display here.</p>
    </div>
  );

  const displayedSubjects = limit ? subjects.slice(0, limit) : subjects;

  // We assign dynamic background variant classes (1 through 5) based on index
  const getBgClass = (index: number) => {
    const variants = [styles.bgVariant1, styles.bgVariant2, styles.bgVariant3, styles.bgVariant4, styles.bgVariant5];
    return variants[index % variants.length];
  };

  return (
    <React.Fragment>
      <div className={styles.grid}>
        {displayedSubjects.map((subject, idx) => (
          <Link href={`/subject/${subject.slug}`} key={subject.id} className={styles.card}>
          
          <div className={`${styles.bgImage} ${getBgClass(idx)}`}>
            <Image src="/images/subject_thumbnail.png" alt={subject.name} fill style={{ objectFit: 'cover', opacity: 0.8 }} />
          </div>

          <div className={styles.glassContent}>
            <div className={styles.titleWrapper}>
              <h3 className={styles.cardTitle}>{subject.name}</h3>
              <p className={styles.cardSubtitle}>
                💡 Learn interactively with step-by-step solutions
              </p>
            </div>
            
            <div className={styles.metaRow}>
              <div className={styles.metaItems}>
                <div className={styles.metaBlock}>
                  <span className={styles.metaVal}>{subject._count?.subCategories || 0}</span>
                  <span className={styles.metaLbl}>Topics</span>
                </div>
                <div className={styles.metaBlock}>
                  <span className={styles.metaVal}>{subject._count?.mcqs || 0}</span>
                  <span className={styles.metaLbl}>MCQs</span>
                </div>
              </div>
              <div className={styles.actionBtn}>
                <ArrowRight size={18} />
              </div>
            </div>
          </div>
        </Link>
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
            Explore All Subjects <ArrowRight size={18} />
          </Link>
        </div>
      )}
    </React.Fragment>
  );
}
