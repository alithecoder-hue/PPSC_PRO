import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './marketing.css';
import MarketingNavGate from './components/MarketingNavGate';
import MarketingFooterGate from './components/MarketingFooterGate';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--mm-font',
});

export const metadata: Metadata = {
  title: 'Merit Master — PPSC, FPSC & NTS Exam Preparation',
  description:
    'Crack the PPSC exam on your first attempt. 50,000+ topic-wise MCQs, 5 years of solved past papers, timed mock tests and performance analytics.',
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`mm-scope ${inter.variable}`}>
      <MarketingNavGate />
      <main>{children}</main>
      <MarketingFooterGate />
    </div>
  );
}
