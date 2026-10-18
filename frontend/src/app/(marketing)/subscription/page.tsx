import React from 'react';
import { Lock, Zap, Headphones } from 'lucide-react';
import PricingSection from '../components/PricingSection';
import FaqSection from '../components/FaqSection';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing — Merit Master Premium',
  description:
    'Simple pricing for serious PPSC preparation. Start free, upgrade to Premium for Rs 399/month or Rs 2,999/year.',
};

const TRUST = [
  { icon: Lock, t: 'Secure process', d: 'Your payment details stay with your own banking app' },
  { icon: Zap, t: 'Quick activation', d: 'Verified and activated within a few hours' },
  { icon: Headphones, t: 'Human support', d: 'Real people help with billing questions' },
];

export default function SubscriptionPage() {
  return (
    <>
      <PricingSection h1 />

      <section className="mm-section">
        <div className="mm-container">
          <div className="mm-grid-3" style={{ marginTop: 0 }}>
            {TRUST.map((x) => (
              <div key={x.t} className="mm-card" style={{ textAlign: 'center' }}>
                <div className="mm-card-icon" style={{ margin: '0 auto 18px' }}>
                  <x.icon size={22} />
                </div>
                <h3>{x.t}</h3>
                <p>{x.d}</p>
              </div>
            ))}
          </div>

          <div className="mm-center" style={{ marginTop: 64 }}>
            <h2 className="mm-h2" style={{ fontSize: '1.9rem' }}>
              Still deciding?
            </h2>
          </div>
          <FaqSection />
        </div>
      </section>
    </>
  );
}
