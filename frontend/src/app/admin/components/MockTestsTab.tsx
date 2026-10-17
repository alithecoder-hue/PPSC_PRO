import React, { useState, useRef } from 'react';
import styles from '../admin.module.css';
import { Search, Plus } from 'lucide-react';
import { useAcademics } from '../hooks/useAcademics';
import { authFetch } from '../lib/authFetch';
import { API_BASE } from '@/lib/api';

export default function MockTestsTab() {
  const { pastPapers: exams, subjects, loading, error, refreshData } = useAcademics();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const itemsPerPage = 10;

  // MCQ Engine States
  const [mcqMode, setMcqMode] = useState<'random' | 'manual'>('random');
  const [allocations, setAllocations] = useState<{subjectId: number, count: number}[]>([]);
  const [difficulty, setDifficulty] = useState('Mixed');
  const [manualMcqIdsText, setManualMcqIdsText] = useState('');

  const addAllocation = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    if (!isNaN(id) && !allocations.find(a => a.subjectId === id)) {
      setAllocations([...allocations, { subjectId: id, count: 20 }]);
    }
    e.target.value = "";
  };

  const removeAllocation = (id: number) => {
    setAllocations(allocations.filter(a => a.subjectId !== id));
  };

  const updateAllocationCount = (id: number, count: number) => {
    setAllocations(allocations.map(a => a.subjectId === id ? { ...a, count } : a));
  };

  const titleRef = useRef<HTMLInputElement>(null);
  const categoryIdRef = useRef<HTMLSelectElement>(null);
  const durationRef = useRef<HTMLInputElement>(null);
  const typeRef = useRef<HTMLSelectElement>(null);
  const totalMarksRef = useRef<HTMLInputElement>(null);
  const instructionsRef = useRef<HTMLTextAreaElement>(null);
  const statusRef = useRef<HTMLInputElement>(null);

  if (loading) return <div style={{ color: '#64748B', padding: '20px' }}>Loading exams from database...</div>;
  if (error) return <div style={{ color: '#DC2626', padding: '20px' }}>Error: {error}</div>;

  const filteredTests = exams.filter((t: any) => t.title.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.ceil(filteredTests.length / itemsPerPage);
  const displayedTests = filteredTests.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    let generatorConfig = null;
    if (mcqMode === 'random') {
      generatorConfig = {
        mode: 'random',
        allocations: allocations,
        difficulty: difficulty
      };
    } else {
      const ids = manualMcqIdsText.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      generatorConfig = {
        mode: 'manual',
        manualMcqIds: ids
      };
    }

    try {
      const res = await authFetch(`${API_BASE}/api/admin/academics/exam`, {
        method: 'POST',
        body: JSON.stringify({
          title: titleRef.current?.value,
          categoryId: categoryIdRef.current?.value ? parseInt(categoryIdRef.current.value) : null,
          duration: durationRef.current?.value ? parseInt(durationRef.current.value) * 60 : 5400,
          type: typeRef.current?.value || 'Free',
          totalMarks: totalMarksRef.current?.value ? parseInt(totalMarksRef.current.value) : 100,
          instructions: instructionsRef.current?.value || '',
          status: (document.querySelector('input[name="status"]:checked') as HTMLInputElement)?.value || 'Draft',
          generatorConfig
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create exam');
      }
      setShowForm(false);
      refreshData?.();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Delete exam "${title}"? This cannot be undone.`)) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/academics/exam/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      refreshData?.();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Mock Tests & Past Papers</h2>
        <button className={styles.quickActionBtn} onClick={() => setShowForm(true)}>
          <Plus size={16} /> Create Mock Test
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3>Create New Mock Test</h3>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Test Title</label>
                <input type="text" required className={styles.formInput} placeholder="e.g. FIA Inspector Past Paper 2024" ref={titleRef} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Total Marks</label>
                <input type="number" required className={styles.formInput} placeholder="100" ref={totalMarksRef} defaultValue={100} />
              </div>
            </div>

            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Duration (Minutes)</label>
                <input type="number" required className={styles.formInput} placeholder="90" ref={durationRef} defaultValue={90} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Access Type</label>
                <select className={styles.formInput} ref={typeRef}>
                  <option value="Free">Free</option>
                  <option value="Premium">Premium Only</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Instructions (Optional)</label>
              <textarea className={styles.formInput} rows={3} placeholder="Any specific instructions for students..." ref={instructionsRef} />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Status</label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', gap: '8px', color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" name="status" value="Active" defaultChecked ref={statusRef} /> Publish Now (Active)
                </label>
                <label style={{ display: 'flex', gap: '8px', color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" name="status" value="Draft" /> Save as Draft
                </label>
              </div>
            </div>

            <hr style={{ borderColor: '#E6EAF0', margin: '20px 0' }} />
            
            <h4 style={{ color: '#B45309', marginBottom: '15px' }}>MCQ Selection Engine</h4>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Generation Mode</label>
              <div style={{ display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', gap: '8px', color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" checked={mcqMode === 'random'} onChange={() => setMcqMode('random')} /> System Random Picker
                </label>
                <label style={{ display: 'flex', gap: '8px', color: '#334155', cursor: 'pointer' }}>
                  <input type="radio" checked={mcqMode === 'manual'} onChange={() => setMcqMode('manual')} /> Manual IDs Selection
                </label>
              </div>
            </div>

            {mcqMode === 'random' ? (
              <div style={{ background: '#F8FAFC', padding: '15px', borderRadius: '8px', border: '1px solid #E6EAF0' }}>
                <div className={styles.formGroup} style={{ marginBottom: '15px' }}>
                  <label className={styles.formLabel}>Add Custom Subject Allocation</label>
                  <select className={styles.formInput} onChange={addAllocation}>
                    <option value="">-- Select a Subject to add --</option>
                    {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                
                {allocations.length > 0 && (
                  <div style={{ marginBottom: '20px' }}>
                    <label className={styles.formLabel}>Allocations</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {allocations.map((a, idx) => {
                        const subName = (subjects as any[]).find((s: any) => s.id === a.subjectId)?.name || 'Unknown';
                        return (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#FFFFFF', border: '1px solid #E6EAF0', padding: '10px 15px', borderRadius: '8px' }}>
                            <span style={{ color: '#B45309', fontWeight: 'bold', width: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{subName}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <label style={{ fontSize: '0.85rem', color: '#334155' }}>MCQs:</label>
                              <input 
                                type="number" 
                                className={styles.formInput} 
                                style={{ width: '80px', padding: '4px 8px' }} 
                                value={a.count} 
                                min={1} 
                                onChange={(e) => updateAllocationCount(a.subjectId, parseInt(e.target.value) || 0)} 
                              />
                            </div>
                            <button type="button" style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', fontSize: '0.85rem' }} onClick={() => removeAllocation(a.subjectId)}>Remove</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                
                {allocations.length === 0 && (
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', marginBottom: '15px' }}>
                    No subjects selected. The system will pick random MCQs from ALL available subjects. Add a subject above to set specific amounts.
                  </p>
                )}

                <div className={styles.optionsGrid}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Difficulty</label>
                    <select className={styles.formInput} value={difficulty} onChange={e => setDifficulty(e.target.value)}>
                      <option value="Mixed">Mixed</option>
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ background: '#F8FAFC', padding: '15px', borderRadius: '8px', border: '1px solid #E6EAF0' }}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Enter MCQ IDs (comma separated)</label>
                  <textarea 
                    className={styles.formInput} 
                    rows={4} 
                    placeholder="e.g. 104, 105, 110, 245" 
                    value={manualMcqIdsText} 
                    onChange={e => setManualMcqIdsText(e.target.value)} 
                  />
                  <p style={{ color: '#94A3B8', fontSize: '0.8rem', marginTop: '5px' }}>Find these IDs in the MCQs Database tab.</p>
                </div>
              </div>
            )}

            <div className={styles.formActions} style={{ marginTop: '20px' }}>
              <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Test'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tableControls}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={20} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search mock tests..."
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
              <th>Duration</th>
              <th>Marks</th>
              <th>MCQs</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedTests.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: '#94A3B8', padding: '40px' }}>
                  No exams yet. Click "Create Mock Test" to add one.
                </td>
              </tr>
            ) : displayedTests.map((test: any) => (
              <tr key={test.id}>
                <td style={{ fontWeight: 600 }}>{test.title}</td>
                <td>{Math.round((test.duration || 5400) / 60)} mins</td>
                <td>{test.totalMarks ?? '—'}</td>
                <td style={{ color: '#B45309' }}>{test.mcqIds?.length || 0}</td>
                <td>
                  <span className={`${styles.badge} ${test.type === 'Premium' ? styles.badgePremium : styles.badgeFree}`}>
                    {test.type || 'Free'}
                  </span>
                </td>
                <td>
                  {test.status === 'Active'
                    ? <span style={{ color: '#16A34A' }}>● Active</span>
                    : <span style={{ color: '#94A3B8' }}>● Draft</span>}
                </td>
                <td>
                  <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(test.id, test.title)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span className={styles.pageInfo}>Showing {displayedTests.length} of {filteredTests.length} tests</span>
        <div className={styles.pageButtons}>
          <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
          <span style={{ color: '#0F1E33', display: 'flex', alignItems: 'center' }}>Page {currentPage} of {totalPages || 1}</span>
          <button className={styles.pageBtn} disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
