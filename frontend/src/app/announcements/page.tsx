'use client';

import React, { useState, useEffect } from 'react';
import styles from './announcements.module.css';
import { API_BASE } from '@/lib/api';
import { BellRing } from 'lucide-react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_BASE + '/api/public/announcements')
      .then(res => res.json())
      .then(data => {
        setAnnouncements(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Latest <span>Announcements</span></h1>
          <p className={styles.subtitle}>Stay updated with the latest exam dates, platform features, and syllabus changes.</p>
        </div>

        <div className={styles.timeline}>
          {loading && <div style={{ color: 'rgba(255,255,255,0.5)', textAlign: 'center', padding: '40px' }}>Loading announcements...</div>}
          
          {!loading && announcements.length === 0 && (
            <div style={{ color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '60px' }}>
              <BellRing size={48} style={{ opacity: 0.5, marginBottom: '15px' }} />
              <p>No announcements yet. Check back soon!</p>
            </div>
          )}

          {announcements.map((announcement: any) => (
            <div key={announcement.id} className={styles.announcementCard}>
              <span className={styles.date}>{new Date(announcement.createdAt).toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <h2 className={styles.cardTitle}>{announcement.title}</h2>
              <p className={styles.content}>{announcement.body}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
