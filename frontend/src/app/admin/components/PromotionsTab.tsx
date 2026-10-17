import React, { useState } from 'react';
import styles from '../admin.module.css';
import { Plus, Copy } from 'lucide-react';
import { useBusiness } from '../hooks/useBusiness';
import { authFetch } from '../lib/authFetch';
import { API_BASE } from '@/lib/api';

export default function PromotionsTab() {
  const { coupons: mockCoupons, loading, error } = useBusiness();
  const [showForm, setShowForm] = useState(false);

  const codeRef = React.useRef<HTMLInputElement>(null);
  const discountTypeRef = React.useRef<HTMLSelectElement>(null);
  const discountValueRef = React.useRef<HTMLInputElement>(null);
  const usageLimitRef = React.useRef<HTMLInputElement>(null);
  const expiryDateRef = React.useRef<HTMLInputElement>(null);
  const statusRef = React.useRef<HTMLSelectElement>(null);

  if (loading) return <div style={{ color: '#64748B', padding: '20px' }}>Loading business data from database...</div>;
  if (error) return <div style={{ color: '#DC2626', padding: '20px' }}>Error: {error}</div>;

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch(`${API_BASE}/api/admin/business/promo`, {
        method: 'POST',
        body: JSON.stringify({
          code: codeRef.current?.value.toUpperCase(),
          discountType: discountTypeRef.current?.value,
          discountValue: discountValueRef.current?.value ? parseInt(discountValueRef.current.value) : 0,
          usageLimit: usageLimitRef.current?.value ? parseInt(usageLimitRef.current.value) : 0,
          expiryDate: expiryDateRef.current?.value,
          status: statusRef.current?.value
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to generate promo code');
      }
      alert('Promo Code Generated!');
      setShowForm(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete/disable this promo code?')) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/business/promo/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Promotions & Coupons</h2>
        <button className={styles.quickActionBtn} onClick={() => setShowForm(true)}>
          <Plus size={16} /> Generate Code
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3>Generate New Promo Code</h3>
          <form className={styles.form} onSubmit={submitForm}>
            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Coupon Code</label>
                <input type="text" required className={styles.formInput} placeholder="e.g. EID50" style={{ textTransform: 'uppercase' }} ref={codeRef} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Discount Type</label>
                <select className={styles.formInput} required ref={discountTypeRef}>
                  <option>Percentage (%)</option>
                  <option>Flat Amount (PKR)</option>
                </select>
              </div>
            </div>

            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Discount Value</label>
                <input type="number" required className={styles.formInput} placeholder="e.g. 50" ref={discountValueRef} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Usage Limit (0 for unlimited)</label>
                <input type="number" required className={styles.formInput} defaultValue="0" ref={usageLimitRef} />
              </div>
            </div>

            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Expiry Date</label>
                <input type="date" required className={styles.formInput} ref={expiryDateRef} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select className={styles.formInput} ref={statusRef}>
                  <option>Active</option>
                  <option>Draft</option>
                </select>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className={styles.submitBtn}>Save Code</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Usage</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {mockCoupons.map((c: any) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 600, color: '#B45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {c.code} <Copy size={14} style={{ cursor: 'pointer', color: '#94A3B8' }} onClick={() => alert('Copied!')}/>
                </td>
                <td>{c.discountValue} {c.discountType === 'Percentage' ? '%' : 'PKR'}</td>
                <td>{c.usedCount || 0} / {c.usageLimit === 0 ? '∞' : c.usageLimit}</td>
                <td style={{ color: c.status === 'Expired' ? '#DC2626' : 'inherit' }}>{new Date(c.expiryDate).toLocaleDateString()}</td>
                <td>
                  <span className={`${styles.badge} ${c.status === 'Active' ? styles.badgePremium : styles.badgeUrgent}`}>
                    {c.status}
                  </span>
                </td>
                <td>
                  <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(c.id)}>Disable</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
