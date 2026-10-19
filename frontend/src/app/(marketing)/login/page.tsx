'use client';

import { API_BASE } from '@/lib/api';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Zap } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(API_BASE + '/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userName', data.name);
      window.dispatchEvent(new Event('mm-auth-change'));

      if (data.role === 'ADMIN') router.push('/admin');
      else router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mm-auth">
      <div className="mm-auth-side mm-auth-side-login">
        <Link href="/" className="mm-auth-brand" aria-label="Back to home">
          <img src="/images/logo-mark-light.png" alt="" width={30} height={30} />
          <span>
            MERIT<em>MASTER</em>
          </span>
        </Link>
        <div className="mm-auth-msg">
          <span className="mm-auth-kicker">Space to do your best work</span>
          <h2>
            You&apos;re going to make it <span className="mm-hl">one day.</span>
          </h2>
          <p>Bring your preparation together. Make the next move yours.</p>
        </div>
      </div>

      <div className="mm-auth-form-wrap">
        <div className="mm-auth-card">
          <h1>Log in</h1>
          <p>Access your Merit Master dashboard.</p>

          {error && <div className="mm-auth-err">{error}</div>}

          <form onSubmit={handleLogin}>
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
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
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
              {isLoading ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <div className="mm-auth-switch">
            New to Merit Master?<Link href="/signup">Create an account</Link>
          </div>
          <div className="mm-trial-note">
            <Zap size={14} /> Free plan included — no card required
          </div>
        </div>
      </div>
    </div>
  );
}
