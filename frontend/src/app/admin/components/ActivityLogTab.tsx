import React, { useState } from 'react';
import styles from '../admin.module.css';
import { Search, Download, Filter } from 'lucide-react';
import { useContent } from '../hooks/useContent';

export default function ActivityLogTab() {
  const { activityLogs: mockActivityLog, loading, error } = useContent();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading content data from database...</div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

  const filteredLogs = mockActivityLog.filter((l: any) => {
    const adminName = l.admin?.name || l.admin?.email || 'System';
    return (filterType === 'All' || l.action === filterType) &&
           (l.entity.toLowerCase().includes(search.toLowerCase()) || adminName.toLowerCase().includes(search.toLowerCase()));
  });
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const displayedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExportCsv = () => {
    const headers = ['Timestamp', 'Admin', 'Action Type', 'Entity', 'Details'];
    const rows = mockActivityLog.map((l: any) => [new Date(l.createdAt).toISOString(), l.admin?.name || l.admin?.email || 'System', l.action, l.entity, `"${l.details}"`]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'meritmaster_audit_log.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getBadgeClass = (type: string) => {
    switch(type) {
      case 'CREATE': return styles.badgeCreate;
      case 'UPDATE': return styles.badgeUpdate;
      case 'DELETE': return styles.badgeDelete;
      case 'LOGIN': return styles.badgeLogin;
      case 'EXPORT': return styles.badgeExport;
      default: return styles.badgeFree;
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.sectionTitle}>System Activity Log</h2>
          <p style={{ color: 'gray', fontSize: '0.9rem', marginTop: '5px' }}>Read-only audit trail of all platform operations.</p>
        </div>
        <button 
          className={styles.quickActionBtn} 
          style={{ background: 'rgba(168, 85, 247, 0.1)', color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.3)' }}
          onClick={handleExportCsv}
        >
          <Download size={16} /> Export Audit Trail
        </button>
      </div>

      <div className={styles.tableControls}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Search size={20} color="rgba(255,255,255,0.5)" />
          <input 
            type="text" 
            placeholder="Search by entity or admin name..." 
            className={styles.searchInput}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Filter size={16} color="gray" />
          <select className={styles.formInput} style={{ minWidth: '150px' }} value={filterType} onChange={(e) => { setFilterType(e.target.value); setCurrentPage(1); }}>
            <option value="All">All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="LOGIN">LOGIN</option>
            <option value="EXPORT">EXPORT</option>
          </select>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Admin / User</th>
              <th>Action</th>
              <th>Entity Affected</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {displayedLogs.map((log: any) => (
              <tr key={log.id}>
                <td style={{ color: 'gray', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                <td style={{ fontWeight: 600 }}>{log.admin?.name || log.admin?.email || 'System'}</td>
                <td><span className={`${styles.badge} ${getBadgeClass(log.action)}`}>{log.action}</span></td>
                <td>{log.entity}</td>
                <td style={{ color: 'rgba(255,255,255,0.7)' }}>{log.details}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span className={styles.pageInfo}>Showing {displayedLogs.length} of {filteredLogs.length} logs</span>
        <div className={styles.pageButtons}>
          <button className={styles.pageBtn} disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
          <span style={{ color: '#FFF', display: 'flex', alignItems: 'center' }}>Page {currentPage} of {totalPages || 1}</span>
          <button className={styles.pageBtn} disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
        </div>
      </div>
    </div>
  );
}
