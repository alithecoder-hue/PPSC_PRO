import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Save, Search } from 'lucide-react';
import { authFetch } from '../lib/authFetch';
import { API_BASE } from '@/lib/api';

export default function SeoManagerTab() {
  const [settings, setSettings] = useState({
    seo_title: 'Meritmaster | PPSC Preparation SaaS',
    seo_description: 'The ultimate preparation engine for PPSC, FPSC, and NTS exams. Take premium mock tests and track your rank.',
    seo_keywords: 'PPSC, FPSC, Mock Tests, Past Papers, Preparation',
    seo_og_image: 'https://meritmaster.com/og-image.jpg',
    seo_twitter: '@meritmaster'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch(`${API_BASE}/api/admin/settings`)
      .then(res => res.json())
      .then(data => {
        setSettings(prev => ({ ...prev, ...data }));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch(`${API_BASE}/api/admin/settings`, {
        method: 'POST',
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to save settings');
      alert('SEO Settings Saved Successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading settings...</div>;

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>SEO & Metadata Manager</h2>
      </div>

      <div className={styles.grid} style={{ padding: 0, gap: '20px' }}>
        <div className={styles.formCard}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Search size={20}/> Global SEO Tags</h3>
          <form className={styles.form} onSubmit={submitForm}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Default Meta Title</label>
              <input type="text" name="seo_title" className={styles.formInput} value={settings.seo_title || ''} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Default Meta Description</label>
              <textarea name="seo_description" className={styles.formInput} rows={3} value={settings.seo_description || ''} onChange={handleChange} required />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Meta Keywords (comma separated)</label>
              <input type="text" name="seo_keywords" className={styles.formInput} value={settings.seo_keywords || ''} onChange={handleChange} />
            </div>
            
            <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '20px 0' }} />
            <h4 style={{ color: '#FFF', margin: '0 0 15px 0' }}>Social Sharing (OpenGraph)</h4>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>OG Image URL</label>
              <input type="url" name="seo_og_image" className={styles.formInput} value={settings.seo_og_image || ''} onChange={handleChange} />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Twitter Handle</label>
              <input type="text" name="seo_twitter" className={styles.formInput} value={settings.seo_twitter || ''} onChange={handleChange} />
            </div>

            <button type="submit" className={styles.submitBtn} style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <Save size={18} /> Save Global SEO
            </button>
          </form>
        </div>

        <div className={styles.formCard} style={{ display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.5)' }}>
          <h4 style={{ color: 'gray', marginBottom: '20px', textTransform: 'uppercase' }}>Google Search Preview</h4>
          
          <div style={{ background: '#FFF', padding: '20px', borderRadius: '8px', color: '#1a0dab', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ fontSize: '14px', color: '#202124', marginBottom: '5px' }}>https://meritmaster.com</div>
            <div style={{ fontSize: '20px', textDecoration: 'none', marginBottom: '5px' }}>{settings.seo_title}</div>
            <div style={{ fontSize: '14px', color: '#4d5156', lineHeight: 1.5 }}>
              {settings.seo_description}
            </div>
          </div>

          <h4 style={{ color: 'gray', marginTop: '40px', marginBottom: '20px', textTransform: 'uppercase' }}>Twitter/X Preview</h4>
          
          <div style={{ border: '1px solid rgba(255,255,255,0.2)', borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ height: '200px', background: 'linear-gradient(45deg, #000, #F59E0B)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#000', fontWeight: 'bold', backgroundImage: settings.seo_og_image ? `url(${settings.seo_og_image})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              {!settings.seo_og_image && '[ OG Image Here ]'}
            </div>
            <div style={{ padding: '15px', background: 'rgba(255,255,255,0.05)' }}>
              <div style={{ color: 'gray', fontSize: '14px', marginBottom: '5px' }}>meritmaster.com</div>
              <div style={{ color: '#FFF', fontWeight: 'bold', marginBottom: '5px' }}>{settings.seo_title}</div>
              <div style={{ color: 'gray', fontSize: '14px' }}>{settings.seo_description.substring(0, 100)}...</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
