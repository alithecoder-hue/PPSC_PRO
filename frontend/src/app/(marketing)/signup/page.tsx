'use client';

import { API_BASE } from '@/lib/api';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Zap, Flame } from 'lucide-react';

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
        <div className="mm-auth-brand">
          <img src="/images/logo-mark.png" alt="" width={34} height={34} />
          <span>
            MERIT<em>MASTER</em>
          </span>
        </div>
        <h2>
          What if <span className="mm-hl">this attempt</span> is the one?
        </h2>
        <p>
          Join 2,300+ aspirants preparing on Merit Master. Your first mock
          test is two minutes away.
        </p>
        <div className="mm-auth-deco" aria-hidden="true">
          <div className="mm-deco-score">
            <span>Latest mock score</span>
            <strong>
              82<small>/100</small>
            </strong>
            <div className="mm-deco-bar">
              <i />
            </div>
          </div>
          <div className="mm-deco-streak">
            <Flame size={15} />
            <span>12-day streak</span>
          </div>
        </div>
        <p className="mm-auth-foot">50,000+ MCQs · 5 years of past papers · 4.9/5 student rating</p>
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
