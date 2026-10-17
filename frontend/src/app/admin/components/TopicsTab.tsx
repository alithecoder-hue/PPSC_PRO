"use client";

import { API_BASE } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import styles from '../admin.module.css';
import { Search, Plus, Trash2, Edit } from 'lucide-react';
import { authFetch } from '../lib/authFetch';

export default function TopicsTab() {
  const [categories, setCategories] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterSubCategory, setFilterSubCategory] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [search, setSearch] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 'beginner',
    categoryId: '',
    subCategoryId: ''
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchTopics();
  }, [filterSubCategory]); // Refetch topics when subcategory filter changes

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      // Fetch categories for the dropdowns
      const catRes = await fetch(`${API_BASE}/api/mcqs/categories`);
      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data);
      }
      // Initial topics fetch
      await fetchTopics();
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTopics = async () => {
    try {
      const url = filterSubCategory 
        ? `${API_BASE}/api/admin/topics/sub/${filterSubCategory}`
        : `${API_BASE}/api/admin/topics`;
      const res = await authFetch(url);
      if (res.ok) {
        const data = await res.json();
        setTopics(data);
      }
    } catch (error) {
      console.error('Failed to fetch topics:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subCategoryId) {
      alert("Name and SubCategory are required");
      return;
    }

    try {
      const url = editId 
        ? `${API_BASE}/api/admin/topics/${editId}`
        : `${API_BASE}/api/admin/topics`;
        
      const res = await authFetch(url, {
        method: editId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          level: formData.level,
          subCategoryId: formData.subCategoryId
        })
      });

      if (res.ok) {
        alert(editId ? 'Topic updated successfully!' : 'Topic created successfully!');
        setIsModalOpen(false);
        setEditId(null);
        setFormData({ name: '', description: '', level: 'beginner', categoryId: '', subCategoryId: '' });
        fetchTopics();
      } else {
        const err = await res.json();
        alert(`Error: ${err.error || 'Failed to save topic'}`);
      }
    } catch (error) {
      console.error('Error saving topic:', error);
      alert('Error connecting to server.');
    }
  };

  const handleEdit = (topic: any) => {
    setEditId(topic.id);
    setFormData({
      name: topic.name,
      description: topic.description || '',
      level: topic.level,
      categoryId: topic.subCategory?.category?.id?.toString() || '',
      subCategoryId: topic.subCategoryId.toString()
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this topic?')) return;
    try {
      const res = await authFetch(`${API_BASE}/api/admin/topics/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('Deleted successfully');
        fetchTopics();
      } else {
        alert('Failed to delete topic. Ensure it has no linked MCQs.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting topic');
    }
  };

  // Derive subcategories for the filter dropdown based on selected category filter
  const filterSubCategories = categories.find((c: any) => c.id.toString() === filterCategory)?.subCategories || [];
  
  // Derive subcategories for the modal dropdown based on selected category in formData
  const formSubCategories = categories.find((c: any) => c.id.toString() === formData.categoryId)?.subCategories || [];

  // Filter the topics list for the table
  const displayedTopics = topics.filter((t: any) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory ? t.subCategory?.category?.id.toString() === filterCategory : true;
    const matchesLevel = filterLevel ? t.level === filterLevel : true;
    return matchesSearch && matchesCategory && matchesLevel;
  });

  const totalPages = Math.ceil(displayedTopics.length / itemsPerPage);
  const paginatedData = displayedTopics.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getLevelBadgeClass = (level: string) => {
    switch(level) {
      case 'beginner': return 'bg-green-500/20 text-green-400 border border-green-500/30';
      case 'moderate': return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
      case 'expert': return 'bg-red-500/20 text-red-400 border border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading && topics.length === 0) return <div style={{ color: 'white', padding: '20px' }}>Loading Topics Manager...</div>;

  return (
    <div>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>Topics Manager</h2>
        <button className={styles.quickActionBtn} onClick={() => {
          setEditId(null);
          setFormData({ name: '', description: '', level: 'beginner', categoryId: '', subCategoryId: '' });
          setIsModalOpen(true);
        }}>
          <Plus size={16} /> Add Topic
        </button>
      </div>

      {/* Top Cascading Filters */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <select 
          className={styles.formInput} 
          style={{ width: '200px' }}
          value={filterCategory} 
          onChange={(e) => {
            setFilterCategory(e.target.value);
            setFilterSubCategory('');
            setCurrentPage(1);
          }}
        >
          <option value="">All Subjects</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select 
          className={styles.formInput} 
          style={{ width: '200px' }}
          value={filterSubCategory} 
          onChange={(e) => {
            setFilterSubCategory(e.target.value);
            setCurrentPage(1);
          }}
          disabled={!filterCategory}
        >
          <option value="">All SubCategories</option>
          {filterSubCategories.map((sub: any) => (
            <option key={sub.id} value={sub.id}>{sub.name}</option>
          ))}
        </select>

        <select 
          className={styles.formInput} 
          style={{ width: '150px' }}
          value={filterLevel} 
          onChange={(e) => {
            setFilterLevel(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="moderate">Moderate</option>
          <option value="expert">Expert</option>
        </select>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
          <Search size={20} color="rgba(255,255,255,0.5)" />
          <input 
            type="text" 
            placeholder="Search topics..." 
            className={styles.searchInput}
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
      </div>

      {/* Add/Edit Modal Form */}
      {isModalOpen && (
        <div className={styles.formCard} style={{ marginBottom: '20px' }}>
          <h3>{editId ? 'Edit Topic' : 'Add New Topic'}</h3>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Subject (Category)</label>
                <select className={styles.formInput} required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value, subCategoryId: ''})}>
                  <option value="">Select a Subject...</option>
                  {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>SubCategory</label>
                <select className={styles.formInput} required value={formData.subCategoryId} onChange={e => setFormData({...formData, subCategoryId: e.target.value})}>
                  <option value="">Select a SubCategory...</option>
                  {formSubCategories.map((sub: any) => (
                    <option key={sub.id} value={sub.id}>{sub.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.optionsGrid}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Topic Name</label>
                <input type="text" required className={styles.formInput} placeholder="e.g. OSI Model" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Difficulty Level</label>
                <select className={styles.formInput} required value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                  <option value="beginner">Beginner</option>
                  <option value="moderate">Moderate</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description (Optional)</label>
              <textarea className={styles.formInput} rows={2} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className={styles.formActions}>
              <button type="button" className={styles.cancelBtn} onClick={() => { setIsModalOpen(false); setEditId(null); }}>Cancel</button>
              <button type="submit" className={styles.submitBtn}>{editId ? 'Update Topic' : 'Save Topic'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Topics Table */}
      <div className={styles.tableContainer}>
        <table className={styles.dataTable}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Topic Name</th>
              <th>Level</th>
              <th>SubCategory</th>
              <th>Subject</th>
              <th>MCQs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((t: any) => (
              <tr key={t.id}>
                <td style={{ color: 'rgba(255,255,255,0.4)' }}>#{t.id}</td>
                <td style={{ fontWeight: 600 }}>{t.name}</td>
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${getLevelBadgeClass(t.level)}`}>
                    {t.level}
                  </span>
                </td>
                <td style={{ color: '#F59E0B' }}>{t.subCategory?.name || 'N/A'}</td>
                <td style={{ color: 'rgba(255,255,255,0.6)' }}>{t.subCategory?.category?.name || 'N/A'}</td>
                <td>{t._count?.mcqs || 0}</td>
                <td>
                  <button className={styles.actionBtn} style={{ marginRight: '8px' }} onClick={() => handleEdit(t)}>
                    <Edit size={14} />
                  </button>
                  <button className={`${styles.actionBtn} ${styles.danger}`} onClick={() => handleDelete(t.id)}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '20px', color: 'rgba(255,255,255,0.5)' }}>
                  No topics found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <span className={styles.pageInfo}>Showing {paginatedData.length} of {displayedTopics.length} topics</span>
        <div className={styles.pageButtons}>
          <button 
            className={styles.pageBtn} 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(p => p - 1)}
          >
            Prev
          </button>
          <span style={{ color: '#FFF', display: 'flex', alignItems: 'center' }}>Page {currentPage} of {totalPages || 1}</span>
          <button 
            className={styles.pageBtn} 
            disabled={currentPage === totalPages || totalPages === 0} 
            onClick={() => setCurrentPage(p => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
