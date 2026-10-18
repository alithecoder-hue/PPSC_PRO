'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';

const LINKS = [
  { href: '/classroom', label: 'Classroom' },
  { href: '/#features', label: 'Features' },
  { href: '/past-papers', label: 'Past papers' },
  { href: '/subscription', label: 'Pricing' },
];

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    setTheme(current === 'light' ? 'light' : 'dark');
  }, []);
  const toggle = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('mm-theme', next);
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
    setTheme(next);
  };
  return { theme, toggle };
}

export default function MarketingNav() {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="mm-announce">
        <strong>New:</strong> 5 years of solved PPSC past papers now live.
        <Link href="/past-papers">Browse the library</Link>
      </div>
      <header className="mm-nav">
        <div className="mm-container mm-nav-inner">
          <Link href="/" className="mm-brand" aria-label="Merit Master home">
            <img src="/images/logo-mark.png" alt="" width={34} height={34} className="mm-brand-img" />
            <span>
              MERIT<em>MASTER</em>
            </span>
          </Link>

          <nav className="mm-nav-links" aria-label="Primary">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href}>
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="mm-nav-actions">
            <button
              type="button"
              className="mm-theme-toggle"
              onClick={toggle}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <Link href="/login" className="mm-login">
              Log in
            </Link>
            <Link href="/signup" className="mm-btn mm-btn-primary mm-nav-cta">
              Start free <ArrowRight size={15} />
            </Link>
            <button
              className="mm-mobile-toggle"
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        <div className="mm-mobile-menu" data-open={open}>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)}>
            Log in
          </Link>
          <Link href="/signup" onClick={() => setOpen(false)}>
            Start free
          </Link>
        </div>
      </header>
    </>
  );
}
