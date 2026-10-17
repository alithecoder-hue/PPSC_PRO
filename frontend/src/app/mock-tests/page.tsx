'use client';

import React from 'react';
import MockTestsSection from '../MockTestsSection';

export default function AllMockTestsPage() {
  return (
    <>
      <div className="container" style={{ paddingTop: '120px', paddingBottom: '80px', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 900, color: '#0C1B2E', marginBottom: '15px' }}>
            Job Specific <span style={{ color: '#B45309' }}>Mock Tests</span>
          </h1>
          <p style={{ color: '#64748B', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Browse our complete library of highly realistic, timed mock exams tailored to specific posts like Inspector, Educator, and Patrol Officer.
          </p>
        </div>

        <MockTestsSection />
      </div>
    </>
  );
}
