'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Practice lives in the classroom now (Practice tab). This route only
// forwards, preserving the subject when one was given.
function PracticeEngineRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const subject = type === 'subject' && id ? `subject=${encodeURIComponent(id)}&` : '';
    router.replace(`/classroom?${subject}tab=practice`);
  }, [router, searchParams]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', textAlign: 'center' }}>
      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Taking you to the classroom…</p>
      <p style={{ color: '#64748b' }}><Link href="/classroom?tab=practice">Open the classroom practice tab</Link></p>
    </div>
  );
}

export default function PracticeEnginePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Taking you to the classroom…</div>}>
      <PracticeEngineRedirect />
    </Suspense>
  );
}
