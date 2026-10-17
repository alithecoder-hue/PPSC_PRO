import { API_BASE } from '@/lib/api';
import React, { useState } from 'react';
import styles from '../admin.module.css';
import { Search, Upload, Plus, Download, AlertTriangle, UploadCloud, CheckCircle, Rocket } from 'lucide-react';
import { useAcademics } from '../hooks/useAcademics';
import { authFetch } from '../lib/authFetch';

export default function SubjectsTab() {
  const { subjects, mcqs, loading, error, refreshData } = useAcademics();
  const [activeForm, setActiveForm] = useState<'none' | 'subject' | 'topic' | 'mcq' | 'csv' | 'edit-subject' | 'edit-mcq'>('none');
  const [editId, setEditId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'subjects' | 'mcqs'>('mcqs');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    subCategoryId: '',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOption: 'A',
    difficulty: 'Medium'
  });
  const [isUrduMcq, setIsUrduMcq] = useState(false);

  const [csvPreview, setCsvPreview] = useState<any[]>([]);

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading academics data from database...</div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

  // Filter & Pagination
  const filteredData = viewMode === 'subjects' 
    ? subjects.filter((s: any) => s.name.toLowerCase().includes(search.toLowerCase()))
    : (mcqs || []).filter((m: any) => m.question.toLowerCase().includes(search.toLowerCase()));

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const displayedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const rows = text.split('\n').filter(r => r.trim() !== '');
        // Preview first 5 rows (skip header)
        const preview = rows.slice(1, 6).map(row => {
          const cols = row.split(',');
          return { question: cols[0], subject: cols[6], topic: cols[7] }; // Mock mapping
        });
        setCsvPreview(preview);
      };
      reader.readAsText(file);
    }
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    let url = '';
    let payload = {};
    let method = 'POST';

    if (activeForm === 'subject') {
      url = '/api/admin/academics/subject';
      payload = { name: formData.name, description: formData.description };
    } else if (activeForm === 'edit-subject') {
      url = `/api/admin/academics/subject/${editId}`;
      method = 'PUT';
      payload = { name: formData.name, description: formData.description };
    } else if (activeForm === 'topic') {
      url = '/api/admin/academics/topic';
      payload = { name: formData.name, categoryId: formData.categoryId };
    } else if (activeForm === 'mcq') {
      url = '/api/admin/academics/mcq';
      payload = { ...formData };
    } else if (activeForm === 'edit-mcq') {
      url = `/api/admin/academics/mcq/${editId}`;
      method = 'PUT';
      payload = { ...formData };
    }

    try {
      const res = await authFetch(`${API_BASE}${url}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert('Saved successfully!');
        if (refreshData) refreshData();
        setActiveForm('none');
        setEditId(null);
        setFormData({ ...formData, name: '', description: '', question: '', optionA: '', optionB: '', optionC: '', optionD: '' });
      } else {
        alert('Failed to save.');
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to server.');
    }
  };

  const handleEditSubject = (sub: any) => {
    setEditId(sub.id);
    setFormData({ ...formData, name: sub.name, description: sub.description || '' });
    setActiveForm('edit-subject');
  };

  const handleDeleteSubject = async (id: number) => {
    if (!confirm('Are you sure you want to delete this subject? It cannot have linked topics or MCQs.')) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/academics/subject/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Deleted successfully');
        if (refreshData) refreshData();
      } else {
        alert('Failed to delete subject. Please ensure it has no linked topics or MCQs.');
      }
    } catch (err) {
      alert('Error deleting subject');
    }
  };

  const handleEditMcq = (m: any) => {
    setEditId(m.id);
    setFormData({ 
      ...formData, 
      question: m.question, 
      optionA: m.optionA, optionB: m.optionB, optionC: m.optionC, optionD: m.optionD,
      correctOption: m.correctOption,
      difficulty: m.difficulty || 'Medium'
    });
    setActiveForm('edit-mcq');
  };

  const handleDeleteMcq = async (id: number) => {
    if (!confirm('Are you sure you want to delete this MCQ?')) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/academics/mcq/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Deleted successfully');
        if (refreshData) refreshData();
      } else {
        alert('Failed to delete MCQ.');
      }
    } catch (err) {
      alert('Error deleting MCQ');
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Subjects & MCQs Manager</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button className={styles.quickActionBtn} onClick={() => setActiveForm('subject')}>
            <Plus size={16} /> Add Subject
          </button>
          <button className={styles.quickActionBtn} onClick={() => setActiveForm('topic')}>
            <Plus size={16} /> Add Topic
          </button>
          <button className={styles.quickActionBtn} onClick={() => setActiveForm('mcq')}>
            <Plus size={16} /> Add MCQ
          </button>
          <button className={styles.quickActionBtn} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }} onClick={() => setActiveForm('csv')}>
            <Upload size={16} /> Bulk CSV
          </button>
        </div>
      </div>

      {/* Forms Area */}
      {(activeForm === 'subject' || activeForm === 'edit-subject') && (
        <div className={styles.formCard}>
          <h3>{activeForm === 'edit-subject' ? 'Edit Subject' : 'Add New Subject'}</h3>
          <form className={styles.form} onSubmit={submitForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Subject Name</label>
              <input type="text" required className={styles.formInput} placeholder="e.g. Computer Science" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description</label>
              <textarea className={styles.formInput} required rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => { setActiveForm('none'); setEditId(null); }}>Cancel</button>
              <button type="submit" className={styles.submitBtn}>{activeForm === 'edit-subject' ? 'Update Subject' : 'Save Subject'}</button>
            </div>
          </form>
        </div>
      )}

      {activeForm === 'topic' && (
        <div className={styles.formCard}>
          <h3>Add New Topic</h3>
          <form className={styles.form} onSubmit={submitForm}>
            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Topic Name</label>
                <input type="text" required className={styles.formInput} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Parent Subject</label>
                <select className={styles.formInput} required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}>
                  <option value="">Select a Subject...</option>
                  {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setActiveForm('none')}>Cancel</button>
              <button type="submit" className={styles.submitBtn}>Save Topic</button>
            </div>
          </form>
        </div>
      )}

      {(activeForm === 'mcq' || activeForm === 'edit-mcq') && (
        <div className={styles.formCard}>
          <h3>{activeForm === 'edit-mcq' ? 'Edit MCQ' : 'Add Single MCQ'}</h3>
          <form className={styles.form} onSubmit={submitForm}>
            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Subject</label>
                <select className={styles.formInput} required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value, subCategoryId: ''})}>
                  <option value="">Select a Subject...</option>
                  {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Topic</label>
                <select className={styles.formInput} required value={formData.subCategoryId} onChange={e => setFormData({...formData, subCategoryId: e.target.value})}>
                  <option value="">Select a Topic...</option>
                  {(subjects.find((s: any) => s.id === parseInt(formData.categoryId)) as any)?.subCategories?.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className={styles.formLabel}>Question Text</label>
                <button
                  type="button"
                  onClick={() => setIsUrduMcq(!isUrduMcq)}
                  style={{
                    padding: '5px 12px', borderRadius: '6px', cursor: 'pointer',
                    border: `1px solid ${isUrduMcq ? '#F59E0B' : 'rgba(255,255,255,0.2)'}`,
                    background: isUrduMcq ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.05)',
                    color: isUrduMcq ? '#F59E0B' : 'rgba(255,255,255,0.6)',
                    fontFamily: "'Noto Naskh Arabic', serif",
                    fontSize: '0.9rem', fontWeight: 700
                  }}
                >
                  {isUrduMcq ? '✓ اردو موڈ' : 'اردو MCQ'}
                </button>
              </div>
              <textarea
                className={styles.formInput}
                required
                rows={3}
                value={formData.question}
                onChange={e => setFormData({...formData, question: e.target.value})}
                style={isUrduMcq ? {
                  direction: 'rtl', textAlign: 'right',
                  fontFamily: "'Noto Naskh Arabic', 'Noto Nastaliq Urdu', serif",
                  fontSize: '1.1rem', lineHeight: '2.2'
                } : {}}
                placeholder={isUrduMcq ? 'سوال یہاں لکھیں...' : ''}
              />
            </div>

            <div className={styles.optionsGrid}>
              {(['A','B','C','D'] as const).map((letter) => {
                const key = `option${letter}` as 'optionA'|'optionB'|'optionC'|'optionD';
                return (
                  <div className={styles.formGroup} key={letter}>
                    <label className={styles.formLabel}>Option {letter}</label>
                    <input
                      required
                      type="text"
                      className={styles.formInput}
                      value={formData[key]}
                      onChange={e => setFormData({...formData, [key]: e.target.value})}
                      style={isUrduMcq ? {
                        direction: 'rtl', textAlign: 'right',
                        fontFamily: "'Noto Naskh Arabic', serif",
                        fontSize: '1rem', lineHeight: '2'
                      } : {}}
                      placeholder={isUrduMcq ? `آپشن ${letter}` : ''}
                    />
                  </div>
                );
              })}
            </div>

            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Correct Answer</label>
                <select className={styles.formInput} required value={formData.correctOption} onChange={e => setFormData({...formData, correctOption: e.target.value})}>
                  <option value="A">A</option><option value="B">B</option><option value="C">C</option><option value="D">D</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Difficulty</label>
                <select className={styles.formInput} required value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                  <option value="Easy">Easy</option><option value="Medium">Medium</option><option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => { setActiveForm('none'); setEditId(null); }}>Cancel</button>
              <button type="submit" className={styles.submitBtn}>{activeForm === 'edit-mcq' ? 'Update MCQ' : 'Save MCQ'}</button>
            </div>
          </form>
        </div>
      )}

      {activeForm === 'csv' && (
        <div className={styles.formCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Download size={20} /> Bulk MCQ Import via CSV</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', marginTop: '6px', fontSize: '0.9em' }}>
                Import hundreds of MCQs at once. Download the template, fill it in Excel or Google Sheets, then upload.
              </p>
            </div>
            <button
              className={styles.quickActionBtn}
              style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', borderColor: 'rgba(16,185,129,0.3)', whiteSpace: 'nowrap', flexShrink: 0 }}
              onClick={() => {
                const header = 'question,optionA,optionB,optionC,optionD,correctOption,subject,difficulty,explanation';
                const example1 = '"Who was the founder of Pakistan?","Muhammad Ali Jinnah","Liaquat Ali Khan","Sir Syed Ahmed Khan","Allama Iqbal","A","General Knowledge","Easy","Quaid-e-Azam founded Pakistan in 1947"';
                const example2 = '"What does CPU stand for?","Central Processing Unit","Computer Power Unit","Central Power Unit","Computer Processing Unit","A","Computer Science","Easy",""';
                const example3 = '"Capital of Pakistan?","Islamabad","Karachi","Lahore","Peshawar","A","General Knowledge","Easy",""';
                const csv = [header, example1, example2, example3].join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'meritmaster_mcq_template.csv';
                a.click();
              }}
            >
              ⬇ Download Template
            </button>
          </div>

          {/* Column reference */}
          <div style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)', borderRadius: '8px', padding: '12px 16px', marginBottom: '20px', fontSize: '0.85em' }}>
            <strong style={{ color: '#F59E0B' }}>Required columns:</strong>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}> question, optionA, optionB, optionC, optionD, correctOption (A/B/C/D), subject</span>
            <br />
            <strong style={{ color: '#F59E0B' }}>Optional columns:</strong>
            <span style={{ color: 'rgba(255,255,255,0.7)' }}> difficulty (Easy/Medium/Hard), explanation</span>
            <br />
            <strong style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={16} /> Subject name must exactly match a subject already created in your database.</strong>
            <br />
            <span style={{ color: 'rgba(255,255,255,0.5)' }}>Current subjects: {subjects.map((s: any) => s.name).join(', ') || 'None — create subjects first!'}</span>
          </div>

          <div className={styles.csvUploadArea}>
            <p className={styles.csvUploadText} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}><UploadCloud size={24} /> Drag & Drop your CSV file here or click to browse</p>
            <label className={styles.csvUploadLabel}>
              Choose CSV File
              <input
                type="file"
                accept=".csv"
                className={styles.hiddenInput}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = (ev) => {
                    const text = ev.target?.result as string;
                    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
                    if (lines.length < 2) { alert('File appears empty or has only a header row.'); return; }

                    // Parse header
                    const parseRow = (line: string): string[] => {
                      const result: string[] = [];
                      let inQuote = false, cur = '';
                      for (let i = 0; i < line.length; i++) {
                        const ch = line[i];
                        if (ch === '"') { inQuote = !inQuote; }
                        else if (ch === ',' && !inQuote) { result.push(cur.trim()); cur = ''; }
                        else { cur += ch; }
                      }
                      result.push(cur.trim());
                      return result;
                    };

                    const headers = parseRow(lines[0]).map(h => h.replace(/"/g, '').trim().toLowerCase());
                    const parsed = lines.slice(1).map(line => {
                      const cols = parseRow(line);
                      const obj: any = {};
                      headers.forEach((h, i) => { obj[h] = (cols[i] || '').replace(/^"|"$/g, '').trim(); });
                      // Normalise known variants
                      obj.optionA = obj.optionA || obj.option_a || obj.a;
                      obj.optionB = obj.optionB || obj.option_b || obj.b;
                      obj.optionC = obj.optionC || obj.option_c || obj.c;
                      obj.optionD = obj.optionD || obj.option_d || obj.d;
                      obj.correctOption = obj.correctOption || obj.correct_answer || obj.answer || obj.correct;
                      obj.subject = obj.subject || obj.category;
                      return obj;
                    }).filter(r => r.question);
                    setCsvPreview(parsed);
                  };
                  reader.readAsText(file);
                }}
              />
            </label>
          </div>

          {csvPreview.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h4 style={{ color: '#F59E0B', margin: 0 }}>
                  Preview — {csvPreview.length} MCQ{csvPreview.length !== 1 ? 's' : ''} detected
                </h4>
                <button
                  className={styles.cancelBtn}
                  style={{ padding: '4px 12px', fontSize: '0.8em' }}
                  onClick={() => setCsvPreview([])}
                >
                  Clear
                </button>
              </div>
              <div className={styles.tableContainer} style={{ maxHeight: '280px', overflowY: 'auto' }}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Question</th>
                      <th>A</th><th>B</th><th>C</th><th>D</th>
                      <th>Answer</th>
                      <th>Subject</th>
                      <th>Difficulty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((r: any, i: number) => (
                      <tr key={i}>
                        <td style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8em' }}>{i + 1}</td>
                        <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={r.question}>{r.question}</td>
                        <td style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85em' }}>{r.optionA}</td>
                        <td style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85em' }}>{r.optionB}</td>
                        <td style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85em' }}>{r.optionC}</td>
                        <td style={{ maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85em' }}>{r.optionD}</td>
                        <td style={{ fontWeight: 700, color: '#F59E0B' }}>{r.correctOption?.toUpperCase()}</td>
                        <td style={{ color: r.subject ? '#fff' : '#ef4444' }}>{r.subject || <span style={{display:'flex', alignItems:'center', gap:4}}><AlertTriangle size={14}/> Missing</span>}</td>
                        <td style={{ fontSize: '0.85em', color: 'rgba(255,255,255,0.6)' }}>{r.difficulty || 'Medium'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.formActions} style={{ marginTop: '20px' }}>
                <button type="button" className={styles.cancelBtn} onClick={() => { setCsvPreview([]); setActiveForm('none'); }}>Cancel</button>
                <button
                  type="button"
                  className={styles.submitBtn}
                  onClick={async () => {
                    if (!confirm(`Import ${csvPreview.length} MCQs into the database?`)) return;
                    try {
                      const res = await authFetch(`${API_BASE}/api/admin/academics/mcq/bulk`, {
                        method: 'POST',
                        body: JSON.stringify({ mcqs: csvPreview })
                      });
                      const result = await res.json();
                      if (!res.ok) { alert('Import failed: ' + result.error); return; }

                      let msg = `✅ ${result.message}`;
                      if (result.skippedDetails?.length > 0) {
                        msg += '\n\nSkipped rows:\n' + result.skippedDetails.map((s: any) => `Row ${s.row}: ${s.reason}`).join('\n');
                      }
                      alert(msg);
                      setCsvPreview([]);
                      setActiveForm('none');
                      refreshData?.();
                    } catch (err) {
                      alert('Connection error during import.');
                    }
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Rocket size={18} /> Import {csvPreview.length} MCQs</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className={styles.tableControls} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={20} color="rgba(255,255,255,0.5)" />
          <input 
            type="text" 
            placeholder={`Search ${viewMode}...`} 
            className={styles.searchInput}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className={`${styles.quickActionBtn} ${viewMode === 'subjects' ? styles.active : ''}`}
            onClick={() => { setViewMode('subjects'); setCurrentPage(1); setSearch(''); }}
          >
            Subjects
          </button>
          <button 
            className={`${styles.quickActionBtn} ${viewMode === 'mcqs' ? styles.active : ''}`}
            onClick={() => { setViewMode('mcqs'); setCurrentPage(1); setSearch(''); }}
          >
            MCQs
          </button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        {viewMode === 'subjects' ? (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Subject Name</th>
                <th>Total Topics</th>
                <th>Total MCQs</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((sub: any) => (
                <tr key={sub.id}>
                  <td style={{ fontWeight: 600 }}>{sub.name}</td>
                  <td>{sub._count?.subCategories || 0}</td>
                  <td>{sub._count?.mcqs || 0}</td>
                  <td>
                    <button className={`${styles.actionBtn}`} onClick={() => handleEditSubject(sub)}>Edit</button>
                    <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDeleteSubject(sub.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>Question</th>
                <th>Options</th>
                <th>Answer</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((m: any) => (
                <tr key={m.id}>
                  <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.question}</td>
                  <td style={{ fontSize: '0.85em', color: 'rgba(255,255,255,0.6)' }}>
                    A: {m.optionA} | B: {m.optionB} | C: {m.optionC} | D: {m.optionD}
                  </td>
                  <td style={{ fontWeight: 600, color: '#F59E0B' }}>{m.correctOption}</td>
                  <td>
                    <button className={`${styles.actionBtn}`} onClick={() => handleEditMcq(m)}>Edit</button>
                    <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDeleteMcq(m.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <span className={styles.pageInfo}>Showing {displayedData.length} of {filteredData.length} {viewMode}</span>
        <div className={styles.pageButtons}>
          <button 
            className={styles.pageBtn} 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Prev
          </button>
          <span style={{ color: '#FFF', display: 'flex', alignItems: 'center' }}>Page {currentPage} of {totalPages}</span>
          <button 
            className={styles.pageBtn} 
            disabled={currentPage === totalPages || totalPages === 0} 
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
