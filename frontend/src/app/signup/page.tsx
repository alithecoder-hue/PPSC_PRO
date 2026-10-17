'use client';

import { API_BASE } from '@/lib/api';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './signup.module.css';

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch(API_BASE + '/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Registration failed');

      alert('Account created successfully! Please login.');
      router.push('/login');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={styles.pageContainer}>
        {/* Background Animated Orbs */}
        <div className="orb-container">
          <div className="orb orb-1"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className={styles.authCard}>
          <div className={styles.header}>
            <h1 className={styles.title}>Create <span className={styles.highlight}>Account</span></h1>
            <p className={styles.subtitle}>Join thousands of successful candidates today.</p>
          </div>

          <form onSubmit={handleSignup}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="firstName">First Name</label>
                <input 
                  type="text" 
                  id="firstName"
                  className={styles.input} 
                  placeholder="Ali"
                  value={formData.firstName}
                  onChange={handleChange}
                  required 
                />
              </div>
              
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="lastName">Last Name</label>
                <input 
                  type="text" 
                  id="lastName"
                  className={styles.input} 
                  placeholder="Tahir"
                  value={formData.lastName}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="email">Email Address</label>
                <input 
                  type="email" 
                  id="email"
                  className={styles.input} 
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="phone">Phone Number</label>
                <input 
                  type="tel" 
                  id="phone"
                  className={styles.input} 
                  placeholder="0300 1234567"
                  value={formData.phone}
                  onChange={handleChange}
                  required 
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label} htmlFor="password">Password</label>
                <div className={styles.passwordWrapper}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="password"
                    className={styles.input} 
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required 
                    minLength={8}
                  />
                  <button 
                    type="button" 
                    className={styles.eyeBtn}
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? <div className={styles.spinner}></div> : 'Create Account'}
            </button>
          </form>

          <div className={styles.footer}>
            Already have an account? 
            <Link href="/login" className={styles.link}>Log In</Link>
          </div>
        </div>
      </div>
    </>
  );
}
