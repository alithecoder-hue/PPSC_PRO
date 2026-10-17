'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PlayCircle, Lock, Sparkles } from 'lucide-react';
import { API_BASE } from '@/lib/api';

function TestEngineContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'daily-test';
  const id = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsPremium(false);
      setLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const res = await fetch(API_BASE + '/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          const hasPremium = Boolean(data.subscriptions?.length) || data.role === 'ADMIN' || data.role === 'PREMIUM';
          setIsPremium(hasPremium);
        } else {
          setIsPremium(false);
        }
      } catch (error) {
        console.error(error);
        setIsPremium(false);
      } finally {
        setLoading(false);
      }
    };

    checkStatus();
  }, []);

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F6F8FB', color: '#64748B' }}>Loading test engine...</div>;
  }

  if (isPremium === false) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#F6F8FB' }}>
        <div style={{ maxWidth: 520, width: '100%', background: '#FFFFFF', border: '1px solid #E6EAF0', borderRadius: 24, padding: 32, textAlign: 'center', color: '#0C1B2E', boxShadow: '0 4px 16px rgba(15, 30, 51, 0.07)' }}>
          <Lock size={48} style={{ marginBottom: 16, color: '#f59e0b' }} />
          <h1 style={{ fontSize: '1.8rem', marginBottom: 10 }}>Premium access required</h1>
          <p style={{ color: '#64748B', lineHeight: 1.7, marginBottom: 20 }}>
            This exam engine is available for premium members. Upgrade to start your timed test now.
          </p>
          <Link href="/subscription" style={{ display: 'inline-block', padding: '12px 20px', borderRadius: 999, background: '#f59e0b', color: '#1A1207', fontWeight: 700, textDecoration: 'none' }}>
            Upgrade to Premium
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: '#F6F8FB' }}>
      <div style={{ maxWidth: 640, width: '100%', background: '#FFFFFF', border: '1px solid #E6EAF0', borderRadius: 24, padding: 32, color: '#0C1B2E', boxShadow: '0 4px 16px rgba(15, 30, 51, 0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <Sparkles color="#f59e0b" />
          <span style={{ color: '#B45309', fontWeight: 700 }}>Ready to begin</span>
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: 10 }}>Test engine is ready</h1>
        <p style={{ color: '#64748B', lineHeight: 1.7, marginBottom: 24 }}>
          The timed exam flow for {type} is ready. Continue with your selected test from the app.
        </p>
        <button onClick={() => router.push('/')} style={{ padding: '12px 20px', borderRadius: 999, background: '#16A34A', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default function TestEnginePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#F6F8FB', color: '#64748B' }}>Loading...</div>}>
      <TestEngineContent />
    </Suspense>
  );
}
