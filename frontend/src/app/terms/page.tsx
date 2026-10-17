import React from 'react';

import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Terms of Service - Meritmaster',
  description: 'Master your exams with Meritmaster. The ultimate PPSC, FPSC, NTS preparation platform.',
  openGraph: {
    title: 'Terms of Service - Meritmaster',
    description: 'Master your exams with Meritmaster.',
    images: ['/images/og-card.png'],
  }
};


export default function TermsOfServicePage() {
  return (
    <>
      <main className="container" style={{ padding: '120px 0 80px', maxWidth: '800px', color: 'rgba(255,255,255,0.8)' }}>
        <h1 style={{ fontSize: '3rem', color: '#FFF', marginBottom: '40px', fontWeight: 900 }}>Terms of <span style={{ color: '#F59E0B' }}>Service</span></h1>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', fontSize: '1.05rem', lineHeight: 1.8 }}>
          <section>
            <h2 style={{ color: '#FFF', fontSize: '1.5rem', marginBottom: '15px' }}>1. Acceptance of Terms</h2>
            <p>By accessing or using the Meritmaster platform, you agree to be bound by these Terms of Service. If you do not agree to all the terms and conditions, you may not access the website or use any of our services.</p>
          </section>

          <section>
            <h2 style={{ color: '#FFF', fontSize: '1.5rem', marginBottom: '15px' }}>2. Premium Subscriptions</h2>
            <p>Premium memberships are billed on a recurring basis as outlined during the checkout process. You may cancel your subscription at any time through your dashboard; however, no refunds are provided for partial subscription periods.</p>
          </section>

          <section>
            <h2 style={{ color: '#FFF', fontSize: '1.5rem', marginBottom: '15px' }}>3. Intellectual Property & Copyright</h2>
            <p>All mock exams, MCQs, answer explanations, and platform designs are the exclusive intellectual property of Meritmaster. You are strictly prohibited from copying, scraping, or distributing our testing material. Violation of this clause will result in immediate account termination.</p>
          </section>

          <section>
            <h2 style={{ color: '#FFF', fontSize: '1.5rem', marginBottom: '15px' }}>4. User Conduct</h2>
            <p>You agree to use the platform for lawful preparation purposes only. Attempting to manipulate leaderboard scores, sharing premium accounts, or attempting to compromise platform security is strictly prohibited.</p>
          </section>

          <section>
            <h2 style={{ color: '#FFF', fontSize: '1.5rem', marginBottom: '15px' }}>5. Modifications to Service</h2>
            <p>Meritmaster reserves the right to modify, suspend, or discontinue any part of the service (including specific mock exams or subjects) at any time without prior notice.</p>
          </section>
        </div>
      </main>
    </>
  );
}
