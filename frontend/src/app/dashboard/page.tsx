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
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: '#64748B' }}>Loading dashboard...</div>;
  }

  return (
    <div className="app-page">
      <div className="app-container" style={{ maxWidth: 900 }}>
        <h1 className="app-title">Your dashboard</h1>
        <p className="app-subtitle" style={{ marginBottom: 24 }}>
          Welcome back{user?.name ? `, ${user.name}` : ''}. Your premium learning hub is ready.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          <Link href="/classroom" className="app-card app-card-hover" style={{ display: 'block', textDecoration: 'none' }}>
            <div className="app-card-title">Classroom</div>
            <div className="app-card-text">Practice topics, mock tests, and guided prep.</div>
          </Link>
          <Link href="/daily-test" className="app-card app-card-hover" style={{ display: 'block', textDecoration: 'none' }}>
            <div className="app-card-title">Daily test</div>
            <div className="app-card-text">Open today’s curated exam challenge.</div>
          </Link>
          <Link href="/subscription" className="app-card app-card-hover" style={{ display: 'block', textDecoration: 'none' }}>
            <div className="app-card-title">Subscription</div>
            <div className="app-card-text">Manage your plan and unlock more features.</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
