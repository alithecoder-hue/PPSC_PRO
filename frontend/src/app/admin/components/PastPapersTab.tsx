import React, { useState } from 'react';
import styles from '../admin.module.css';
import { Search, Plus } from 'lucide-react';
import { useAcademics } from '../hooks/useAcademics';
import { authFetch } from '../lib/authFetch';
import { API_BASE } from '@/lib/api';

export default function PastPapersTab() {
  const { pastPapers: mockPastPapers, subjects, loading, error, refreshData } = useAcademics();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [submitting, setSubmitting] = useState(false);

  const titleRef = React.useRef<HTMLInputElement>(null);
  const yearRef = React.useRef<HTMLInputElement>(null);
  const subjectRef = React.useRef<HTMLSelectElement>(null);
  const mcqIdsRef = React.useRef<HTMLInputElement>(null);

  if (loading) return <div style={{ color: '#64748B', padding: '20px' }}>Loading academics data from database...</div>;
  if (error) return <div style={{ color: '#DC2626', padding: '20px' }}>Error: {error}</div>;

  const filteredPapers = mockPastPapers.filter((p: any) => p.title.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredPapers.length / itemsPerPage);
  const displayedPapers = filteredPapers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const type = (document.querySelector('input[name="type"]:checked') as HTMLInputElement)?.value || 'Free';
    
    try {
      const res = await authFetch(`${API_BASE}/api/admin/academics/pastpaper`, {
        method: 'POST',
        body: JSON.stringify({
          title: titleRef.current?.value,
          year: yearRef.current?.value,
          subject: subjectRef.current?.value,
          type,
          mcqIds: mcqIdsRef.current?.value
        })
      });
      if (!res.ok) throw new Error('Failed to save past paper');
      alert('Past Paper saved!');
      setShowForm(false);
      refreshData?.();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this past paper?')) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/academics/pastpaper/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      refreshData?.();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Past Papers Manager</h2>
        <button className={styles.quickActionBtn} onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Past Paper
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3>Add New Past Paper</h3>
          <form className={styles.form} onSubmit={submitForm}>
            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Title</label>
                <input type="text" required className={styles.formInput} placeholder='e.g. "PPSC Assistant 2023"' ref={titleRef} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Year</label>
                <input type="number" required className={styles.formInput} placeholder="2023" ref={yearRef} />
              </div>
            </div>

            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Subject</label>
                <select className={styles.formInput} required ref={subjectRef}>
                  {subjects.map((s: any) => <option key={s.id} value={s.name}>{s.name}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Type</label>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                  <label style={{ display: 'flex', gap: '8px', color: '#334155' }}><input type="radio" name="type" value="Free" defaultChecked required /> Free</label>
                  <label style={{ display: 'flex', gap: '8px', color: '#334155' }}><input type="radio" name="type" value="Premium" /> Premium</label>
                </div>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Instructions</label>
              <textarea className={styles.formInput} rows={3}></textarea>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>MCQ IDs (comma separated)</label>
              <input type="text" className={styles.formInput} placeholder="e.g. 101, 105, 120" ref={mcqIdsRef} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Status</label>
              <select className={styles.formInput}>
                <option>Active</option>
                <option>Draft</option>
              </select>
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>{submitting ? 'Saving...' : 'Save Past Paper'}</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tableControls}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={20} color="#94A3B8" />
          <input 
            type="text" 
            placeholder="Search past papers..." 
            className={styles.searchInput}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Year</th>
              <th>Subject</th>
              <th>Total MCQs</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedPapers.map((p: any) => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.title}</td>
                <td>{p.year}</td>
                <td>{p.subject || 'CS'}</td>
                <td>{p.mcqIds?.length || 0}</td>
                <td><span className={`${styles.badge} ${p.type === 'Premium' ? styles.badgePremium : styles.badgeFree}`}>{p.type || 'Free'}</span></td>
                <td><span style={{ color: '#16A34A' }}>● Active</span></td>
                <td>
                  <button className={`${styles.actionBtn}`}>Edit</button>
                  <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(p.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span className={styles.pageInfo}>Showing {displayedPapers.length} of {filteredPapers.length} items</span>
        <div className={styles.pageButtons}>
          <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
          <span style={{ color: '#0F1E33', display: 'flex', alignItems: 'center' }}>Page {currentPage} of {totalPages || 1}</span>
          <button className={styles.pageBtn} disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
