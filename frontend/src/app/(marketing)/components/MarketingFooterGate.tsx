'use client';

import { usePathname } from 'next/navigation';
import MarketingFooter from './MarketingFooter';

/** Hides the footer on auth pages where it breaks the split-panel design. */
export default function MarketingFooterGate() {
  const pathname = usePathname();
  if (pathname === '/login' || pathname === '/signup') return null;
  return <MarketingFooter />;
}
