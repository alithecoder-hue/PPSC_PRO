'use client';

import { usePathname } from 'next/navigation';
import MarketingNav from './MarketingNav';

/** Hides the navbar on auth pages for a clean split-panel look. */
export default function MarketingNavGate() {
  const pathname = usePathname();
  if (pathname === '/login' || pathname === '/signup') return null;
  return <MarketingNav />;
}
