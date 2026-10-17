'use client';

import { API_BASE } from '@/lib/api';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Check, Eye, EyeOff, Zap } from 'lucide-react';

const POINTS = [
  { t: '50,000+ MCQs, free to start', d: 'Topic-wise practice across every PPSC subject, organized the way exams test it.' },
  { t: 'Timed mock tests', d: 'Full-length papers under real exam pressure, with instant scoring.' },
  { t: 'Analytics that guide you', d: 'See your weak topics and watch your scores climb week after week.' },
];

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(API_BASE + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Signup failed');

      router.push('/login');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mm-auth">
      <div className="mm-auth-side">
        <h2>Start preparing for free. No card, no catch.</h2>
        <p>
          Join 2,300+ aspirants practicing on Merit Master every day. Your
          first mock test is two minutes away.
        </p>
        <ul className="mm-auth-points">
          {POINTS.map((p) => (
            <li key={p.t}>
              <span className="mm-check">
                <Check size={14} />
              </span>
              <div>
                <strong>{p.t}</strong>
                <p>{p.d}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mm-auth-quote">
          <p>
            &ldquo;I practiced past papers on Merit Master every evening for
            two months. Walked into the exam and half the paper felt
            familiar.&rdquo;
          </p>
          <span>Sana Fatima — Lecturer, Education Department</span>
        </div>
      </div>

      <div className="mm-auth-form-wrap">
        <div className="mm-auth-card">
          <h1>Create your account</h1>
          <p>Free forever plan. Upgrade only if you want to.</p>

          {error && <div className="mm-auth-err">{error}</div>}

          <form onSubmit={handleSignup}>
            <div className="mm-field">
              <label htmlFor="name">Full name</label>
              <input
                type="text"
                id="name"
                placeholder="Muhammad Ali"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="mm-field">
              <label htmlFor="email">Email address</label>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mm-field">
              <label htmlFor="password">Password</label>
              <div className="mm-pass-wrap">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="mm-btn mm-btn-primary mm-submit" disabled={isLoading}>
              {isLoading ? 'Creating account…' : 'Create free account'}
            </button>
          </form>

          <div className="mm-auth-switch">
            Already have an account?<Link href="/login">Log in</Link>
          </div>
          <div className="mm-trial-note">
            <Zap size={14} /> Includes a 7-day Premium trial
          </div>
        </div>
      </div>
    </div>
  );
}
