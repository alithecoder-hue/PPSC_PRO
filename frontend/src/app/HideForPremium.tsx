'use client';

import React, { useEffect, useState } from 'react';

export default function HideForPremium({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('role');
    if (role === 'PREMIUM' || role === 'ADMIN') {
      setIsPremium(true);
    }
  }, []);

  if (!mounted) return <div style={{ minHeight: '100vh' }}></div>; // Prevent flash during hydration
  if (isPremium) return null;

  return <>{children}</>;
}
