'use client';

import { API_BASE } from '@/lib/api';
import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Crown, Target, TrendingUp, Zap, CheckCircle, Calendar, Activity, Briefcase, Flame } from 'lucide-react';
import styles from './profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [preferredSubjects, setPreferredSubjects] = React.useState<number[]>([]);
  const [savingSubjects, setSavingSubjects] = React.useState(false);
  const [dailyGoalTarget, setDailyGoalTarget] = React.useState<number>(20);
  const [savingGoal, setSavingGoal] = React.useState(false);

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const res = await fetch(API_BASE + '/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = await res.json();
        setUserProfile(data);
        setPreferredSubjects(data.preferredSubjectIds || []);
        setDailyGoalTarget(data.dailyGoalTarget || 20);

        const catRes = await fetch(API_BASE + '/api/mcqs/categories');
        if (catRes.ok) {
          const catData = await catRes.json();
          setCategories(catData);
        }
      } catch (error) {
        console.error(error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    // Force a full redirect to clear any state layout wrappers
    window.location.href = '/login';
  };

  const toggleSubject = async (categoryId: number) => {
    const updated = preferredSubjects.includes(categoryId)
      ? preferredSubjects.filter(id => id !== categoryId)
      : [...preferredSubjects, categoryId];
    
    setPreferredSubjects(updated);
    setSavingSubjects(true);

    try {
      const token = localStorage.getItem('token');
      await fetch(API_BASE + '/api/auth/me/subjects', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ subjectIds: updated })
      });
    } catch (e) {
      console.error('Failed to update subjects', e);
    } finally {
      setSavingSubjects(false);
    }
  };

  const handleUpdateGoalTarget = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setDailyGoalTarget(parseInt(e.target.value));
  };

  const saveDailyGoalTarget = async () => {
    setSavingGoal(true);
    try {
      const token = localStorage.getItem('token');
      await fetch(API_BASE + '/api/auth/me/goal', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ target: dailyGoalTarget })
      });
    } catch (e) {
      console.error('Failed to update daily goal', e);
    } finally {
      setSavingGoal(false);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '100px', textAlign: 'center' }}>Loading your profile...</div>;
  if (!userProfile) return null;

  const totalTests = userProfile.results?.length || 0;
  const avgScore = totalTests > 0 
    ? Math.round(userProfile.results.reduce((acc: number, r: any) => acc + (r.score / r.total) * 100, 0) / totalTests)
    : 0;

  const user = {
    name: userProfile.name,
    email: userProfile.email,
    initials: userProfile.name.substring(0, 2).toUpperCase(),
    isPremium: userProfile.subscriptions?.length > 0 || localStorage.getItem('role') === 'PREMIUM',
  };

  const stats = [
    { label: 'Tests Taken', value: totalTests.toString(), icon: <Target size={24} />, iconClass: styles.statIcon1 },
    { label: 'Day Streak', value: (userProfile.streak || 0).toString(), icon: <Flame size={24} />, iconClass: styles.statIcon2 },
    { label: 'Avg Score', value: `${avgScore}%`, icon: <TrendingUp size={24} />, iconClass: styles.statIcon3 },
  ];

  const recentActivity = userProfile.results?.map((r: any) => ({
    id: r.id,
    name: r.exam?.title || 'Practice Session',
    date: new Date(r.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    score: `${r.score}/${r.total}`
  })) || [];

  return (
    <>
      <div className={styles.pageContainer}>
        {/* Background Animated Orbs */}
        <div className={styles.orb1}></div>
        <div className={styles.orb2}></div>

        <div className={styles.content}>
          
          <motion.div 
            className={styles.header}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div>
              <h1 className={styles.title}>
                <Activity className={styles.titleIcon} size={32} /> 
                My <span className={styles.highlight}>Profile</span>
              </h1>
              <p className={styles.subtitle}>Track your performance and manage your account.</p>
            </div>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              <LogOut size={18} /> Log Out
            </button>
          </motion.div>

          <div className={styles.grid}>
            {/* Left Column: User Profile Sidebar */}
            <motion.div 
              className={styles.card}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className={styles.userInfo}>
                <div className={styles.avatar}>{user.initials}</div>
                <h2 className={styles.userName}>{user.name}</h2>
                <p className={styles.userEmail}>{user.email}</p>
                
                <div className={`${styles.planBadge} ${!user.isPremium ? styles.planBadgeFree : ''}`}>
                  {user.isPremium ? (
                    <><Crown size={16} /> Premium Member</>
                  ) : (
                    'Free Plan'
                  )}
                </div>

                <div style={{ marginTop: '40px', width: '100%', textAlign: 'left', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ color: '#FCD34D', fontSize: '1rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
                    <Target size={18} /> Daily Progress Target
                  </h3>
                  <p style={{ color: '#9CA3AF', fontSize: '0.85rem', marginBottom: '20px', lineHeight: '1.5' }}>
                    Set your daily MCQ goal to track on the Dashboard.
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <input 
                      type="range" 
                      min="10" 
                      max="200" 
                      step="10" 
                      value={dailyGoalTarget} 
                      onChange={handleUpdateGoalTarget}
                      onMouseUp={saveDailyGoalTarget}
                      onTouchEnd={saveDailyGoalTarget}
                      style={{ flex: 1, accentColor: '#F59E0B', cursor: 'pointer' }}
                    />
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#F59E0B', padding: '4px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', minWidth: '45px', textAlign: 'center' }}>
                      {dailyGoalTarget}
                    </div>
                  </div>
                  {savingGoal && <span style={{ color: '#10B981', fontSize: '0.8rem', marginTop: '10px', display: 'block' }}>Saving target...</span>}
                </div>

              </div>
            </motion.div>

            {/* Right Column: Stats & Activity */}
            <div>
              <motion.div 
                className={styles.statsGrid}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {stats.map((stat, idx) => (
                  <div key={idx} className={styles.statBox}>
                    <div className={`${styles.statIcon} ${stat.iconClass}`}>
                      {stat.icon}
                    </div>
                    <div className={styles.statValue}>{stat.value}</div>
                    <div className={styles.statLabel}>{stat.label}</div>
                  </div>
                ))}
              </motion.div>

              {/* Preferred Subjects Panel */}
              <motion.div 
                className={styles.card}
                style={{ display: 'flex', flexDirection: 'column', marginTop: '24px' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div>
                    <h3 className={styles.cardTitle} style={{ marginBottom: '4px' }}>My Study Subjects</h3>
                    <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', margin: 0 }}>Select the subjects you want to focus on. Your Classroom and Daily Tests will only include MCQs from these subjects.</p>
                  </div>
                  {savingSubjects && <div style={{ color: '#F59E0B', fontSize: '0.8rem' }}>Saving...</div>}
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                  {categories.map(cat => {
                    const isEnabled = preferredSubjects.includes(cat.id);
                    return (
                      <div 
                        key={cat.id} 
                        onClick={() => toggleSubject(cat.id)}
                        style={{ 
                          background: isEnabled ? 'rgba(245, 158, 11, 0.1)' : 'rgba(255,255,255,0.03)', 
                          border: isEnabled ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid rgba(255,255,255,0.1)',
                          padding: '16px', 
                          borderRadius: '12px', 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span style={{ color: isEnabled ? '#FFF' : 'rgba(255,255,255,0.5)', fontWeight: isEnabled ? 'bold' : 'normal' }}>
                          {cat.name}
                        </span>
                        <div style={{ 
                          width: '40px', height: '22px', 
                          background: isEnabled ? '#F59E0B' : 'rgba(255,255,255,0.2)', 
                          borderRadius: '20px', 
                          position: 'relative',
                          transition: 'background 0.3s'
                        }}>
                          <div style={{ 
                            width: '18px', height: '18px', 
                            background: '#FFF', 
                            borderRadius: '50%', 
                            position: 'absolute', 
                            top: '2px', 
                            left: isEnabled ? '20px' : '2px',
                            transition: 'left 0.3s'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              <motion.div 
                className={styles.card}
                style={{ display: 'flex', flexDirection: 'column', minHeight: '300px' }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className={styles.cardTitle}>Recent Activity</h3>
                <div className={styles.activityList} style={{ flex: 1 }}>
                  {recentActivity.length === 0 ? (
                    <div className={styles.emptyState} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      No recent activity found. Take a practice test to get started!
                    </div>
                  ) : (
                    recentActivity.map((activity: any) => (
                      <div key={activity.id} className={styles.activityItem}>
                        <div className={styles.activityLeft}>
                          <div className={styles.activityIcon}>
                            <CheckCircle size={20} />
                          </div>
                          <div>
                            <div className={styles.activityName}>{activity.name}</div>
                            <div className={styles.activityDate}>
                              <Calendar size={14} /> {activity.date}
                            </div>
                          </div>
                        </div>
                        <div className={styles.activityScore}>{activity.score} Points</div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
