import React, { useState } from 'react';
import styles from '../admin.module.css';
import { Search, Download } from 'lucide-react';
import { useAdminData } from '../useAdminData';
import { authFetch } from '../lib/authFetch';
import { API_BASE } from '@/lib/api';

export default function UsersTab() {
  const { users, loading, error, refreshData } = useAdminData();
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading users...</div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

  const filteredUsers = users.filter((u: any) => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const displayedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Role', 'Joined Date', 'Last Active'];
    const rows = users.map((u: any) => [u.id, u.name, u.email, u.role, u.createdAt, u.lastActive]);
    const csvContent = [headers.join(','), ...rows.map((r: any) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'meritmaster_users_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRoleChange = async (id: number, role: string) => {
    try {
      const res = await authFetch(`${API_BASE}/api/admin/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role })
      });
      if (!res.ok) throw new Error('Failed to update role');
      (refreshData as any)?.();
    } catch (err: any) { alert(err.message); }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Permanently delete user "${name}"? This cannot be undone.`)) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/users/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete user');
      (refreshData as any)?.();
    } catch (err: any) { alert(err.message); }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>User Management</h2>
        <button 
          className={styles.quickActionBtn} 
          style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}
          onClick={handleExportCsv}
        >
          <Download size={16} /> Export to CSV
        </button>
      </div>

      <div className={styles.tableControls}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={20} color="rgba(255,255,255,0.5)" />
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
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
              <th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Last Active</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {displayedUsers.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', padding: '30px' }}>No users found.</td></tr>
            ) : displayedUsers.map((user: any) => (
              <tr key={user.id}>
                <td style={{ fontWeight: 600 }}>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`${styles.badge} ${user.role === 'ADMIN' ? styles.badgeUrgent : user.role === 'PREMIUM' ? styles.badgePremium : styles.badgeFree}`}>
                    {user.role}
                  </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td>{user.lastActive ? new Date(user.lastActive).toLocaleDateString() : '—'}</td>
                <td style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {user.role === 'USER' && (
                    <button className={`${styles.actionBtn} ${styles.success}`} onClick={() => handleRoleChange(user.id, 'PREMIUM')}>
                      → Premium
                    </button>
                  )}
                  {user.role === 'PREMIUM' && (
                    <button className={styles.actionBtn} onClick={() => handleRoleChange(user.id, 'USER')}>
                      Revoke Premium
                    </button>
                  )}
                  {user.role !== 'ADMIN' && (
                    <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(user.id, user.name)}>
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span className={styles.pageInfo}>Showing {displayedUsers.length} of {filteredUsers.length} users</span>
        <div className={styles.pageButtons}>
          <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
          <span style={{ color: '#FFF', display: 'flex', alignItems: 'center' }}>Page {currentPage} of {totalPages || 1}</span>
          <button className={styles.pageBtn} disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}

