import React, { useState, useRef } from 'react';
import styles from '../admin.module.css';
import { Search, Plus } from 'lucide-react';
import { useContent } from '../hooks/useContent';
import { authFetch } from '../lib/authFetch';
import { API_BASE } from '@/lib/api';

export default function AnnouncementsJobsTab() {
  const { announcements, jobs, loading, error, refreshData } = useContent();
  const [subTab, setSubTab] = useState<'announcements' | 'jobs'>('announcements');
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 10;

  // Form refs for controlled inputs
  const annTitleRef = useRef<HTMLInputElement>(null);
  const annTypeRef = useRef<HTMLSelectElement>(null);
  const annBodyRef = useRef<HTMLTextAreaElement>(null);
  const annLinkRef = useRef<HTMLInputElement>(null);

  const jobTitleRef = useRef<HTMLInputElement>(null);
  const jobOrgRef = useRef<HTMLInputElement>(null);
  const jobLocationRef = useRef<HTMLInputElement>(null);
  const jobSalaryRef = useRef<HTMLInputElement>(null);
  const jobDeadlineRef = useRef<HTMLInputElement>(null);
  const jobLinkRef = useRef<HTMLInputElement>(null);
  const jobDescRef = useRef<HTMLTextAreaElement>(null);

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading content from database...</div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

  // Filter & Pagination
  const filteredAnnouncements = announcements.filter((a: any) => a.title.toLowerCase().includes(search.toLowerCase()));
  const announcementsPages = Math.ceil(filteredAnnouncements.length / itemsPerPage);
  const displayedAnnouncements = filteredAnnouncements.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const filteredJobs = jobs.filter((j: any) => j.title.toLowerCase().includes(search.toLowerCase()));
  const jobsPages = Math.ceil(filteredJobs.length / itemsPerPage);
  const displayedJobs = filteredJobs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const switchTab = (tab: 'announcements' | 'jobs') => {
    setSubTab(tab); setSearch(''); setCurrentPage(1); setShowForm(false);
  };

  const submitAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/content/announcement`, {
        method: 'POST',
        body: JSON.stringify({
          title: annTitleRef.current?.value,
          type: annTypeRef.current?.value,
          body: annBodyRef.current?.value,
          link: annLinkRef.current?.value || null,
        })
      });
      if (!res.ok) throw new Error('Failed to post announcement');
      setShowForm(false);
      refreshData?.();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const submitJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/content/job`, {
        method: 'POST',
        body: JSON.stringify({
          title: jobTitleRef.current?.value,
          organization: jobOrgRef.current?.value,
          location: jobLocationRef.current?.value,
          salary: jobSalaryRef.current?.value,
          deadline: jobDeadlineRef.current?.value,
          applyLink: jobLinkRef.current?.value,
          description: jobDescRef.current?.value,
        })
      });
      if (!res.ok) throw new Error('Failed to post job');
      setShowForm(false);
      refreshData?.();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: number) => {
    if (!confirm('Delete this announcement? This cannot be undone.')) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/content/announcement/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      refreshData?.();
    } catch (err: any) { alert(err.message); }
  };

  const handleDeleteJob = async (id: number) => {
    if (!confirm('Delete this job post? This cannot be undone.')) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/content/job/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      refreshData?.();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Announcements & Jobs Manager</h2>
        <button className={styles.quickActionBtn} onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add {subTab === 'announcements' ? 'Announcement' : 'Job'}
        </button>
      </div>

      <div className={styles.subTabs}>
        <button className={`${styles.subTabBtn} ${subTab === 'announcements' ? styles.subTabActive : ''}`} onClick={() => switchTab('announcements')}>Announcements</button>
        <button className={`${styles.subTabBtn} ${subTab === 'jobs' ? styles.subTabActive : ''}`} onClick={() => switchTab('jobs')}>Jobs Board</button>
      </div>

      {showForm && subTab === 'announcements' && (
        <div className={styles.formCard}>
          <h3>Post New Announcement</h3>
          <form className={styles.form} onSubmit={submitAnnouncement}>
            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Title</label>
                <input type="text" required className={styles.formInput} ref={annTitleRef} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Type</label>
                <select className={styles.formInput} required ref={annTypeRef}>
                  <option>Urgent</option><option>Info</option><option>Success</option><option>Update</option>
                </select>
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Body</label>
              <textarea className={styles.formInput} required rows={3} ref={annBodyRef} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Link (Optional)</label>
              <input type="url" className={styles.formInput} placeholder="https://" ref={annLinkRef} />
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>{submitting ? 'Publishing...' : 'Publish Announcement'}</button>
            </div>
          </form>
        </div>
      )}

      {showForm && subTab === 'jobs' && (
        <div className={styles.formCard}>
          <h3>Post New Job</h3>
          <form className={styles.form} onSubmit={submitJob}>
            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Job Title</label>
                <input type="text" required className={styles.formInput} ref={jobTitleRef} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Organization / Department</label>
                <input type="text" required className={styles.formInput} ref={jobOrgRef} />
              </div>
            </div>
            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Location</label>
                <input type="text" required className={styles.formInput} ref={jobLocationRef} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Salary</label>
                <input type="text" required className={styles.formInput} ref={jobSalaryRef} />
              </div>
            </div>
            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Deadline</label>
                <input type="date" required className={styles.formInput} ref={jobDeadlineRef} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Apply Link</label>
                <input type="url" required className={styles.formInput} ref={jobLinkRef} />
              </div>
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea className={styles.formInput} required rows={4} ref={jobDescRef} />
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>{submitting ? 'Publishing...' : 'Publish Job'}</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tableControls}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={20} color="rgba(255,255,255,0.5)" />
          <input type="text" placeholder={`Search ${subTab}...`} className={styles.searchInput}
            value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} />
        </div>
      </div>

      <div className={styles.tableContainer}>
        {subTab === 'announcements' ? (
          <table className={styles.dataTable}>
            <thead><tr><th>Title</th><th>Type</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {displayedAnnouncements.length === 0 ? (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '30px' }}>No announcements yet. Click "Add Announcement" to post one.</td></tr>
              ) : displayedAnnouncements.map((a: any) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 600 }}>{a.title}</td>
                  <td><span className={`${styles.badge} ${a.type === 'Urgent' ? styles.badgeUrgent : styles.badgeFree}`}>{a.type}</span></td>
                  <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDeleteAnnouncement(a.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={styles.dataTable}>
            <thead><tr><th>Job Title</th><th>Organization</th><th>Deadline</th><th>Posted</th><th>Actions</th></tr></thead>
            <tbody>
              {displayedJobs.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '30px' }}>No jobs posted yet. Click "Add Job" to post one.</td></tr>
              ) : displayedJobs.map((j: any) => (
                <tr key={j.id}>
                  <td style={{ fontWeight: 600 }}>{j.title}</td>
                  <td>{j.organization}</td>
                  <td style={{ color: '#ef4444' }}>{new Date(j.deadline).toLocaleDateString()}</td>
                  <td>{new Date(j.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDeleteJob(j.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={styles.pagination}>
        <span className={styles.pageInfo}>
          Showing {subTab === 'announcements' ? displayedAnnouncements.length : displayedJobs.length} of {subTab === 'announcements' ? filteredAnnouncements.length : filteredJobs.length} items
        </span>
        <div className={styles.pageButtons}>
          <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
          <span style={{ color: '#FFF', display: 'flex', alignItems: 'center' }}>Page {currentPage} of {subTab === 'announcements' ? announcementsPages : jobsPages}</span>
          <button className={styles.pageBtn} disabled={currentPage === (subTab === 'announcements' ? announcementsPages : jobsPages) || (subTab === 'announcements' ? announcementsPages : jobsPages) === 0} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
