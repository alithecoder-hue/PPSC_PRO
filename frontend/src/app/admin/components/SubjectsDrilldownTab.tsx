"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';

const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });
import styles from '../admin.module.css';
import { API_BASE } from '@/lib/api';
import { authFetch } from '../lib/authFetch';
import { ChevronRight, ArrowLeft, BookOpen, Layers, Edit, Trash2, Plus, CheckCircle, XCircle } from 'lucide-react';

export default function SubjectsDrilldownTab() {
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);

  const editor = useRef(null);
  const [isUrdu, setIsUrdu] = useState(false);

  const config = useMemo(() => ({
    readonly: false,
    placeholder: isUrdu ? 'یہاں اردو نوٹس لکھیں...' : 'Start typing your detailed notes here...',
    theme: 'light',
    height: 500,
    direction: (isUrdu ? 'rtl' : 'ltr') as 'rtl' | 'ltr',
    language: isUrdu ? 'ar' : 'en',
    uploader: {
      insertImageAsBase64URI: true
    },
    style: isUrdu ? {
      fontFamily: "'Noto Nastaliq Urdu', 'Noto Naskh Arabic', serif",
      direction: 'rtl',
      textAlign: 'right',
      lineHeight: '2.4',
      fontSize: '18px'
    } : {}
  }), [isUrdu]);

  // Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [subtopics, setSubtopics] = useState<any[]>([]);
  const [contentData, setContentData] = useState<any>(null);

  // Selection States
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<any>(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState<any>(null);

  // Form States (Inline / Modal)
  const [isAddingTopic, setIsAddingTopic] = useState(false);
  const [newTopicName, setNewTopicName] = useState('');
  
  const [isSubtopicModalOpen, setIsSubtopicModalOpen] = useState(false);
  const [editSubtopicId, setEditSubtopicId] = useState<number | null>(null);
  const [subtopicForm, setSubtopicForm] = useState({ name: '', description: '', level: 'beginner' });

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editSubjectId, setEditSubjectId] = useState<number | null>(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', description: '' });

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkInput, setBulkInput] = useState('');

  // Load Categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/mcqs/categories`);
      if (res.ok) setCategories(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchTopics = async (categoryId: number) => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/drilldown/topics/category/${categoryId}`);
      if (res.ok) setTopics(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchSubtopics = async (subCategoryId: number) => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/drilldown/subtopics/topic/${subCategoryId}`);
      if (res.ok) setSubtopics(await res.json());
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchContent = async (topicId: number) => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/drilldown/content/${topicId}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setContentData(data);
          setIsUrdu(!!data.isUrdu);
        } else {
          // Initialize empty content
          setContentData({ bodyText: '', keyPoints: [], tables: [], references: [], isUrdu: false });
        }
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  // ----------------------------------------------------
  // NAVIGATION HANDLERS
  // ----------------------------------------------------
  const goLevel2 = (cat: any) => {
    setSelectedCategory(cat);
    fetchTopics(cat.id);
    setLevel(2);
  };

  const goLevel3 = (topic: any) => {
    setSelectedTopic(topic);
    fetchSubtopics(topic.id);
    setLevel(3);
  };

  const goLevel4 = (subtopic: any) => {
    setSelectedSubtopic(subtopic);
    fetchContent(subtopic.id);
    setLevel(4);
  };

  const goBack = () => {
    if (level === 4) setLevel(3);
    else if (level === 3) setLevel(2);
    else if (level === 2) setLevel(1);
  };

  // ----------------------------------------------------
  // CRUD - SUBJECTS (Level 1)
  // ----------------------------------------------------
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editSubjectId 
        ? `${API_BASE}/api/admin/academics/subject/${editSubjectId}`
        : `${API_BASE}/api/admin/academics/subject`;
      const method = editSubjectId ? 'PUT' : 'POST';
      const res = await authFetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: subjectForm.name, description: subjectForm.description })
      });
      if (res.ok) {
        setIsSubjectModalOpen(false);
        fetchCategories();
      } else {
        const err = await res.json();
        alert('Error: ' + err.error);
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteSubject = async (id: number) => {
    if (!confirm('Are you sure? This deletes ALL topics and subtopics inside it!')) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/academics/subject/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCategories();
      } else {
        alert('Failed to delete subject. Make sure it has no linked content.');
      }
    } catch (e) { console.error(e); }
  };

  const openEditSubject = (s: any) => {
    setEditSubjectId(s.id);
    setSubjectForm({ name: s.name, description: s.description || '' });
    setIsSubjectModalOpen(true);
  };

  // ----------------------------------------------------
  // CRUD - TOPICS (Level 2)
  // ----------------------------------------------------
  const handleCreateTopic = async () => {
    if (!newTopicName.trim()) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/drilldown/topics`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTopicName, categoryId: selectedCategory.id })
      });
      if (res.ok) {
        setIsAddingTopic(false);
        setNewTopicName('');
        fetchTopics(selectedCategory.id);
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteTopic = async (id: number) => {
    if (!confirm('Are you sure? This deletes ALL subtopics inside it!')) return;
    try {
      await authFetch(`${API_BASE}/api/admin/drilldown/topics/${id}`, { method: 'DELETE' });
      fetchTopics(selectedCategory.id);
    } catch (e) { console.error(e); }
  };

  const handleBulkUpload = async () => {
    if (!bulkInput.trim()) return;
    const lines = bulkInput.split('\n');
    const data: { topicName: string; subtopics: string[] }[] = [];
    let currentTopic: { topicName: string; subtopics: string[] } | null = null;

    for (const line of lines) {
      if (line.trim() === '') continue;
      if (line.startsWith('- ')) {
        if (currentTopic) {
          currentTopic.subtopics.push(line.replace('- ', '').trim());
        }
      } else {
        currentTopic = { topicName: line.trim(), subtopics: [] };
        data.push(currentTopic);
      }
    }

    if (data.length === 0) return;

    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/drilldown/bulk-upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId: selectedCategory.id, data })
      });
      if (res.ok) {
        setIsBulkModalOpen(false);
        setBulkInput('');
        fetchTopics(selectedCategory.id);
      } else {
        alert('Bulk upload failed.');
      }
    } catch (e) {
      console.error(e);
      alert('Error during bulk upload.');
    }
    setLoading(false);
  };

  // ----------------------------------------------------
  // CRUD - SUBTOPICS (Level 3)
  // ----------------------------------------------------
  const handleSaveSubtopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editSubtopicId 
        ? `${API_BASE}/api/admin/drilldown/subtopics/${editSubtopicId}`
        : `${API_BASE}/api/admin/drilldown/subtopics`;
      const method = editSubtopicId ? 'PUT' : 'POST';
      const res = await authFetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...subtopicForm, subCategoryId: selectedTopic.id })
      });
      if (res.ok) {
        setIsSubtopicModalOpen(false);
        fetchSubtopics(selectedTopic.id);
      }
    } catch (e) { console.error(e); }
  };

  const handleDeleteSubtopic = async (id: number) => {
    if (!confirm('Are you sure? This deletes all content inside it.')) return;
    try {
      await authFetch(`${API_BASE}/api/admin/drilldown/subtopics/${id}`, { method: 'DELETE' });
      fetchSubtopics(selectedTopic.id);
    } catch (e) { console.error(e); }
  };

  const openEditSubtopic = (s: any) => {
    setEditSubtopicId(s.id);
    setSubtopicForm({ name: s.name, description: s.description || '', level: s.level });
    setIsSubtopicModalOpen(true);
  };

  // ----------------------------------------------------
  // CRUD - CONTENT (Level 4)
  // ----------------------------------------------------
  const handleSaveContent = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE}/api/admin/drilldown/content/${selectedSubtopic.id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData)
      });
      if (res.ok) {
        alert('Content Saved Successfully!');
      }
    } catch (e) { console.error(e); alert('Failed to save'); }
    setLoading(false);
  };

  // Helpers for content arrays
  const addKeyPoint = () => setContentData({ ...contentData, keyPoints: [...(contentData.keyPoints || []), ''] });
  const updateKeyPoint = (idx: number, val: string) => {
    const arr = [...contentData.keyPoints];
    arr[idx] = val;
    setContentData({ ...contentData, keyPoints: arr });
  };
  const removeKeyPoint = (idx: number) => {
    const arr = [...contentData.keyPoints];
    arr.splice(idx, 1);
    setContentData({ ...contentData, keyPoints: arr });
  };

  // Tables
  const addTable = () => setContentData({
    ...contentData,
    tables: [...(contentData.tables || []), { title: 'New Table', headers: ['Col 1', 'Col 2'], rows: [['Data 1', 'Data 2']] }]
  });
  
  const updateTable = (idx: number, table: any) => {
    const arr = [...contentData.tables];
    arr[idx] = table;
    setContentData({ ...contentData, tables: arr });
  };
  
  const removeTable = (idx: number) => {
    const arr = [...contentData.tables];
    arr.splice(idx, 1);
    setContentData({ ...contentData, tables: arr });
  };

  // References
  const addRef = () => setContentData({ ...contentData, references: [...(contentData.references || []), { label: '', value: '' }] });
  const updateRef = (idx: number, key: 'label'|'value', val: string) => {
    const arr = [...contentData.references];
    arr[idx][key] = val;
    setContentData({ ...contentData, references: arr });
  };
  const removeRef = (idx: number) => {
    const arr = [...contentData.references];
    arr.splice(idx, 1);
    setContentData({ ...contentData, references: arr });
  };


  // ----------------------------------------------------
  // RENDERING HELPERS
  // ----------------------------------------------------
  const Breadcrumbs = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#64748B', fontSize: '0.9rem' }}>
      {level > 1 && <button onClick={goBack} className={styles.actionBtn} style={{ padding: '4px 8px', marginRight: '10px' }}><ArrowLeft size={16} /></button>}
      <span style={{ cursor: 'pointer' }} onClick={() => setLevel(1)}>Subjects</span>
      {level >= 2 && <><ChevronRight size={14} /><span style={{ cursor: level > 2 ? 'pointer' : 'default', color: level === 2 ? '#0C1B2E' : '' }} onClick={() => setLevel(2)}>{selectedCategory?.name}</span></>}
      {level >= 3 && <><ChevronRight size={14} /><span style={{ cursor: level > 3 ? 'pointer' : 'default', color: level === 3 ? '#0C1B2E' : '' }} onClick={() => setLevel(3)}>{selectedTopic?.name}</span></>}
      {level === 4 && <><ChevronRight size={14} /><span style={{ color: '#0C1B2E' }}>{selectedSubtopic?.name}</span></>}
    </div>
  );

  const getLevelBadgeClass = (lvl: string) => {
    switch(lvl) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border border-green-500/30 app-badge app-badge-green';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 app-badge app-badge-amber';
      case 'expert': return 'bg-red-500/20 text-red-400 border border-red-500/30 app-badge app-badge-red';
      default: return 'bg-gray-500/20 text-gray-400 app-badge app-badge-gray';
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Subjects Manager</h2>
      </div>

      <Breadcrumbs />

      {/* LEVEL 1: SUBJECTS GRID */}
      {level === 1 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#0F1E33' }}>All Subjects</h3>
            <button className={styles.quickActionBtn} onClick={() => {
              setEditSubjectId(null);
              setSubjectForm({ name: '', description: '' });
              setIsSubjectModalOpen(true);
            }}>
              <Plus size={16} /> Add Subject
            </button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {categories.map(c => (
              <div key={c.id} className={styles.formCard} style={{ margin: 0, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <BookOpen size={24} color="#F59E0B" />
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{c.name}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button className={styles.actionBtn} onClick={() => openEditSubject(c)}><Edit size={14} /></button>
                    <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDeleteSubject(c.id)}><Trash2 size={14} /></button>
                  </div>
                </div>
                <p style={{ color: '#64748B', fontSize: '0.85rem', flex: 1 }}>{c.description}</p>
                <button 
                  className={styles.submitBtn} 
                  style={{ width: '100%', padding: '10px', fontSize: '0.9rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '15px' }}
                  onClick={() => goLevel2(c)}
                >
                  Manage Topics <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Subject Modal */}
          {isSubjectModalOpen && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modalContent}>
                <h3>{editSubjectId ? 'Edit Subject' : 'Add Subject'}</h3>
                <form className={styles.form} onSubmit={handleSaveSubject}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Subject Name</label>
                    <input required type="text" className={styles.formInput} value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Description</label>
                    <textarea className={styles.formInput} rows={3} value={subjectForm.description} onChange={e => setSubjectForm({...subjectForm, description: e.target.value})} />
                  </div>
                  <div className={styles.formActions} style={{ marginTop: '20px' }}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setIsSubjectModalOpen(false)}>Cancel</button>
                    <button type="submit" className={styles.submitBtn}>Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* LEVEL 2: TOPICS LIST */}
      {level === 2 && (
        <div className={styles.tableContainer}>
          <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #E6EAF0' }}>
            <h3 style={{ margin: 0 }}>Topics inside {selectedCategory?.name}</h3>
            {!isAddingTopic ? (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className={styles.quickActionBtn} onClick={() => setIsBulkModalOpen(true)}>
                  <Layers size={16} /> Bulk Upload
                </button>
                <button className={styles.quickActionBtn} onClick={() => setIsAddingTopic(true)}>
                  <Plus size={16} /> Add Topic
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  autoFocus
                  type="text" 
                  className={styles.formInput} 
                  placeholder="New topic name..." 
                  value={newTopicName} 
                  onChange={e => setNewTopicName(e.target.value)} 
                />
                <button className={styles.submitBtn} style={{ margin: 0, padding: '10px 15px' }} onClick={handleCreateTopic}>Save</button>
                <button className={styles.cancelBtn} style={{ margin: 0, padding: '10px 15px' }} onClick={() => setIsAddingTopic(false)}>Cancel</button>
              </div>
            )}
          </div>
          <table className={styles.dataTable}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Topic Name</th>
                <th>Subtopics</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((t: any) => (
                <tr key={t.id} className={styles.clickableRow} onClick={() => goLevel3(t)}>
                  <td style={{ color: '#94A3B8' }}>#{t.id}</td>
                  <td style={{ fontWeight: 600 }}>{t.name}</td>
                  <td style={{ color: '#B45309' }}>{t._count?.topics || 0}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDeleteTopic(t.id)}>
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {topics.length === 0 && <tr><td colSpan={4} style={{ textAlign:'center', padding:'20px', color:'#94A3B8' }}>No topics found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkModalOpen && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent} style={{ maxWidth: '600px' }}>
            <h3>Bulk Upload Topics & Subtopics</h3>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '15px' }}>
              Format your text with topics on regular lines, and subtopics indented with a hyphen `- ` below them.
              <br/><br/>
              <strong>Example:</strong><br/>
              Physics<br/>
              - Mechanics<br/>
              - Thermodynamics<br/>
              Mathematics<br/>
              - Algebra
            </p>
            <textarea 
              className={styles.formInput} 
              rows={12} 
              placeholder="Paste your formatted text here..." 
              value={bulkInput} 
              onChange={e => setBulkInput(e.target.value)} 
              style={{ fontFamily: 'monospace' }}
            />
            <div className={styles.formActions} style={{ marginTop: '20px' }}>
              <button type="button" className={styles.cancelBtn} onClick={() => setIsBulkModalOpen(false)}>Cancel</button>
              <button type="button" className={styles.submitBtn} onClick={handleBulkUpload} disabled={loading}>
                {loading ? 'Uploading...' : 'Upload Data'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 3: SUBTOPICS TABLE */}
      {level === 3 && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, color: '#0F1E33' }}>Subtopics</h3>
            <button className={styles.quickActionBtn} onClick={() => {
              setEditSubtopicId(null);
              setSubtopicForm({ name: '', description: '', level: 'beginner' });
              setIsSubtopicModalOpen(true);
            }}>
              <Plus size={16} /> Add Subtopic
            </button>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Subtopic Name</th>
                  <th>Difficulty</th>
                  <th>Content</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subtopics.map((s: any) => (
                  <tr key={s.id}>
                    <td style={{ color: '#94A3B8' }}>#{s.id}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td>
                      <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${getLevelBadgeClass(s.level)}`}>{s.level}</span>
                    </td>
                    <td>
                      {s.hasContent ? <CheckCircle size={18} color="#16A34A" /> : <span style={{ color:'#94A3B8' }}>—</span>}
                    </td>
                    <td>
                      <button className={styles.actionBtn} onClick={() => openEditSubtopic(s)}><Edit size={14} /></button>
                      <button className={styles.actionBtn} style={{ background: '#FEF3C7', color: '#B45309', borderColor: '#FDE68A' }} onClick={() => goLevel4(s)}>
                        Edit Content &rarr;
                      </button>
                      <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDeleteSubtopic(s.id)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
                {subtopics.length === 0 && <tr><td colSpan={5} style={{ textAlign:'center', padding:'20px', color:'#94A3B8' }}>No subtopics found.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Subtopic Modal */}
          {isSubtopicModalOpen && (
            <div className={styles.modalBackdrop}>
              <div className={styles.modalContent}>
                <h3>{editSubtopicId ? 'Edit Subtopic' : 'Add Subtopic'}</h3>
                <form className={styles.form} onSubmit={handleSaveSubtopic}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Name</label>
                    <input required type="text" className={styles.formInput} value={subtopicForm.name} onChange={e => setSubtopicForm({...subtopicForm, name: e.target.value})} />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Difficulty Level</label>
                    <select className={styles.formInput} value={subtopicForm.level} onChange={e => setSubtopicForm({...subtopicForm, level: e.target.value})}>
                      <option value="beginner">Beginner</option>
                      <option value="moderate">Moderate</option>
                      <option value="expert">Expert</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>Description (Optional)</label>
                    <textarea className={styles.formInput} rows={3} value={subtopicForm.description} onChange={e => setSubtopicForm({...subtopicForm, description: e.target.value})} />
                  </div>
                  <div className={styles.formActions} style={{ marginTop: '20px' }}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setIsSubtopicModalOpen(false)}>Cancel</button>
                    <button type="submit" className={styles.submitBtn}>Save</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* LEVEL 4: CONTENT EDITOR */}
      {level === 4 && contentData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FEF3C7', padding: '20px', borderRadius: '12px', border: '1px solid #FDE68A' }}>
            <div>
              <h3 style={{ margin: '0 0 5px 0', color: '#B45309' }}>Editing Content for: {selectedSubtopic?.name}</h3>
              <span style={{ fontSize: '0.85rem', color: '#64748B' }}>Add markdown text, bullet points, data tables, and references.</span>
            </div>
            <button className={styles.submitBtn} style={{ margin: 0, minWidth: '150px' }} onClick={handleSaveContent}>
              {loading ? 'Saving...' : '💾 Save Content'}
            </button>
          </div>

          {/* Section A: Body Text */}
          <div className={styles.formCard} style={{ color: '#000' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ color: '#0F1E33', margin: 0 }}>A. Study Notes (Rich Text)</h3>
              <button
                type="button"
                onClick={() => {
                  const next = !isUrdu;
                  setIsUrdu(next);
                  setContentData({ ...contentData, isUrdu: next });
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                  border: `1px solid ${isUrdu ? '#F59E0B' : '#E6EAF0'}`,
                  background: isUrdu ? '#FEF3C7' : '#FFFFFF',
                  color: isUrdu ? '#B45309' : '#64748B',
                  fontFamily: isUrdu ? "'Noto Naskh Arabic', serif" : 'inherit',
                  fontSize: isUrdu ? '1rem' : '0.85rem',
                  fontWeight: 700, transition: 'all 0.2s ease'
                }}
              >
                {isUrdu ? '✓ اردو موڈ فعال' : 'اردو موڈ'}
              </button>
            </div>
            {isUrdu && (
              <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '10px 14px', marginBottom: '10px', direction: 'rtl', textAlign: 'right', fontFamily: "'Noto Naskh Arabic', serif", color: '#334155', fontSize: '0.9rem' }}>
                اردو موڈ فعال ہے۔ ایڈیٹر میں متن دائیں سے بائیں لکھا جائے گا۔
              </div>
            )}
            <JoditEditor
              ref={editor}
              value={contentData.bodyText || ''}
              config={config}
              onBlur={newContent => setContentData({...contentData, bodyText: newContent, isUrdu})}
              onChange={newContent => {}}
            />
          </div>

          {/* Section B: Key Points */}
          <div className={styles.formCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>B. Key Points {isUrdu && <span style={{ fontFamily: "'Noto Naskh Arabic', serif", fontSize: '0.85rem', color: '#B45309', marginRight: '6px' }}>(اہم نکات)</span>}</h3>
              <button className={styles.quickActionBtn} style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={addKeyPoint}>+ Add Point</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(contentData.keyPoints || []).map((pt: string, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '10px', flexDirection: isUrdu ? 'row-reverse' : 'row' }}>
                  <input
                    type="text"
                    className={styles.formInput}
                    style={{
                      flex: 1,
                      direction: isUrdu ? 'rtl' : 'ltr',
                      textAlign: isUrdu ? 'right' : 'left',
                      fontFamily: isUrdu ? "'Noto Naskh Arabic', serif" : 'inherit',
                      fontSize: isUrdu ? '1rem' : 'inherit',
                      lineHeight: isUrdu ? '2' : 'inherit'
                    }}
                    value={pt}
                    onChange={e => updateKeyPoint(i, e.target.value)}
                    placeholder={isUrdu ? 'مثلاً: پاکستان 1947 میں آزاد ہوا' : 'e.g. The earth is the 3rd planet from the sun.'}
                  />
                  <button className={`${styles.actionBtn} ${styles.danger}`} style={{ margin: 0 }} onClick={() => removeKeyPoint(i)}><XCircle size={18} /></button>
                </div>
              ))}
              {(!contentData.keyPoints || contentData.keyPoints.length === 0) && <p style={{ color: '#94A3B8', margin: 0 }}>No key points added yet.</p>}
            </div>
          </div>

          {/* Section C: Data Tables */}
          <div className={styles.formCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>C. Data Tables</h3>
              <button className={styles.quickActionBtn} style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={addTable}>+ Add Table</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {(contentData.tables || []).map((table: any, tableIdx: number) => (
                <div key={tableIdx} style={{ background: '#F8FAFC', border: '1px solid #E6EAF0', padding: '15px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                    <input 
                      type="text" className={styles.formInput} style={{ fontWeight: 'bold', width: '300px' }} 
                      value={table.title} onChange={e => updateTable(tableIdx, {...table, title: e.target.value})} 
                    />
                    <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => removeTable(tableIdx)}>Remove Table</button>
                  </div>
                  
                  {/* Table Editor Controls */}
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <button className={styles.actionBtn} onClick={() => updateTable(tableIdx, {...table, headers: [...table.headers, 'New Col'], rows: table.rows.map((r: any) => [...r, '']) })}>+ Add Column</button>
                    <button className={styles.actionBtn} onClick={() => updateTable(tableIdx, {...table, rows: [...table.rows, new Array(table.headers.length).fill('')] })}>+ Add Row</button>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className={styles.dataTable} style={{ minWidth: '100%' }}>
                      <thead>
                        <tr>
                          {table.headers.map((h: string, colIdx: number) => (
                            <th key={colIdx} style={{ padding: '5px' }}>
                              <input type="text" className={styles.formInput} style={{ width: '100%', padding: '5px' }} value={h} onChange={e => {
                                const newH = [...table.headers];
                                newH[colIdx] = e.target.value;
                                updateTable(tableIdx, {...table, headers: newH});
                              }} />
                            </th>
                          ))}
                          <th style={{ width: '40px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.map((row: any[], rowIdx: number) => (
                          <tr key={rowIdx}>
                            {row.map((cell: string, colIdx: number) => (
                              <td key={colIdx} style={{ padding: '5px' }}>
                                <input type="text" className={styles.formInput} style={{ width: '100%', padding: '5px', background: '#FFFFFF' }} value={cell} onChange={e => {
                                  const newRows = [...table.rows];
                                  newRows[rowIdx] = [...newRows[rowIdx]];
                                  newRows[rowIdx][colIdx] = e.target.value;
                                  updateTable(tableIdx, {...table, rows: newRows});
                                }} />
                              </td>
                            ))}
                            <td style={{ padding: '5px' }}>
                              <button className={`${styles.actionBtn} ${styles.danger}`} style={{ padding: '5px' }} onClick={() => {
                                const newRows = [...table.rows];
                                newRows.splice(rowIdx, 1);
                                updateTable(tableIdx, {...table, rows: newRows});
                              }}><Trash2 size={14} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
              {(!contentData.tables || contentData.tables.length === 0) && <p style={{ color: '#94A3B8', margin: 0 }}>No tables added.</p>}
            </div>
          </div>

          {/* Section D: References */}
          <div className={styles.formCard} style={{ marginBottom: '50px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 style={{ margin: 0 }}>D. References / Meta Info</h3>
              <button className={styles.quickActionBtn} style={{ padding: '5px 10px', fontSize: '0.8rem' }} onClick={addRef}>+ Add Ref</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {(contentData.references || []).map((ref: any, i: number) => (
                <div key={i} style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" className={styles.formInput} style={{ width: '200px' }} placeholder="Label (e.g. Source)" value={ref.label} onChange={e => updateRef(i, 'label', e.target.value)} />
                  <input type="text" className={styles.formInput} style={{ flex: 1 }} placeholder="Value (e.g. Wikipedia)" value={ref.value} onChange={e => updateRef(i, 'value', e.target.value)} />
                  <button className={`${styles.actionBtn} ${styles.danger}`} style={{ margin: 0 }} onClick={() => removeRef(i)}><XCircle size={18} /></button>
                </div>
              ))}
              {(!contentData.references || contentData.references.length === 0) && <p style={{ color: '#94A3B8', margin: 0 }}>No references added.</p>}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
