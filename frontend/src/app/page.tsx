import React from 'react';
import Link from 'next/link';
import { RevealWrapper } from './ScrollReveal';
import WordRotator from './WordRotator';
import HeroSection from './HeroSection';
import PrepPathsSection from './PrepPathsSection';
import FeaturesSection from './FeaturesSection';
import LeaderboardSection from './LeaderboardSection';
import TestimonialsSection from './TestimonialsSection';
import FAQSection from './FAQSection';
import HideForPremium from './HideForPremium';

import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'PPSC Preparation SaaS - Meritmaster',
  description: 'Master your exams with Meritmaster. The ultimate PPSC, FPSC, NTS preparation platform.',
  openGraph: {
    title: 'PPSC Preparation SaaS - Meritmaster',
    description: 'Master your exams with Meritmaster.',
    images: ['/images/og-card.png'],
  }
};


export default function LandingPage() {
  return (
    <div>
      <HeroSection />

      <HideForPremium>
        <RevealWrapper className="snap-section" id="features">
          <FeaturesSection />
        </RevealWrapper>

        <RevealWrapper className="snap-section" id="prep-paths">
          <PrepPathsSection />
        </RevealWrapper>

        <RevealWrapper className="snap-section" id="leaderboard">
          <LeaderboardSection />
        </RevealWrapper>

        <RevealWrapper className="snap-section" id="testimonials">
          <TestimonialsSection />
        </RevealWrapper>

        <RevealWrapper className="snap-section" id="faq">
          <FAQSection />
        </RevealWrapper>
      </HideForPremium>
    </div>
  );
}
