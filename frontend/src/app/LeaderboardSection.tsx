'use client';

import { API_BASE } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import styles from './leaderboard.module.css';

export default function LeaderboardSection() {
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);

  useEffect(() => {
    fetch(API_BASE + '/api/public/leaderboard')
      .then(res => res.json())
      .then(data => {
        // Map database user data to leaderboard UI format
        const formatted = data.map((u: any, idx: number) => ({
          rank: idx + 1,
          name: u.name,
          score: `${Math.floor(u.xp / 100)}%`, // Score based on XP is fine
          avatar: <User size={24} />,
          tier: idx === 0 ? styles.gold : idx === 1 ? styles.silver : idx === 2 ? styles.bronze : '',
          tests: u.testsTaken || 0,
          hours: u.hoursStudied || 0
        }));
        setLeaderboard(formatted);
      })
      .catch(err => console.error(err));
  }, []);

  const topUsers = leaderboard.length >= 3 
    ? [leaderboard[1], leaderboard[0], leaderboard[2]] 
    : [];
    
  const runnerUps = leaderboard.length > 3 ? leaderboard.slice(3, 10) : [];

  return (
    <div className={styles.leaderboardContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Top Performers of the <span>Week</span></h2>
        <p className={styles.subtitle}>Compete with thousands of aspirants. See where you stand on the global leaderboard.</p>
      </div>

      <div className={styles.podium}>
        {topUsers.map((user) => (
          <div 
            key={user.rank} 
            className={`${styles.podiumItem} ${user.tier}`}
            onClick={() => setSelectedUser(user)}
          >
            <div className={styles.avatar}>{user.avatar}</div>
            <div className={styles.bar}>
              <div className={styles.name}>{user.name}</div>
              <div className={styles.score}>{user.score}</div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.mobileTopUsers}>
        {[...topUsers].sort((a, b) => a.rank - b.rank).map((user) => (
          <div 
            key={user.rank} 
            className={`${styles.runnerUpItem} ${styles.mobileTopItem}`}
            onClick={() => setSelectedUser(user)}
          >
            <div className={styles.runnerUpRank} style={{ color: user.rank === 1 ? '#FFD700' : user.rank === 2 ? '#C0C0C0' : '#CD7F32' }}>#{user.rank}</div>
            <div className={styles.runnerUpAvatar} style={{ borderColor: user.rank === 1 ? '#FFD700' : user.rank === 2 ? '#C0C0C0' : '#CD7F32' }}>{user.avatar}</div>
            <div className={styles.runnerUpInfo}>
              <div className={styles.runnerUpName}>{user.name}</div>
              <div className={styles.runnerUpMeta}>{user.tests} tests • {user.hours}h</div>
            </div>
            <div className={styles.runnerUpScore} style={{ color: user.rank === 1 ? '#FFD700' : user.rank === 2 ? '#C0C0C0' : '#CD7F32' }}>{user.score}</div>
          </div>
        ))}
      </div>

      <div className={styles.runnerUpsList}>
        {runnerUps.map((user) => (
          <div 
            key={user.rank} 
            className={styles.runnerUpItem}
            onClick={() => setSelectedUser(user)}
          >
            <div className={styles.runnerUpRank}>#{user.rank}</div>
            <div className={styles.runnerUpAvatar}>{user.avatar}</div>
            <div className={styles.runnerUpInfo}>
              <div className={styles.runnerUpName}>{user.name}</div>
              <div className={styles.runnerUpMeta}>{user.tests} tests • {user.hours}h</div>
            </div>
            <div className={styles.runnerUpScore}>{user.score}</div>
          </div>
        ))}
      </div>
      
      {selectedUser && (
        <div className={styles.modalOverlay} onClick={() => setSelectedUser(null)}>
          <div className={styles.modalCard} onClick={e => e.stopPropagation()}>
            <div className={styles.modalAvatar}>{selectedUser.avatar}</div>
            <h3 className={styles.modalName}>{selectedUser.name}</h3>
            <div className={styles.modalRank}>Global Rank: #{selectedUser.rank}</div>
            
            <div className={styles.statsGrid}>
              <div className={styles.statBox}>
                <div className={styles.statVal}>{selectedUser.score}</div>
                <div className={styles.statLbl}>Avg Score</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statVal}>{selectedUser.tests}</div>
                <div className={styles.statLbl}>Tests Attempted</div>
              </div>
              <div className={styles.statBox}>
                <div className={styles.statVal}>{selectedUser.hours}h</div>
                <div className={styles.statLbl}>Learning Time</div>
              </div>
            </div>
            
            <button className={styles.closeBtn} onClick={() => setSelectedUser(null)}>
              Close Profile
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
