'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Mock tests live in the classroom now (Test tab, Custom Exam Generator).
// This page only forwards there.
export default function AllMockTestsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/classroom?tab=test');
  }, [router]);

  return (
    <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px', textAlign: 'center' }}>
      <p style={{ fontSize: '1.1rem', fontWeight: 600 }}>Taking you to the classroom…</p>
      <p style={{ color: '#64748b' }}><Link href="/classroom?tab=test">Open the classroom test tab</Link></p>
    </div>
  );
}
