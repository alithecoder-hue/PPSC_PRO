import React from 'react';
import styles from '../admin.module.css';
import { PlusCircle } from 'lucide-react';
import { useAdminData } from '../useAdminData';

export default function OverviewTab() {
  const { stats, loading, error } = useAdminData();

  if (loading) return <div style={{ color: '#64748B', padding: '20px' }}>Loading dashboard stats...</div>;
  if (error) return <div style={{ color: '#DC2626', padding: '20px' }}>Error: {error}</div>;

  const recentActivity: any[] = stats?.recentActivity || [];

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Platform Overview</h2>
      </div>
      
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Users</span>
          <span className={styles.statValue}>{stats?.totalUsers ?? 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Premium Subs</span>
          <span className={styles.statValue}>{stats?.premiumUsers ?? 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total MCQs</span>
          <span className={styles.statValue}>{stats?.totalMCQs ?? 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Tests</span>
          <span className={styles.statValue}>{stats?.activeTests ?? 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Jobs Posted</span>
          <span className={styles.statValue}>{stats?.jobsPosted ?? 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Announcements</span>
          <span className={styles.statValue}>{stats?.announcements ?? 0}</span>
        </div>
      </div>

      <div className={styles.quickActions}>
        <button className={styles.quickActionBtn}>
          <PlusCircle size={18} /> Add MCQ
        </button>
        <button className={styles.quickActionBtn}>
          <PlusCircle size={18} /> Add Announcement
        </button>
        <button className={styles.quickActionBtn}>
          <PlusCircle size={18} /> Post Job
        </button>
      </div>

      <h3 style={{ color: '#0F1E33', marginBottom: '15px' }}>Recent Activity (Last 10)</h3>
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Action / Event</th>
              <th>Entity Affected</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {recentActivity.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center', color: '#94A3B8', padding: '30px' }}>
                  No activity logged yet. Actions taken in the admin panel will appear here.
                </td>
              </tr>
            ) : (
              recentActivity.map((activity: any) => (
                <tr key={activity.id}>
                  <td style={{ fontWeight: 500, color: '#B45309' }}>{activity.action}</td>
                  <td>{activity.entity}</td>
                  <td>{new Date(activity.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
