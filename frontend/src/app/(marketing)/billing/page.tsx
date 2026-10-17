'use client';

import { API_BASE } from '@/lib/api';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Check, Copy, Loader2, ArrowLeft } from 'lucide-react';

const METHODS = [
  { id: 'easypaisa', name: 'Easypaisa', number: '03297615378', title: 'MUHAMMAD ALI TAHIR', hint: 'Mobile number' },
  { id: 'jazzcash', name: 'JazzCash', number: '03297615378', title: 'MUHAMMAD ALI TAHIR', hint: 'Mobile number' },
  { id: 'ubl', name: 'UBL Bank', number: '364381809', title: 'MUHAMMAD ALI TAHIR', hint: 'Account number' },
];

const INCLUDED = [
  'Unlimited mock tests & practice',
  'Full study material access',
  '5+ years of solved past papers',
  'Advanced analytics & study planner',
];

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan') || 'premium';

  const isYearly = planParam === 'yearly';
  const planName = isYearly ? 'Premium — Yearly' : 'Premium — Monthly';
  const planPrice = isYearly ? '2,999' : '399';
  const planPeriod = isYearly ? '/year' : '/month';

  const [selectedMethod, setSelectedMethod] = useState('easypaisa');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const method = METHODS.find((m) => m.id === selectedMethod)!;

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(method.number);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) return;

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      router.push('/login');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(API_BASE + '/api/subscriptions/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: planParam,
          transactionId: transactionId.trim(),
          paymentMethod: selectedMethod,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Submission failed. Please try again.');
      }

      router.push('/dashboard?payment=submitted');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <section className="mm-section">
      <div className="mm-container" style={{ maxWidth: 1020 }}>
        <Link href="/subscription" className="mm-back">
          <ArrowLeft size={15} /> Back to pricing
        </Link>

        <h1 className="mm-h2" style={{ marginTop: 18 }}>Checkout</h1>
        <p className="mm-lead" style={{ marginBottom: 40 }}>
          Transfer the amount, then submit your transaction ID. Our team
          verifies it and activates your Premium access.
        </p>

        <div className="mm-checkout">
          {/* Order summary */}
          <div className="mm-summary">
            <h3>Order summary</h3>
            <div className="mm-sum-row">
              <span>{planName}</span>
              <b>Rs {planPrice}<small>{planPeriod}</small></b>
            </div>
            <div className="mm-sum-row">
              <span>Taxes &amp; fees</span>
              <b>Rs 0</b>
            </div>
            <div className="mm-sum-total">
              <span>Total due</span>
              <b>Rs {planPrice}</b>
            </div>
            <div className="mm-sum-feats">
              {INCLUDED.map((f) => (
                <div key={f}>
                  <Check size={14} /> {f}
                </div>
              ))}
            </div>
            <div className="mm-secure">
              <ShieldCheck size={16} /> Manual verification by our team
            </div>
          </div>

          {/* Payment steps */}
          <div className="mm-pay">
            <div className="mm-pay-step">
              <span className="mm-step-n">1</span>
              <div>
                <h4>Transfer Rs {planPrice}</h4>
                <p>Send the exact amount from your {method.name} app.</p>
              </div>
            </div>

            <div className="mm-methods">
              {METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className={`mm-method${selectedMethod === m.id ? ' sel' : ''}`}
                  onClick={() => setSelectedMethod(m.id)}
                >
                  {m.name}
                </button>
              ))}
            </div>

            <div className="mm-account">
              <div>
                <span>Account title</span>
                <b>{method.title}</b>
              </div>
              <div>
                <span>{method.hint}</span>
                <b className="mm-acc-num">
                  {method.number}
                  <button type="button" onClick={copyNumber} aria-label="Copy account number">
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                  </button>
                </b>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mm-pay-step" style={{ marginTop: 28 }}>
                <span className="mm-step-n">2</span>
                <div>
                  <h4>Submit your transaction ID</h4>
                  <p>Find the TID / Trx ID on your payment receipt or SMS.</p>
                </div>
              </div>

              {error && <div className="mm-auth-err">{error}</div>}

              <div className="mm-tid-row">
                <input
                  type="text"
                  placeholder="e.g. 03297615378"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  required
                  minLength={6}
                  disabled={submitting}
                />
                <button
                  type="submit"
                  className="mm-btn mm-btn-primary"
                  disabled={!transactionId.trim() || submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="mm-spin" /> Submitting…
                    </>
                  ) : (
                    'Submit for verification'
                  )}
                </button>
              </div>
              <p className="mm-verify-note">
                Premium activates after our team confirms your transaction —
                usually within a few hours. You&apos;ll be notified on your
                dashboard.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div className="mm-section"><div className="mm-container">Loading checkout…</div></div>}>
      <BillingContent />
    </Suspense>
  );
}
