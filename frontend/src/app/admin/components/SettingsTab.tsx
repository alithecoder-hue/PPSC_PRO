import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Save, AlertTriangle, Database, Power } from 'lucide-react';
import { authFetch } from '../lib/authFetch';
import { API_BASE } from '@/lib/api';

export default function SettingsTab() {
  const [subTab, setSubTab] = useState<'general' | 'security' | 'notifications' | 'danger'>('general');
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({ current: '', newPass: '', confirm: '' });

  useEffect(() => {
    authFetch(`${API_BASE}/api/admin/settings`)
      .then(res => res.json())
      .then(data => {
        setSettings(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setSettings((prev: any) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch(`${API_BASE}/api/admin/settings`, {
        method: 'POST',
        body: JSON.stringify(settings)
      });
      if (!res.ok) throw new Error('Failed to save settings');
      alert('Settings Saved Successfully!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPass !== passwordData.confirm) return alert('Passwords do not match');
    // NOTE: Requires a dedicated change password endpoint, mocked for now unless implemented
    alert('Password change endpoint not yet implemented.');
  };

  const handleDangerAction = (action: string) => {
    if (confirm(`Are you absolutely sure you want to ${action}? This action cannot be undone.`)) {
      if (action === 'ENABLE Maintenance Mode') {
        setSettings((prev: any) => ({ ...prev, maintenance_mode: true }));
        alert('Maintenance mode enabled (save settings to persist).');
      } else {
        alert(`${action} executed.`);
      }
    }
  };

  if (loading) return <div style={{ color: '#64748B', padding: '20px' }}>Loading settings...</div>;

  const renderContent = () => {
    switch (subTab) {
      case 'general':
        return (
          <div className={styles.formCard} style={{ maxWidth: '800px' }}>
            <h3>General Configuration</h3>
            <form className={styles.form} onSubmit={submitForm}>
              <div className={styles.optionsGrid}>
                <div className={styles.formGroup}><label className={styles.formLabel}>Site Name</label><input type="text" name="site_name" className={styles.formInput} value={settings.site_name || 'Meritmaster'} onChange={handleChange} required /></div>
                <div className={styles.formGroup}><label className={styles.formLabel}>Support Email</label><input type="email" name="support_email" className={styles.formInput} value={settings.support_email || 'support@meritmaster.com'} onChange={handleChange} required /></div>
              </div>
              <div className={styles.formGroup}><label className={styles.formLabel}>Tagline</label><input type="text" name="site_tagline" className={styles.formInput} value={settings.site_tagline || 'PPSC Preparation SaaS'} onChange={handleChange} required /></div>
              <hr style={{ borderColor: '#E6EAF0', margin: '20px 0' }} />
              <h4 style={{ color: '#0F1E33', margin: '0 0 15px 0' }}>Social Links</h4>
              <div className={styles.optionsGrid}>
                <div className={styles.formGroup}><label className={styles.formLabel}>WhatsApp Link</label><input type="url" name="social_whatsapp" className={styles.formInput} value={settings.social_whatsapp || ''} onChange={handleChange} /></div>
                <div className={styles.formGroup}><label className={styles.formLabel}>YouTube Link</label><input type="url" name="social_youtube" className={styles.formInput} value={settings.social_youtube || ''} onChange={handleChange} /></div>
                <div className={styles.formGroup}><label className={styles.formLabel}>Facebook Link</label><input type="url" name="social_facebook" className={styles.formInput} value={settings.social_facebook || ''} onChange={handleChange} /></div>
                <div className={styles.formGroup}><label className={styles.formLabel}>Instagram Link</label><input type="url" name="social_instagram" className={styles.formInput} value={settings.social_instagram || ''} onChange={handleChange} /></div>
              </div>
              <button type="submit" className={styles.submitBtn} style={{ marginTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <Save size={18} /> Save Changes
              </button>
            </form>
          </div>
        );
      case 'security':
        return (
          <div className={styles.grid} style={{ padding: 0, gap: '20px' }}>
            <div className={styles.formCard}>
              <h3>Change Admin Password</h3>
              <form className={styles.form} onSubmit={handlePasswordUpdate}>
                <div className={styles.formGroup}><label className={styles.formLabel}>Current Password</label><input type="password" required className={styles.formInput} value={passwordData.current} onChange={e => setPasswordData({...passwordData, current: e.target.value})} /></div>
                <div className={styles.formGroup}><label className={styles.formLabel}>New Password</label><input type="password" required className={styles.formInput} value={passwordData.newPass} onChange={e => setPasswordData({...passwordData, newPass: e.target.value})} /></div>
                <div className={styles.formGroup}><label className={styles.formLabel}>Confirm Password</label><input type="password" required className={styles.formInput} value={passwordData.confirm} onChange={e => setPasswordData({...passwordData, confirm: e.target.value})} /></div>
                <button type="submit" className={styles.submitBtn}>Update Password</button>
              </form>
            </div>
            <div>
              <div className={styles.formCard} style={{ marginBottom: '20px' }}>
                <h3>Two-Factor Authentication</h3>
                <p style={{ color: '#64748B', marginBottom: '20px' }}>Protect your admin account with an extra layer of security.</p>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#0F1E33', cursor: 'pointer' }}>
                  <input type="checkbox" name="2fa_enabled" checked={settings['2fa_enabled'] === 'true'} onChange={e => setSettings({...settings, '2fa_enabled': e.target.checked ? 'true' : 'false'})} style={{ width: '20px', height: '20px' }} />
                  Enable 2FA (Authenticator App)
                </label>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className={styles.formCard} style={{ maxWidth: '800px' }}>
            <h3>System Notifications</h3>
            <p style={{ color: '#64748B', marginBottom: '30px' }}>Configure which events trigger an email or WhatsApp alert to the Admin.</p>
            <form className={styles.form} onSubmit={submitForm}>
              <div className={styles.formGroup} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #E6EAF0' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0F1E33' }}>New User Signup</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Receive an email when a new user registers.</div>
                </div>
                <input type="checkbox" name="notif_signup" checked={settings.notif_signup === 'true'} onChange={e => setSettings({...settings, notif_signup: e.target.checked ? 'true' : 'false'})} style={{ width: '20px', height: '20px' }} />
              </div>
              <div className={styles.formGroup} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #E6EAF0' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0F1E33' }}>New Premium Subscription</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Receive an email when a payment succeeds.</div>
                </div>
                <input type="checkbox" name="notif_payment" checked={settings.notif_payment === 'true'} onChange={e => setSettings({...settings, notif_payment: e.target.checked ? 'true' : 'false'})} style={{ width: '20px', height: '20px' }} />
              </div>
              <div className={styles.formGroup} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0', borderBottom: '1px solid #E6EAF0' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0F1E33' }}>Contact Messages</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Receive an email for new inbox messages.</div>
                </div>
                <input type="checkbox" name="notif_messages" checked={settings.notif_messages === 'true'} onChange={e => setSettings({...settings, notif_messages: e.target.checked ? 'true' : 'false'})} style={{ width: '20px', height: '20px' }} />
              </div>
              <div className={styles.formGroup} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '15px 0' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#0F1E33' }}>Urgent Announcements</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Receive a WhatsApp alert for server issues.</div>
                </div>
                <input type="checkbox" name="notif_urgent" checked={settings.notif_urgent === 'true'} onChange={e => setSettings({...settings, notif_urgent: e.target.checked ? 'true' : 'false'})} style={{ width: '20px', height: '20px' }} />
              </div>
              <button type="submit" className={styles.submitBtn} style={{ marginTop: '20px' }}>Save Notification Preferences</button>
            </form>
          </div>
        );
      case 'danger':
        return (
          <div className={styles.grid} style={{ padding: 0, gap: '20px' }}>
            <div className={styles.formCard} style={{ border: '1px solid #FECACA', background: '#FEF2F2' }}>
              <h3 style={{ color: '#DC2626', display: 'flex', alignItems: 'center', gap: '10px' }}><AlertTriangle /> Danger Zone</h3>
              <p style={{ color: '#64748B', marginBottom: '30px' }}>Proceed with extreme caution. These actions can cause irreversible changes to the platform.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #E6EAF0' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0F1E33' }}>Maintenance Mode</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Take the site offline for all non-admin users.</div>
                  </div>
                  <button onClick={() => handleDangerAction('ENABLE Maintenance Mode')} className={styles.actionBtn} style={{ background: '#F59E0B', color: '#1A1207', fontWeight: 'bold', padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}><Power size={16}/> Enable</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', borderBottom: '1px solid #E6EAF0' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#0F1E33' }}>Export Database</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Download a complete raw JSON backup of all tables.</div>
                  </div>
                  <button onClick={() => handleDangerAction('Export Full Database')} className={styles.quickActionBtn} style={{ padding: '10px 20px' }}><Database size={16}/> Export Full Backup</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#DC2626' }}>Wipe Database Records</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748B' }}>Danger: Will delete ALL mock exams, MCQs, and logs permanently!</div>
                  </div>
                  <button onClick={() => handleDangerAction('WIPE Database Records')} className={`${styles.actionBtn} ${styles.danger}`} style={{ padding: '10px 20px', fontWeight: 'bold' }}>Wipe Data</button>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>System Settings</h2>
      </div>

      <div className={styles.subTabs}>
        <button className={`${styles.subTabBtn} ${subTab === 'general' ? styles.subTabActive : ''}`} onClick={() => setSubTab('general')}>General</button>
        <button className={`${styles.subTabBtn} ${subTab === 'security' ? styles.subTabActive : ''}`} onClick={() => setSubTab('security')}>Security</button>
        <button className={`${styles.subTabBtn} ${subTab === 'notifications' ? styles.subTabActive : ''}`} onClick={() => setSubTab('notifications')}>Notifications</button>
        <button className={`${styles.subTabBtn} ${subTab === 'danger' ? styles.subTabActive : ''}`} style={{ color: subTab === 'danger' ? '#DC2626' : '#F87171', borderColor: subTab === 'danger' ? '#DC2626' : 'transparent' }} onClick={() => setSubTab('danger')}>Danger Zone</button>
      </div>

      {renderContent()}
    </div>
  );
}
