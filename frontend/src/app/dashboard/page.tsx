'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { API_BASE } from '@/lib/api';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(API_BASE + '/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setUser(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#fff' }}>Loading dashboard...</div>;
  }

  return (
    <div style={{ minHeight: '100vh', padding: '32px 24px', background: 'linear-gradient(135deg, #07111f, #111827)', color: '#fff' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: 8 }}>Your dashboard</h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 24 }}>
          Welcome back{user?.name ? `, ${user.name}` : ''}. Your premium learning hub is ready.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <Link href="/classroom" style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.08)', color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)' }}>
            <strong>Classroom</strong>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>Practice topics, mock tests, and guided prep.</div>
          </Link>
          <Link href="/daily-test" style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.08)', color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)' }}>
            <strong>Daily test</strong>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>Open today’s curated exam challenge.</div>
          </Link>
          <Link href="/subscription" style={{ padding: 20, borderRadius: 16, background: 'rgba(255,255,255,0.08)', color: '#fff', textDecoration: 'none', border: '1px solid rgba(255,255,255,0.12)' }}>
            <strong>Subscription</strong>
            <div style={{ color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>Manage your plan and unlock more features.</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
