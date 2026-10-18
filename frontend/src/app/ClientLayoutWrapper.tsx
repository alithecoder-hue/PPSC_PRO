'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import FloatingHomeBtn from './FloatingHomeBtn';
import PremiumBottomNav from './PremiumBottomNav';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Always start with null on the server to ensure perfect hydration match
  const [role, setRole] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Re-check role whenever the route changes (e.g., after login push)
  useEffect(() => {
    setMounted(true);
    
    const checkRole = () => {
      const currentRole = localStorage.getItem('role');
      setRole(currentRole);
    };
    
    checkRole();

    // Listen for storage events from other tabs
    window.addEventListener('storage', checkRole);
    return () => window.removeEventListener('storage', checkRole);
  }, [pathname]);

  // Routes that are fully self-contained — no outer nav/footer at all (for anyone)
  const isFullscreenRoute =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/test-engine') ||
    pathname?.startsWith('/study-engine') ||
    pathname?.startsWith('/classroom');

  const isPremium = role === 'PREMIUM' || role === 'ADMIN';

  // 1. Fullscreen routes — children only, no outer chrome
  if (isFullscreenRoute) {
    return <main>{children}</main>;
  }

  // To prevent hydration mismatch, only switch to Premium UI after component has mounted on client
  if (mounted && isPremium) {
    return (
      <>
        <main>{children}</main>
        <PremiumBottomNav />
      </>
    );
  }

  // 3. Free User Zone — standard web layout
  // Marketing routes ((marketing) group) render their own nav/footer via
  // the marketing layout, so the legacy chrome is skipped there.
  const isMarketingRoute =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/subscription' ||
    pathname?.startsWith('/billing') ||
    pathname?.startsWith('/past-papers') ||
    pathname?.startsWith('/jobs') ||
    pathname?.startsWith('/mock-tests') ||
    pathname?.startsWith('/contact') ||
    pathname === '/about';

  if (isMarketingRoute) {
    return <main>{children}</main>;
  }

  return (
    <div>
      <Navbar />
      <main>{children}</main>
      <FloatingHomeBtn />
      <Footer />
    </div>
  );
}
