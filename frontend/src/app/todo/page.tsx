'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE } from '@/lib/api';
import { authFetch } from '@/lib/authFetch';
import { CheckSquare, Circle, CheckCircle, Calendar, Trash2, Plus, X } from 'lucide-react';
import styles from './todo.module.css';

interface Todo {
  id: number;
  title: string;
  description?: string;
  dueDate?: string;
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
  createdAt: string;
}

interface PlannerItem {
  id: number;
  day: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

const PRIORITY_COLOR = { High: '#EF4444', Medium: '#F59E0B', Low: '#10B981' };

export default function TodoPage() {
  const [activeTab, setActiveTab] = useState<'todo' | 'planner'>('todo');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all');
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'Medium' });
  const [submitting, setSubmitting] = useState(false);

  const [plannerItems, setPlannerItems] = useState<PlannerItem[]>([]);
  const [addingPlannerTaskFor, setAddingPlannerTaskFor] = useState<string | null>(null);
  const [plannerTaskTitle, setPlannerTaskTitle] = useState('');

  const load = useCallback(async () => {
    try {
      const [todosRes, plannerRes] = await Promise.all([
        authFetch(`${API_BASE}/api/premium/todos`),
        authFetch(`${API_BASE}/api/premium/planner`)
      ]);
      if (todosRes.ok) setTodos(await todosRes.json());
      if (plannerRes.ok) setPlannerItems(await plannerRes.json());
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { 
    const params = new URLSearchParams(window.location.search);
    if (params.get('tab') === 'planner') setActiveTab('planner');
    load(); 
  }, [load]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const res = await authFetch(`${API_BASE}/api/premium/todos`, {
        method: 'POST',
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const newTodo = await res.json();
        setTodos(prev => [newTodo, ...prev]);
        setForm({ title: '', description: '', dueDate: '', priority: 'Medium' });
        setShowForm(false);
      }
    } finally { setSubmitting(false); }
  };

  const toggleComplete = async (todo: Todo) => {
    await authFetch(`${API_BASE}/api/premium/todos/${todo.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: !todo.completed }),
    });
    setTodos(prev => prev.map(t => t.id === todo.id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTodo = async (id: number) => {
    await authFetch(`${API_BASE}/api/premium/todos/${id}`, { method: 'DELETE' });
    setTodos(prev => prev.filter(t => t.id !== id));
  };

  const handleAddPlannerTask = async (day: string) => {
    if (!plannerTaskTitle.trim()) {
      setAddingPlannerTaskFor(null);
      return;
    }
    try {
      const res = await authFetch(`${API_BASE}/api/premium/planner`, {
        method: 'POST',
        body: JSON.stringify({ day, title: plannerTaskTitle }),
      });
      if (res.ok) {
        const newItem = await res.json();
        setPlannerItems(prev => [...prev, newItem]);
        setPlannerTaskTitle('');
        setAddingPlannerTaskFor(null);
      }
    } catch (e) {
      console.error('Failed to add planner task', e);
    }
  };

  const togglePlannerComplete = async (item: PlannerItem) => {
    await authFetch(`${API_BASE}/api/premium/planner/${item.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed: !item.completed }),
    });
    setPlannerItems(prev => prev.map(t => t.id === item.id ? { ...t, completed: !item.completed } : t));
  };

  const deletePlannerTask = async (id: number) => {
    await authFetch(`${API_BASE}/api/premium/planner/${id}`, { method: 'DELETE' });
    setPlannerItems(prev => prev.filter(t => t.id !== id));
  };

  const filtered = todos.filter(t =>
    filter === 'all' ? true : filter === 'done' ? t.completed : !t.completed
  );

  const pending = todos.filter(t => !t.completed).length;

  return (
    <div className={styles.page}>
      <div className={styles.orb1} /><div className={styles.orb2} />
      <div className={styles.container}>
        <motion.div className={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.headerTabs}>
            <button 
              className={`${styles.headerTab} ${activeTab === 'todo' ? styles.headerTabActive : ''}`}
              onClick={() => setActiveTab('todo')}
            >
              <CheckSquare size={24} /> To-Do List
            </button>
            <button 
              className={`${styles.headerTab} ${activeTab === 'planner' ? styles.headerTabActive : ''}`}
              onClick={() => setActiveTab('planner')}
            >
              <Calendar size={24} /> Study Planner
            </button>
          </div>
          {activeTab === 'todo' && (
            <button className={styles.addBtn} onClick={() => setShowForm(s => !s)}>
              {showForm ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Add Task</>}
            </button>
          )}
        </motion.div>

        {activeTab === 'todo' ? (
          <>
            {/* Add Form */}
        <AnimatePresence>
          {showForm && (
            <motion.form
              className={styles.form}
              onSubmit={handleAdd}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <input
                className={styles.input}
                placeholder="Task title *"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                required
              />
              <textarea
                className={styles.input}
                placeholder="Description (optional)"
                rows={2}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Due Date</label>
                  <input
                    type="date"
                    className={styles.input}
                    value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Priority</label>
                  <select
                    className={styles.input}
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                  >
                    <option value="High">High Priority</option>
                    <option value="Medium">Medium Priority</option>
                    <option value="Low">Low Priority</option>
                  </select>
                </div>
              </div>
              <button type="submit" className={styles.submitBtn} disabled={submitting}>
                {submitting ? 'Adding…' : 'Add Task'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Filter Tabs */}
        <div className={styles.filters}>
          {(['all', 'pending', 'done'] as const).map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? `All (${todos.length})` : f === 'pending' ? `Pending (${pending})` : `Done (${todos.length - pending})`}
            </button>
          ))}
        </div>

        {/* Task List */}
        {loading ? (
          <div className={styles.emptyState}>Loading your tasks…</div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <CheckCircle size={48} style={{ opacity: 0.5, marginBottom: 12 }} />
            <p>{filter === 'done' ? 'No completed tasks yet.' : filter === 'pending' ? 'All done! Great work.' : 'No tasks yet. Click "Add Task" to get started.'}</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map(todo => (
              <motion.div
                key={todo.id}
                className={`${styles.card} ${todo.completed ? styles.cardDone : ''}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                layout
              >
                <button
                  className={`${styles.checkbox} ${todo.completed ? styles.checkboxDone : ''}`}
                  onClick={() => toggleComplete(todo)}
                  aria-label="Toggle complete"
                >
                  {todo.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                </button>
                <div className={styles.cardContent}>
                  <div className={styles.cardTitle}>{todo.title}</div>
                  {todo.description && <div className={styles.cardDesc}>{todo.description}</div>}
                  <div className={styles.cardMeta}>
                    <span
                      className={styles.priorityBadge}
                      style={{ background: `${PRIORITY_COLOR[todo.priority]}20`, color: todo.priority === 'Medium' ? 'var(--app-accent-deep)' : PRIORITY_COLOR[todo.priority] }}
                    >
                      {todo.priority}
                    </span>
                    {todo.dueDate && (
                      <span className={styles.dueBadge}>
                        <Calendar size={14} style={{ marginRight: 4 }} />
                        {new Date(todo.dueDate).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                  </div>
                </div>
                <button className={styles.deleteBtn} onClick={() => deleteTodo(todo.id)} aria-label="Delete task">
                  <Trash2 size={18} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className={styles.plannerContainer}
          >
            <div className={styles.plannerHeader}>
              <h2 style={{ color: 'var(--app-ink)' }}>Weekly Study Plan</h2>
              <p style={{ color: 'var(--app-muted)' }}>Your custom learning roadmap.</p>
            </div>
            <div className={styles.plannerMockGrid}>
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Weekend'].map((day) => {
                const dayItems = plannerItems.filter(p => p.day === day);
                return (
                  <div key={day} className={styles.plannerMockCard}>
                    <div className={styles.plannerDayTitle}>{day}</div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      {dayItems.map(item => (
                        <div key={item.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', opacity: item.completed ? 0.5 : 1 }}>
                          <button onClick={() => togglePlannerComplete(item)} style={{ background: 'transparent', border: 'none', color: item.completed ? 'var(--app-success)' : 'var(--app-faint)', padding: 0, cursor: 'pointer', marginTop: '2px' }}>
                            {item.completed ? <CheckCircle size={16} /> : <Circle size={16} />}
                          </button>
                          <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--app-ink-2)', textDecoration: item.completed ? 'line-through' : 'none', wordBreak: 'break-word' }}>{item.title}</span>
                          <button onClick={() => deletePlannerTask(item.id)} style={{ background: 'transparent', border: 'none', color: 'var(--app-faint)', padding: 0, cursor: 'pointer' }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      {dayItems.length === 0 && <div style={{ fontSize: '0.8rem', color: 'var(--app-faint)' }}>No tasks for this day.</div>}
                    </div>

                    {addingPlannerTaskFor === day ? (
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <input 
                          type="text" 
                          autoFocus
                          placeholder="Task title..." 
                          value={plannerTaskTitle} 
                          onChange={(e) => setPlannerTaskTitle(e.target.value)} 
                          onKeyDown={(e) => { if (e.key === 'Enter') handleAddPlannerTask(day); else if (e.key === 'Escape') setAddingPlannerTaskFor(null); }}
                          style={{ flex: 1, background: '#fff', border: '1px solid var(--app-line)', color: 'var(--app-ink)', borderRadius: '6px', padding: '6px', fontSize: '0.8rem', outline: 'none' }}
                        />
                        <button onClick={() => handleAddPlannerTask(day)} style={{ background: 'var(--app-accent)', border: 'none', color: '#1a1207', borderRadius: '6px', padding: '0 8px', cursor: 'pointer' }}>+</button>
                        <button onClick={() => setAddingPlannerTaskFor(null)} style={{ background: 'transparent', border: 'none', color: 'var(--app-muted)', cursor: 'pointer' }}><X size={14}/></button>
                      </div>
                    ) : (
                      <button onClick={() => { setAddingPlannerTaskFor(day); setPlannerTaskTitle(''); }} style={{ background: 'var(--app-bg)', border: '1px dashed var(--app-line)', color: 'var(--app-muted)', borderRadius: '6px', padding: '6px', fontSize: '0.8rem', width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <Plus size={14} /> Add Task
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
