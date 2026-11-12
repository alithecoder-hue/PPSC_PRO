'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

const COLS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Past papers', href: '/past-papers' },
      { label: 'Mock tests', href: '/classroom?tab=test' },
      { label: 'Pricing', href: '/subscription' },
    ],
  },
  {
    title: 'Exams',
    links: [
      { label: 'PPSC', href: '/classroom' },
      { label: 'FPSC', href: '/classroom' },
      { label: 'NTS', href: '/classroom' },
      { label: 'Jobs board', href: '/jobs' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Log in', href: '/login' },
      { label: 'Sign up', href: '/signup' },
    ],
  },
];

export default function MarketingFooter() {
  // Same auth signal as the marketing navbar: a token in localStorage.
  // Signed-in visitors get Dashboard instead of Log in / Sign up.
  const [signedIn, setSignedIn] = useState(false);
  useEffect(() => {
    const sync = () => setSignedIn(Boolean(localStorage.getItem('token')));
    sync();
    window.addEventListener('mm-auth-change', sync);
    return () => window.removeEventListener('mm-auth-change', sync);
  }, []);

  const cols = signedIn
    ? COLS.map((col) =>
        col.title === 'Company'
          ? {
              ...col,
              links: col.links.map((l) =>
                l.label === 'Log in'
                  ? { label: 'Dashboard', href: '/dashboard' }
                  : l.label === 'Sign up'
                    ? { label: 'Classroom', href: '/classroom' }
                    : l
              ),
            }
          : col
      )
    : COLS;

  return (
    <footer className="mm-footer">
      <div className="mm-container">
        <div className="mm-footer-grid">
          <div className="mm-footer-brand">
            <Link href="/" className="mm-brand">
              <img src="/images/logo-mark-light.png" alt="" width={34} height={34} className="mm-brand-img" />
              <span>
                MERIT<em>MASTER</em>
              </span>
            </Link>
            <p>
              The focused preparation platform for PPSC, FPSC and NTS exams.
              Practice with real past papers, timed mocks and analytics that
              show exactly where you stand.
            </p>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4>{col.title}</h4>
              <ul>
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mm-footer-bottom">
          <span>© {new Date().getFullYear()} Merit Master. All rights reserved.</span>
          <span>Made for aspirants, by aspirants.</span>
        </div>
      </div>
    </footer>
  );
}
