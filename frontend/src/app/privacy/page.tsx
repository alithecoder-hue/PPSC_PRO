import React from 'react';

import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Privacy Policy - Meritmaster',
  description: 'Master your exams with Meritmaster. The ultimate PPSC, FPSC, NTS preparation platform.',
  openGraph: {
    title: 'Privacy Policy - Meritmaster',
    description: 'Master your exams with Meritmaster.',
    images: ['/images/og-card.png'],
  }
};


export default function PrivacyPolicyPage() {
  return (
    <>
      <main className="container" style={{ padding: '120px 0 80px', maxWidth: '800px', color: '#334155' }}>
        <h1 style={{ fontSize: '3rem', color: '#0C1B2E', marginBottom: '40px', fontWeight: 900 }}>Privacy <span style={{ color: '#B45309' }}>Policy</span></h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', fontSize: '1.05rem', lineHeight: 1.8 }}>
          <section>
            <h2 style={{ color: '#0C1B2E', fontSize: '1.5rem', marginBottom: '15px' }}>1. Information We Collect</h2>
            <p>At Meritmaster, we collect personal information you provide when creating an account, such as your email address, name, and profile details. We also collect data regarding your mock test attempts, scores, and time taken to provide personalized AI-driven analytics.</p>
          </section>

          <section>
            <h2 style={{ color: '#0C1B2E', fontSize: '1.5rem', marginBottom: '15px' }}>2. How We Use Your Information</h2>
            <p>Your data is used strictly to enhance your preparation experience. We use your test history to highlight weak syllabus areas and recommend specific topics for revision. We do not sell your personal data to third parties.</p>
          </section>

          <section>
            <h2 style={{ color: '#0C1B2E', fontSize: '1.5rem', marginBottom: '15px' }}>3. Data Security</h2>
            <p>We employ industry-standard encryption protocols to protect your personal information and payment details. Your account security is our top priority.</p>
          </section>

          <section>
            <h2 style={{ color: '#0C1B2E', fontSize: '1.5rem', marginBottom: '15px' }}>4. Cookies and Tracking</h2>
            <p>We use essential cookies to maintain your active session and preferences. You can disable non-essential cookies through your browser settings, though this may affect platform functionality.</p>
          </section>

          <section>
            <h2 style={{ color: '#0C1B2E', fontSize: '1.5rem', marginBottom: '15px' }}>5. Contact Us</h2>
            <p>If you have any questions regarding this Privacy Policy, please contact our Data Protection Officer at <strong>privacy@meritmaster.pk</strong>.</p>
          </section>
        </div>
      </main>
    </>
  );
}
