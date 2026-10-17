'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FileText, Briefcase, User, Crown, Search, Menu, X, LogOut, BookOpen } from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 120);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check auth state from localStorage
    const token = localStorage.getItem('token');
    const name = localStorage.getItem('userName');
    const role = localStorage.getItem('role');
    if (token && name) {
      setLoggedIn(true);
      setUserName(name);
      if (role === 'PREMIUM' || role === 'ADMIN') setIsPremium(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    setLoggedIn(false);
    setUserName('');
    setIsPremium(false);
    router.push('/');
  };

  const initials = userName ? userName.substring(0, 2).toUpperCase() : 'ME';

  return (
    <header className={`ultra-nav ${scrolled ? 'nav-shrunk' : ''}`}>
      <div className="nav-container">
        {/* Left: Brand logo & name */}
        <Link href="/" className="nav-brand">
          <Image src="/images/logo.png" alt="Meritmaster Logo" width={40} height={40} className="brand-logo" style={{ width: '40px', height: '40px' }} />
          <span className="brand-name">
            <span className="brand-merit">MERIT</span>
            <span className="brand-master">MASTER</span>
          </span>
        </Link>

        {/* Center: Desktop Links */}
        <nav className="nav-desktop-center">
          <Link href="/classroom" className="nav-link-item">
            <BookOpen size={16} />
            <span>Classroom</span>
          </Link>
          <Link href="/past-papers" className="nav-link-item">
            <FileText size={16} />
            <span>Past Papers</span>
          </Link>
          <Link href="/jobs" className="nav-link-item">
            <Briefcase size={16} />
            <span>Jobs Board</span>
          </Link>
          <Link href="/subscription" className="nav-link-item">
            <Crown size={16} />
            <span>Premium</span>
          </Link>
        </nav>

        {/* Right: Desktop Actions & User Menu */}
        <div className="nav-desktop-right">
          <button className="nav-search-btn" title="Search">
            <Search size={18} />
          </button>
          {loggedIn ? (
            <div className="nav-user-menu">
              <Link href="/profile" className="nav-user-profile">
                <div className="nav-avatar">{initials}</div>
                <span className="nav-username">{userName.split(' ')[0]}</span>
              </Link>
              <button className="nav-logout-btn" onClick={handleLogout} title="Log Out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="nav-auth-buttons">
              <Link href="/login" className="btn-login-new">Log in</Link>
              <Link href="/signup" className="btn-signup-new">Sign up</Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          className="mobile-menu-btn"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Sidebar/Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="nav-mobile-drawer">
          <nav className="nav-mobile-links">
            <Link href="/classroom" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              <BookOpen size={20} /> <span>Classroom</span>
            </Link>
            <Link href="/past-papers" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              <FileText size={20} /> <span>Past Papers</span>
            </Link>
            <Link href="/jobs" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              <Briefcase size={20} /> <span>Jobs Board</span>
            </Link>
            <Link href="/subscription" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
              <Crown size={20} /> <span>Premium</span>
            </Link>
            <hr className="nav-mobile-divider" />
            {loggedIn ? (
              <>
                <Link href="/profile" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>
                  <User size={20} /> <span>My Profile ({userName})</span>
                </Link>
                <button className="nav-mobile-link logout-btn" onClick={() => { handleLogout(); setMobileMenuOpen(false); }}>
                  <LogOut size={20} /> <span>Log Out</span>
                </button>
              </>
            ) : (
              <div className="nav-mobile-auth">
                <Link href="/login" className="btn-login-mobile" onClick={() => setMobileMenuOpen(false)}>Log in</Link>
                <Link href="/signup" className="btn-signup-mobile" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
