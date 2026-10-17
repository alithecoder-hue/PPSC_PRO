'use client';

import { API_BASE } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './newsTicker.module.css';

export default function NewsTicker({ embedded = false }: { embedded?: boolean }) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);

  const [newsData, setNewsData] = useState<any[]>([]);
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'PREMIUM' || role === 'ADMIN') {
      setIsPremium(true);
    }
    fetch(API_BASE + '/api/public/announcements')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((d: any) => ({
          id: d.id,
          title: d.title,
          tag: d.type
        }));
        setNewsData(formatted);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (newsData.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsData.length);
    }, 4000); // Shuffle every 4 seconds

    return () => clearInterval(interval);
  }, [newsData.length]);

  if (newsData.length === 0) return null;

  const currentNews = newsData[currentIndex];

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
    <div style={embedded ? { width: '100%' } : { position: 'absolute', top: isPremium ? '20px' : '110px', width: '100%', zIndex: 20 }}>
      <div className={`${styles.tickerWrapper} ${isPremium && !embedded ? styles.premiumTheme : ''}`} onClick={() => router.push('/news')}>
      <div className={styles.tickerContent}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentNews.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className={styles.newsItem}
          >
            <div className={styles.liveIndicator} />
            <span className={`${styles.tag} ${getTagClass(currentNews.tag)}`}>
              {currentNews.tag}
            </span>
            <span className={styles.title}>
              {currentNews.title}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
    </div>
  );
}
