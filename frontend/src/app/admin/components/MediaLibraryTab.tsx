import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { UploadCloud, FileText, Image as ImageIcon, Trash2, Link } from 'lucide-react';
import { authFetch } from '../lib/authFetch';
import { API_BASE } from '@/lib/api';

export default function MediaLibraryTab() {
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fetchMedia = () => {
    authFetch(`${API_BASE}/api/admin/media`)
      .then(res => res.json())
      .then(data => {
        setMedia(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/api/admin/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      if (!res.ok) throw new Error('Upload failed');
      fetchMedia();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/media/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      fetchMedia();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCopyUrl = (e: React.MouseEvent, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${API_BASE}${url}`);
    alert('URL Copied to clipboard!');
  };
  const getFileIcon = (type: string) => {
    if (type === 'PDF') return <FileText size={40} color="#ef4444" />;
    if (type === 'Image') return <ImageIcon size={40} color="#3b82f6" />;
    return <FileText size={40} color="#94A3B8" />;
  };

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Media & File Library</h2>
      </div>

      <div className={styles.csvUploadArea} onClick={() => document.getElementById('mediaUpload')?.click()}>
        <UploadCloud size={48} color="#F59E0B" style={{ marginBottom: '15px' }} />
        <h3 style={{ color: '#0F1E33', margin: '0 0 10px 0' }}>{uploading ? 'Uploading...' : 'Upload New File'}</h3>
        <div className={styles.csvUploadText}>Drag and drop PDFs, Images, or Documents here</div>
        <div className={styles.csvUploadLabel}>Browse Files</div>
        <input type="file" id="mediaUpload" className={styles.hiddenInput} onChange={handleFileUpload} disabled={uploading} />
      </div>

      {loading ? <div style={{ color: '#64748B', marginTop: '20px' }}>Loading media...</div> : (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
        {media.map(file => (
          <div key={file.id} style={{ 
            background: '#FFFFFF', 
            border: '1px solid #E6EAF0', 
            borderRadius: '12px', 
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            transition: 'transform 0.2s ease',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(15, 30, 51, 0.05)'
          }}>
            <button className={styles.actionBtn} style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', padding: '5px' }} onClick={(e) => handleDelete(e, file.id)}>
              <Trash2 size={16} color="#DC2626" />
            </button>
            
            <div style={{ margin: '15px 0' }}>
              {['JPG', 'JPEG', 'PNG', 'GIF', 'WEBP', 'SVG'].includes(file.type) ? (
                <img src={`${API_BASE}${file.url}`} alt={file.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
              ) : getFileIcon(file.type)}
            </div>
            
            <div style={{ color: '#0F1E33', fontWeight: 600, fontSize: '0.9rem', marginBottom: '5px', wordBreak: 'break-all' }}>
              {file.name}
            </div>
            
            <div style={{ color: '#64748B', fontSize: '0.8rem', marginBottom: '15px' }}>
              {file.size} • Uploaded {new Date(file.createdAt).toLocaleDateString()}
            </div>

            <button className={styles.quickActionBtn} style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '8px' }} onClick={(e) => handleCopyUrl(e, file.url)}>
              <Link size={14} /> Copy URL
            </button>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
