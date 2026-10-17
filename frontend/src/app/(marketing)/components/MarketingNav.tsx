'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight } from 'lucide-react';

const LINKS = [
  { href: '/#features', label: 'Features' },
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/past-papers', label: 'Past papers' },
  { href: '/subscription', label: 'Pricing' },
];

export default function MarketingNav() {
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
            <span className="mm-brand-mark">M</span>
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
