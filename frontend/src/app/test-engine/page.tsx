'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Tests live in the classroom now (Test tab). This route only forwards;
// a daily-test link opens the Daily Premium Exam inside the classroom.
function TestEngineRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get('type');
    const daily = type === 'daily-test' ? '&daily=1' : '';
    router.replace(`/classroom?tab=test${daily}`);
  }, [router, searchParams]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', textAlign: 'center' }}>
      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Taking you to the classroom…</p>
      <p style={{ color: '#64748b' }}><Link href="/classroom?tab=test">Open the classroom test tab</Link></p>
    </div>
  );
}

export default function TestEnginePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Taking you to the classroom…</div>}>
      <TestEngineRedirect />
    </Suspense>
  );
}
