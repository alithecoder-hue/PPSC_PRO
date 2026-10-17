import React from 'react';
import styles from './subscriptions.module.css';
import Link from 'next/link';

import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Premium Subscription - Meritmaster',
  description: 'Master your exams with Meritmaster. The ultimate PPSC, FPSC, NTS preparation platform.',
  openGraph: {
    title: 'Premium Subscription - Meritmaster',
    description: 'Master your exams with Meritmaster.',
    images: ['/images/og-card.png'],
  }
};


import SubscriptionContent from './SubscriptionContent';

export default function SubscriptionsPage() {
  return (
    <>
      <SubscriptionContent />
    </>
  );
}
