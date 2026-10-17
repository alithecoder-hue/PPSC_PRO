'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, Bookmark, Briefcase, User, Calendar } from 'lucide-react';
import styles from './premium-bottom-nav.module.css';

export default function PremiumBottomNav() {
  const pathname = usePathname();
  const [isPremium, setIsPremium] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const role = localStorage.getItem('role');
    if (role === 'PREMIUM' || role === 'ADMIN') {
      setIsPremium(true);
    }
  }, []);

  // Rendering is controlled by ClientLayoutWrapper — always renders when mounted by wrapper
  if (!mounted || !isPremium) return null;

  const navItems = [
    { label: 'Home', icon: Home, href: '/' },
    { label: 'To-Do', icon: CheckSquare, href: '/todo' },
    { label: 'Classroom', icon: Calendar, href: '/classroom', isCenter: true },
    { label: 'Vault', icon: Bookmark, href: '/saved-mcqs' },
    { label: 'Profile', icon: User, href: '/profile' },
  ];

  return (
    <div className={styles.bottomNavWrapper}>
      <nav className={styles.bottomNav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          if (item.isCenter) {
            return (
              <Link key="daily-test-center" href={item.href} className={styles.centerButtonWrapper}>
                <div className={`${styles.centerButton} ${isActive ? styles.centerActive : ''}`}>
                  <Icon size={28} strokeWidth={2.5} color="#fff" />
                </div>
                <span className={styles.label}>{item.label}</span>
              </Link>
            );
          }

          return (
            <Link 
              key={item.label} 
              href={item.href} 
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <div className={styles.iconContainer}>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && <div className={styles.activeGlow} />}
              </div>
              <span className={styles.label}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
