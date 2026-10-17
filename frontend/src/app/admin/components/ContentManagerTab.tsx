import React, { useState } from 'react';
import styles from '../admin.module.css';
import { Plus, Star } from 'lucide-react';
import { useContent } from '../hooks/useContent';

import { authFetch } from '../lib/authFetch';
import { API_BASE } from '@/lib/api';

export default function ContentManagerTab() {
  const { testimonials: mockTestimonials, faqs: mockFAQs, loading, error, refreshData } = useContent();
  const [subTab, setSubTab] = useState<'testimonials' | 'faq'>('testimonials');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Testimonial Refs
  const tNameRef = React.useRef<HTMLInputElement>(null);
  const tRoleRef = React.useRef<HTMLInputElement>(null);
  const tRatingRef = React.useRef<HTMLInputElement>(null);
  const tAvatarRef = React.useRef<HTMLInputElement>(null);
  const tQuoteRef = React.useRef<HTMLTextAreaElement>(null);

  // FAQ Refs
  const fQuestionRef = React.useRef<HTMLInputElement>(null);
  const fAnswerRef = React.useRef<HTMLTextAreaElement>(null);

  const handleSubmitTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `${API_BASE}/api/admin/content/testimonial/${editingId}` : `${API_BASE}/api/admin/content/testimonial`;
      const res = await authFetch(url, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify({
          name: tNameRef.current?.value,
          role: tRoleRef.current?.value,
          rating: tRatingRef.current?.value,
          avatar: tAvatarRef.current?.value,
          quote: tQuoteRef.current?.value
        })
      });
      if (!res.ok) throw new Error('Failed to save testimonial');
      setShowForm(false);
      setEditingId(null);
      refreshData();
    } catch (err: any) { alert(err.message); }
  };

  const handleSubmitFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `${API_BASE}/api/admin/content/faq/${editingId}` : `${API_BASE}/api/admin/content/faq`;
      const res = await authFetch(url, {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify({
          question: fQuestionRef.current?.value,
          answer: fAnswerRef.current?.value
        })
      });
      if (!res.ok) throw new Error('Failed to save FAQ');
      setShowForm(false);
      setEditingId(null);
      refreshData();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (type: 'testimonial' | 'faq', id: number) => {
    if (!confirm(`Are you sure you want to delete this?`)) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/content/${type}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(`Failed to delete`);
      refreshData();
    } catch (err: any) { alert(err.message); }
  };

  const handleEditTestimonial = (t: any) => {
    setSubTab('testimonials');
    setShowForm(true);
    setEditingId(t.id);
    setTimeout(() => {
      if (tNameRef.current) tNameRef.current.value = t.name;
      if (tRoleRef.current) tRoleRef.current.value = t.role;
      if (tRatingRef.current) tRatingRef.current.value = t.rating;
      if (tAvatarRef.current) tAvatarRef.current.value = t.avatar || t.avatarEmoji;
      if (tQuoteRef.current) tQuoteRef.current.value = t.quote;
    }, 50);
  };

  const handleEditFAQ = (f: any) => {
    setSubTab('faq');
    setShowForm(true);
    setEditingId(f.id);
    setTimeout(() => {
      if (fQuestionRef.current) fQuestionRef.current.value = f.question;
      if (fAnswerRef.current) fAnswerRef.current.value = f.answer;
    }, 50);
  };

  const renderContent = () => {
    if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading content data from database...</div>;
    if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

    switch (subTab) {
      case 'testimonials':
        return (
          <>
            <button className={styles.quickActionBtn} onClick={() => {setShowForm(true); setEditingId(null);}} style={{ marginBottom: '20px' }}><Plus size={16} /> Add Testimonial</button>
            {showForm && (
              <div className={styles.formCard}>
                <h3>{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
                <form className={styles.form} onSubmit={handleSubmitTestimonial}>
                  <div className={styles.optionsGrid}>
                    <div className={styles.formGroup}><label className={styles.formLabel}>Name</label><input type="text" required className={styles.formInput} ref={tNameRef} /></div>
                    <div className={styles.formGroup}><label className={styles.formLabel}>Role / Title</label><input type="text" required className={styles.formInput} ref={tRoleRef} /></div>
                  </div>
                  <div className={styles.optionsGrid}>
                    <div className={styles.formGroup}><label className={styles.formLabel}>Rating (1-5)</label><input type="number" min="1" max="5" required className={styles.formInput} ref={tRatingRef} defaultValue="5" /></div>
                    <div className={styles.formGroup}><label className={styles.formLabel}>Avatar (Emoji)</label><input type="text" required className={styles.formInput} ref={tAvatarRef} defaultValue="👤" /></div>
                  </div>
                  <div className={styles.formGroup}><label className={styles.formLabel}>Quote</label><textarea required className={styles.formInput} rows={3} ref={tQuoteRef} /></div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => {setShowForm(false); setEditingId(null);}}>Cancel</button>
                    <button type="submit" className={styles.submitBtn}>Save</button>
                  </div>
                </form>
              </div>
            )}
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead><tr><th>Name</th><th>Role</th><th>Quote</th><th>Rating</th><th>Actions</th></tr></thead>
                <tbody>
                  {mockTestimonials.map((t: any) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{t.avatar || t.avatarEmoji} {t.name}</td>
                      <td>{t.role}</td>
                      <td>"{t.quote.substring(0, 30)}..."</td>
                      <td><div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>{t.rating} <Star size={14} fill="#F59E0B" strokeWidth={0} /></div></td>
                      <td>
                        <button className={styles.actionBtn} onClick={() => handleEditTestimonial(t)}>Edit</button>
                        <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete('testimonial', t.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );
      case 'faq':
        return (
          <>
            <button className={styles.quickActionBtn} onClick={() => {setShowForm(true); setEditingId(null);}} style={{ marginBottom: '20px' }}><Plus size={16} /> Add FAQ</button>
            {showForm && (
              <div className={styles.formCard}>
                <h3>{editingId ? 'Edit FAQ Item' : 'Add FAQ Item'}</h3>
                <form className={styles.form} onSubmit={handleSubmitFAQ}>
                  <div className={styles.formGroup}><label className={styles.formLabel}>Question</label><input type="text" required className={styles.formInput} ref={fQuestionRef} /></div>
                  <div className={styles.formGroup}><label className={styles.formLabel}>Answer</label><textarea required className={styles.formInput} rows={3} ref={fAnswerRef} /></div>
                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => {setShowForm(false); setEditingId(null);}}>Cancel</button>
                    <button type="submit" className={styles.submitBtn}>Save</button>
                  </div>
                </form>
              </div>
            )}
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead><tr><th>Order</th><th>Question</th><th>Preview</th><th>Actions</th></tr></thead>
                <tbody>
                  {mockFAQs.map((f: any) => (
                    <tr key={f.id}>
                      <td>{f.order || f.id}</td>
                      <td style={{ fontWeight: 600 }}>{f.question}</td>
                      <td>{f.answer.substring(0, 40)}...</td>
                      <td>
                        <button className={styles.actionBtn} onClick={() => handleEditFAQ(f)}>Edit</button>
                        <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete('faq', f.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        );

    }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Content Manager</h2>
      </div>

      <div className={styles.subTabs}>
        <button className={`${styles.subTabBtn} ${subTab === 'testimonials' ? styles.subTabActive : ''}`} onClick={() => {setSubTab('testimonials'); setShowForm(false); setEditingId(null);}}>Testimonials</button>
        <button className={`${styles.subTabBtn} ${subTab === 'faq' ? styles.subTabActive : ''}`} onClick={() => {setSubTab('faq'); setShowForm(false); setEditingId(null);}}>FAQ Content</button>
      </div>

      {renderContent()}
    </div>
  );
}
