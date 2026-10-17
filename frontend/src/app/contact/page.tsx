'use client';

import React, { useState } from 'react';
import { Mail, MessageCircle, MapPin, CheckCircle } from 'lucide-react';
import styles from './contact.module.css';
import { API_BASE } from '@/lib/api';

export default function ContactPage() {
  const [form, setForm] = useState({ senderName: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch(API_BASE + '/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error('Failed');
      setStatus('success');
      setForm({ senderName: '', email: '', subject: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <div className={styles.contactContainer}>
        <div className="container">
          <div className={styles.header}>
            <h1 className={styles.title}>Contact <span>Us</span></h1>
            <p className={styles.subtitle}>Have a question, feedback, or need support? Our team is here to help you succeed.</p>
          </div>

          <div className={styles.grid}>
            <div className={styles.infoCard}>
              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}><Mail size={24} /></div>
                <div className={styles.infoText}>
                  <h3>Email Support</h3>
                  <p>support@meritmaster.pk</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}><MessageCircle size={24} /></div>
                <div className={styles.infoText}>
                  <h3>WhatsApp</h3>
                  <p>+92 300 0000000</p>
                </div>
              </div>
              <div className={styles.infoItem}>
                <div className={styles.iconWrapper}><MapPin size={24} /></div>
                <div className={styles.infoText}>
                  <h3>Office</h3>
                  <p>Lahore, Pakistan</p>
                </div>
              </div>
            </div>

            <div className={styles.formCard}>
              {status === 'success' ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <CheckCircle size={48} style={{ color: '#10b981', marginBottom: '15px' }} />
                  <h3 style={{ color: '#FFF', marginBottom: '10px' }}>Message Sent!</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)' }}>We'll get back to you within 24 hours.</p>
                  <button onClick={() => setStatus('idle')} className={styles.submitBtn} style={{ marginTop: '20px', width: 'auto', padding: '10px 30px' }}>Send Another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className={styles.inputGroup}>
                    <label>Full Name</label>
                    <input type="text" className={styles.input} placeholder="Your full name" required value={form.senderName} onChange={e => setForm({...form, senderName: e.target.value})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Email Address</label>
                    <input type="email" className={styles.input} placeholder="you@example.com" required value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Subject</label>
                    <input type="text" className={styles.input} placeholder="How can we help?" required value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Message</label>
                    <textarea className={styles.textarea} placeholder="Tell us more..." required value={form.message} onChange={e => setForm({...form, message: e.target.value})} />
                  </div>
                  {status === 'error' && <p style={{ color: '#ef4444', marginBottom: '10px', fontSize: '0.9rem' }}>Something went wrong. Please try again.</p>}
                  <button type="submit" className={styles.submitBtn} disabled={status === 'loading'}>
                    {status === 'loading' ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
