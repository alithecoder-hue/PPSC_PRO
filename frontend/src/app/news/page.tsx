'use client';

import { API_BASE } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import styles from './news.module.css';

export default function NewsPage() {
  const [newsData, setNewsData] = useState<any[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'PREMIUM' || role === 'ADMIN') setIsPremium(true);
    fetch(API_BASE + '/api/public/announcements')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          tag: d.type,
          date: new Date(d.createdAt).toLocaleDateString(),
          content: d.body
        }));
        setNewsData(formatted);
      })
      .catch(err => console.error(err));
  }, []);
  const getTagClass = (tag: string) => {
    switch (tag) {
      case 'Urgent': return styles.tagUrgent;
      case 'Alert': return styles.tagAlert;
      case 'New': return styles.tagNew;
      case 'Update':
      default: return styles.tagUpdate;
    }
  };

  return (
    <>
      <div className="orb-container">
        <div className="orb orb-1"></div>
        <div className="orb orb-3"></div>
      </div>

      <div className={`${styles.pageContainer} ${isPremium ? styles.premiumTheme : ''}`}>
        <div className={styles.layoutWrapper}>
          <div className={styles.header}>
            <h1 className={styles.title}>Latest Announcements</h1>
            <p className={styles.subtitle}>Stay updated with exam schedules, syllabus changes, and platform news.</p>
          </div>

          <div className={styles.newsGrid}>
            {newsData.map((news) => (
              <div key={news.id} className={styles.newsCard}>
                <div className={styles.cardHeader}>
                  <span className={`${styles.tag} ${getTagClass(news.tag)}`}>
                    {news.tag}
                  </span>
                  <span className={styles.date}>{news.date}</span>
                </div>
                <h3 className={styles.cardTitle}>{news.title}</h3>
                <p className={styles.cardContent}>{news.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
