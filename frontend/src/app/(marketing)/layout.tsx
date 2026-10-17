import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './marketing.css';
import MarketingNav from './components/MarketingNav';
import MarketingFooter from './components/MarketingFooter';

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
      <MarketingNav />
      <main>{children}</main>
      <MarketingFooter />
    </div>
  );
}
