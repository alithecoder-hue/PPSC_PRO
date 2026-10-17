import React, { useState } from 'react';
import styles from '../admin.module.css';
import { Mail, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useCommunications } from '../hooks/useCommunications';
import { authFetch } from '../lib/authFetch';
import { API_BASE } from '@/lib/api';

export default function ContactMessagesTab() {
  const { messages: mockContactMessages, loading, error } = useCommunications();
  const [filter, setFilter] = useState<'All' | 'Unread' | 'Read' | 'Replied'>('All');
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

  if (loading) return <div style={{ color: 'white', padding: '20px' }}>Loading communications data from database...</div>;
  if (error) return <div style={{ color: 'red', padding: '20px' }}>Error: {error}</div>;

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/communications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateStatus = async (id: number, isRead: boolean) => {
    try {
      const res = await authFetch(`${API_BASE}/api/admin/communications/${id}/status`, { 
        method: 'PUT',
        body: JSON.stringify({ isRead })
      });
      if (!res.ok) throw new Error('Failed to update status');
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredMessages = mockContactMessages.filter((m: any) => filter === 'All' || m.status === filter);

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Unread': return <span className={`${styles.badge} ${styles.badgeUrgent}`}>Unread</span>;
      case 'Read': return <span className={`${styles.badge} ${styles.badgeFree}`}>Read</span>;
      case 'Replied': return <span className={`${styles.badge} ${styles.badgePremium}`}>Replied</span>;
      default: return null;
    }
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Contact Messages Inbox</h2>
      </div>

      <div className={styles.subTabs}>
        <button className={`${styles.subTabBtn} ${filter === 'All' ? styles.subTabActive : ''}`} onClick={() => setFilter('All')}>All Messages</button>
        <button className={`${styles.subTabBtn} ${filter === 'Unread' ? styles.subTabActive : ''}`} onClick={() => setFilter('Unread')}>Unread</button>
        <button className={`${styles.subTabBtn} ${filter === 'Read' ? styles.subTabActive : ''}`} onClick={() => setFilter('Read')}>Read</button>
        <button className={`${styles.subTabBtn} ${filter === 'Replied' ? styles.subTabActive : ''}`} onClick={() => setFilter('Replied')}>Replied</button>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>Sender</th>
              <th>Subject</th>
              <th>Preview</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMessages.map((msg: any) => {
              const status = msg.status || 'Unread';
              return (
              <React.Fragment key={msg.id}>
                <tr className={styles.clickableRow} onClick={() => setSelectedMessage(selectedMessage?.id === msg.id ? null : msg)}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{msg.senderName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'gray' }}>{msg.email}</div>
                  </td>
                  <td style={{ fontWeight: status === 'Unread' ? 700 : 400 }}>{msg.subject}</td>
                  <td style={{ color: 'gray' }}>{msg.message.substring(0, 40)}...</td>
                  <td>{new Date(msg.createdAt).toLocaleDateString()}</td>
                  <td>{getStatusBadge(status)}</td>
                  <td>
                    <button className={styles.actionBtn} onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}><Trash2 size={14} /></button>
                  </td>
                </tr>
                {/* Expanded Row Content */}
                {selectedMessage?.id === msg.id && (
                  <tr>
                    <td colSpan={6} style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderLeft: '3px solid #F59E0B' }}>
                      <div style={{ marginBottom: '15px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#FFF' }}>Full Message:</h4>
                        <p style={{ color: 'rgba(255,255,255,0.8)', lineHeight: 1.6 }}>{msg.message}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <a 
                          href={`mailto:${msg.email}?subject=Re: ${msg.subject}`} 
                          className={styles.quickActionBtn} 
                          style={{ textDecoration: 'none' }}
                        >
                          <Mail size={16} /> Reply via Email
                        </a>
                        {status === 'Unread' ? (
                          <button className={styles.quickActionBtn} style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => handleUpdateStatus(msg.id, true)}>
                            <CheckCircle size={16} /> Mark as Read
                          </button>
                        ) : (
                          <button className={styles.quickActionBtn} style={{ background: 'rgba(255,255,255,0.1)', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }} onClick={() => handleUpdateStatus(msg.id, false)}>
                            <XCircle size={16} /> Mark as Unread
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
