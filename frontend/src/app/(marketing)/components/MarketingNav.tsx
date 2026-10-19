'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, X, ArrowRight, LogOut } from 'lucide-react';

const LINKS = [
  { href: '/classroom', label: 'Classroom' },
  { href: '/#features', label: 'Features' },
  { href: '/past-papers', label: 'Past papers' },
  { href: '/subscription', label: 'Pricing' },
];

function readAuth(): { name: string } | null {
  if (typeof window === 'undefined') return null;
  if (!localStorage.getItem('token')) return null;
  return { name: localStorage.getItem('userName') || 'Account' };
}

export default function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [auth, setAuth] = useState<{ name: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const sync = () => setAuth(readAuth());
    sync();
    window.addEventListener('storage', sync);
    window.addEventListener('mm-auth-change', sync);
    return () => {
      window.removeEventListener('storage', sync);
      window.removeEventListener('mm-auth-change', sync);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    window.dispatchEvent(new Event('mm-auth-change'));
    setOpen(false);
    router.push('/');
  };

  const firstName = auth ? auth.name.split(' ')[0] : '';

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
            {auth ? (
              <>
                <Link href="/dashboard" className="mm-nav-user">
                  <span className="mm-nav-avatar">{firstName.charAt(0).toUpperCase()}</span>
                  {firstName}
                </Link>
                <button onClick={logout} className="mm-nav-logout" aria-label="Log out">
                  <LogOut size={15} />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="mm-login">
                  Log in
                </Link>
                <Link href="/signup" className="mm-btn mm-btn-primary mm-nav-cta">
                  Start free <ArrowRight size={15} />
                </Link>
              </>
            )}
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
          {auth ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)}>
                {firstName}&rsquo;s dashboard
              </Link>
              <button
                onClick={logout}
                className="mm-mobile-logout"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)}>
                Log in
              </Link>
              <Link href="/signup" onClick={() => setOpen(false)}>
                Start free
              </Link>
            </>
          )}
        </div>
      </header>
    </>
  );
}
