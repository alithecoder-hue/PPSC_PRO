import React, { useState } from 'react';
import styles from '../admin.module.css';
import { Search, Download, Plus } from 'lucide-react';
import { useBusiness } from '../hooks/useBusiness';
import { authFetch } from '../lib/authFetch';
import { API_BASE } from '@/lib/api';

export default function SubscriptionsTab() {
  const { subscriptions, loading, error } = useBusiness();
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const emailRef = React.useRef<HTMLInputElement>(null);
  const planRef = React.useRef<HTMLSelectElement>(null);
  const amountRef = React.useRef<HTMLInputElement>(null);

  if (loading) return <div style={{ color: '#64748B', padding: '20px' }}>Loading business data from database...</div>;
  if (error) return <div style={{ color: '#DC2626', padding: '20px' }}>Error: {error}</div>;

  const now = new Date();

  // Dynamic Stats Calculation
  const totalRevenue = subscriptions.reduce((sum: number, s: any) => sum + (Number(s.amount) || 0), 0);
  const thisMonthRevenue = subscriptions
    .filter((s: any) => new Date(s.startDate).getMonth() === now.getMonth() && new Date(s.startDate).getFullYear() === now.getFullYear())
    .reduce((sum: number, s: any) => sum + (Number(s.amount) || 0), 0);
  
  const activeSubs = subscriptions.filter((s: any) => s.isActive && new Date(s.endDate) > now);
  const activePremiumUsers = activeSubs.length;
  const churnedThisMonth = subscriptions.filter((s: any) => s.isActive === false || new Date(s.endDate) <= now).length;
  const activeTrials = activeSubs.filter((s: any) => s.plan === '7 Days Trial').length;

  const sortedSubs = [...subscriptions].sort((a: any, b: any) => {
    const aActive = a.isActive && new Date(a.endDate) > now;
    const bActive = b.isActive && new Date(b.endDate) > now;
    
    // Both active: closest to expire at the top
    if (aActive && bActive) {
      return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
    }
    // Active ones go to top
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    
    // Both expired: most recently expired at the top
    return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
  });

  const filteredSubs = sortedSubs.filter((s: any) => 
    s.user?.name?.toLowerCase().includes(search.toLowerCase()) || 
    s.user?.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredSubs.length / itemsPerPage);
  const displayedSubs = filteredSubs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCsv = () => {
    const headers = ['ID', 'User Name', 'Email', 'Plan', 'Amount', 'Start Date', 'Expiry Date', 'Status'];
    const rows = subscriptions.map((s: any) => [s.id, s.user?.name, s.user?.email, s.plan, s.amount || '0', new Date(s.startDate).toLocaleDateString(), new Date(s.endDate).toLocaleDateString(), s.isActive ? 'Active' : 'Expired']);
    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'meritmaster_subscriptions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch(`${API_BASE}/api/admin/business/subscription`, {
        method: 'POST',
        body: JSON.stringify({
          email: emailRef.current?.value,
          plan: planRef.current?.value,
          amount: amountRef.current?.value ? parseInt(amountRef.current.value) : 0
        })
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create subscription');
      }
      alert('Manual Subscription added!');
      setShowForm(false);
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRevoke = async (id: number) => {
    if (!confirm('Are you sure you want to revoke this premium subscription?')) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/business/subscription/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to revoke');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Have you verified this payment in your Easypaisa/JazzCash/bank account? This will activate Premium for the user.')) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/business/subscription/${id}/approve`, {
        method: 'POST'
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to approve');
      }
      alert('Subscription approved — Premium activated.');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const getSubStatus = (s: any): 'active' | 'pending' | 'expired' => {
    if (s.isActive && new Date(s.endDate) > now) return 'active';
    if (!s.isActive && new Date(s.endDate) > now) return 'pending';
    return 'expired';
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Subscription & Revenue Manager</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={styles.quickActionBtn} onClick={() => setShowForm(true)}>
            <Plus size={16} /> Add Manual Sub
          </button>
          <button 
            className={styles.quickActionBtn} 
            style={{ background: '#DCFCE7', color: '#16A34A', borderColor: '#BBF7D0' }}
            onClick={handleExportCsv}
          >
            <Download size={16} /> Export to CSV
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Total Revenue (PKR)</span>
          <span className={styles.statValue}>{totalRevenue.toLocaleString()}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>This Month Revenue</span>
          <span className={styles.statValue}>{thisMonthRevenue.toLocaleString()}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active Premium Users</span>
          <span className={styles.statValue}>{activePremiumUsers}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Churned Total/Expired</span>
          <span className={styles.statValue}>{churnedThisMonth}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Active 7-Day Trials</span>
          <span className={styles.statValue}>{activeTrials}</span>
        </div>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3>Add Manual Subscription</h3>
          <form className={styles.form} onSubmit={submitForm}>
            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>User Email</label>
                <input type="email" required className={styles.formInput} placeholder="user@example.com" ref={emailRef} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Plan Duration</label>
                <select className={styles.formInput} required ref={planRef}>
                  <option>1 Month</option>
                  <option>3 Months</option>
                  <option>6 Months</option>
                  <option>1 Year</option>
                </select>
              </div>
            </div>
            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Amount (PKR)</label>
                <input type="number" required className={styles.formInput} placeholder="e.g. 2999" ref={amountRef} />
              </div>
            </div>
            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className={styles.submitBtn}>Save Subscription</button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.tableControls}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={20} color="#94A3B8" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
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
              <th>User</th>
              <th>Plan</th>
              <th>Payment</th>
              <th>Amount</th>
              <th>Start Date</th>
              <th>Expiry Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedSubs.map((s: any) => (
              <tr key={s.id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{s.user?.name || 'Unknown'}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748B' }}>{s.user?.email || ''}</div>
                </td>
                <td>{s.plan}</td>
                <td>
                  {s.transactionId ? (
                    <div>
                      <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>{s.paymentMethod || 'Manual'}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', fontFamily: 'monospace' }}>TID: {s.transactionId}</div>
                    </div>
                  ) : (
                    <span style={{ color: '#64748B' }}>—</span>
                  )}
                </td>
                <td>{s.amount || '0'}</td>
                <td>{new Date(s.startDate).toLocaleDateString()}</td>
                <td>{new Date(s.endDate).toLocaleDateString()}</td>
                <td>
                  {(() => {
                    const status = getSubStatus(s);
                    return (
                      <span className={`${styles.badge} ${status === 'active' ? styles.badgePremium : styles.badgeUrgent}`}>
                        {status === 'active' ? 'Active' : status === 'pending' ? 'Pending verification' : 'Expired'}
                      </span>
                    );
                  })()}
                </td>
                <td>
                  <button className={`${styles.actionBtn} ${styles.success}`}>Extend</button>
                  {getSubStatus(s) === 'pending' && (
                    <button
                      className={`${styles.actionBtn} ${styles.success}`}
                      onClick={() => handleApprove(s.id)}
                      style={{ background: '#DCFCE7', color: '#16A34A', borderColor: '#BBF7D0', marginLeft: '6px' }}
                    >
                      Approve
                    </button>
                  )}
                  <button 
                    className={`${styles.actionBtn} ${styles.danger}`} 
                    onClick={() => handleRevoke(s.id)}
                    disabled={!s.isActive || new Date(s.endDate) <= now}
                    style={{ opacity: (!s.isActive || new Date(s.endDate) <= now) ? 0.5 : 1, marginLeft: '6px' }}
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span className={styles.pageInfo}>Showing {displayedSubs.length} of {filteredSubs.length} items</span>
        <div className={styles.pageButtons}>
          <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
          <span style={{ color: '#0F1E33', display: 'flex', alignItems: 'center' }}>Page {currentPage} of {totalPages || 1}</span>
          <button className={styles.pageBtn} disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
