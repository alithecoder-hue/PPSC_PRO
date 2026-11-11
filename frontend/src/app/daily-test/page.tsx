'use client';

import { API_BASE } from '@/lib/api';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// The daily test lives in the classroom now (Test tab, Daily Premium Exam).
// This page only decides where to send the member: premium members go
// straight into the exam, everyone else goes to the subscription page.
export default function DailyTestPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { router.replace('/login'); return; }
    const checkStatus = async () => {
      try {
        const res = await fetch(API_BASE + '/api/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          const subs = data.subscriptions || [];
          const premium = data.role === 'PREMIUM' || data.role === 'ADMIN'
            || subs.some((s: any) => s.isActive && (!s.endDate || new Date(s.endDate) > new Date()));
          router.replace(premium ? '/classroom?tab=test&daily=1' : '/subscription');
          return;
        }
      } catch (e) { /* fall through to the links below */ }
      setChecking(false);
    };
    checkStatus();
  }, [router]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', textAlign: 'center' }}>
      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Taking you to the classroom…</p>
      {!checking && (
        <p style={{ color: '#64748b' }}>Couldn&apos;t confirm your plan — <Link href="/classroom?tab=test">open the classroom</Link> or <Link href="/subscription">see Premium</Link>.</p>
      )}
    </div>
  );
}
