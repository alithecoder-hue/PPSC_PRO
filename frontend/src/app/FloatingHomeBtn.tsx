'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Home, CalendarClock } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function FloatingHomeBtn() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNearFooter, setIsNearFooter] = useState(false);
  const [isManuallyUnfolded, setIsManuallyUnfolded] = useState(false);
  const isHome = pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
      setIsNearFooter(window.innerHeight + window.scrollY >= document.body.offsetHeight - 400);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isManuallyUnfolded) {
      timeout = setTimeout(() => setIsManuallyUnfolded(false), 4000);
    }
    return () => clearTimeout(timeout);
  }, [isManuallyUnfolded]);

  const showHomeBtn = !isHome || isScrolled;
  // Folded by default, expands when tapped/clicked
  const isFolded = !isManuallyUnfolded;

  // Rendering is controlled by ClientLayoutWrapper — this component always renders when mounted
  return (
    <div
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        display: isNearFooter ? 'none' : 'flex',
        gap: '15px',
        zIndex: 90,
        background: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        padding: isFolded ? '5px' : '10px 15px',
        borderRadius: '50px',
        border: '1px solid #E6EAF0',
        boxShadow: '0 10px 30px rgba(15, 30, 51, 0.12)',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Home Button - Only rendered when not on homepage */}
      {showHomeBtn && (
        <Link 
          href="/" 
          onClick={(e) => {
            if (isHome) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          aria-label="Return to homepage"
          style={{
            width: '50px',
            height: '50px',
            backgroundColor: '#F59E0B',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0C1B2E',
            boxShadow: '0 5px 15px rgba(245, 158, 11, 0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          <Home size={24} />
        </Link>
      )}

      {/* Classroom Button */}
      <Link 
        href="/classroom" 
        aria-label="Enter Classroom"
        style={{
          width: isFolded ? '50px' : 'auto',
          height: '50px',
          padding: isFolded ? '0' : '0 20px',
          backgroundColor: '#0C1B2E',
          borderRadius: '25px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isFolded ? '0' : '8px',
          color: '#FFF',
          fontWeight: 800,
          boxShadow: '0 5px 15px rgba(12, 27, 46, 0.35)',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          textDecoration: 'none',
          overflow: 'hidden',
          whiteSpace: 'nowrap'
        }}
        onClick={(e) => {
          if (isFolded) {
            e.preventDefault();
            setIsManuallyUnfolded(true);
          }
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(12, 27, 46, 0.45)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 5px 15px rgba(12, 27, 46, 0.3)';
        }}
      >
        <CalendarClock size={20} />
        <span style={{ 
          maxWidth: isFolded ? '0px' : '100px', 
          opacity: isFolded ? 0 : 1,
          transition: 'all 0.4s ease'
        }}>
          Classroom
        </span>
      </Link>
    </div>
  );
}
