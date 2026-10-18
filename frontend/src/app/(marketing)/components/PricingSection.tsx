'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, X, ArrowRight } from 'lucide-react';

const FREE_FEATS = [
  { ok: true, text: 'Topic-wise MCQ practice' },
  { ok: true, text: '5 mock tests per month' },
  { ok: true, text: 'Basic performance tracking' },
  { ok: false, text: 'Solved past-paper PDFs' },
  { ok: false, text: 'Unlimited mock tests' },
  { ok: false, text: 'Advanced analytics & study planner' },
];

const PRO_FEATS = [
  { ok: true, text: 'Unlimited mock tests & practice' },
  { ok: true, text: '5+ years of solved past papers (PDF)' },
  { ok: true, text: 'All subjects, all topics unlocked' },
  { ok: true, text: 'Advanced analytics & weak-area reports' },
  { ok: true, text: 'Custom test builder & study planner' },
  { ok: true, text: 'Priority support & exam alerts' },
];

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);

  return (
    <section className="mm-section mm-pricing" id="pricing">
      <div className="mm-container">
        <div className="mm-center">
          <span className="mm-eyebrow">Pricing</span>
          <h2 className="mm-h2">Simple pricing, serious preparation</h2>
          <p className="mm-lead">
            Start free. Upgrade when you&apos;re ready to go all in — less than
            the cost of a single guidebook.
          </p>
          <div className="mm-billing-toggle" role="tablist" aria-label="Billing period">
            <button
              type="button"
              role="tab"
              aria-selected={!yearly}
              className={!yearly ? 'on' : ''}
              onClick={() => setYearly(false)}
            >
              Monthly
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={yearly}
              className={yearly ? 'on' : ''}
              onClick={() => setYearly(true)}
            >
              Yearly <span className="mm-save">Save 37%</span>
            </button>
          </div>
        </div>

        <div className="mm-price-grid">
          <div className="mm-price-card">
            <h3 className="mm-tier">Starter</h3>
            <div className="mm-price">
              <b>Rs 0</b>
              <span>/ forever</span>
            </div>
            <p className="mm-price-desc">
              Everything you need to try the platform.
            </p>
            <ul className="mm-feats">
              {FREE_FEATS.map((f) => (
                <li key={f.text} className={f.ok ? '' : 'no'}>
                  {f.ok ? (
                    <span className="mm-check">
                      <Check size={13} />
                    </span>
                  ) : (
                    <span className="mm-x">
                      <X size={13} />
                    </span>
                  )}
                  {f.text}
                </li>
              ))}
            </ul>
            <Link href="/signup" className="mm-btn mm-btn-ghost-dark">
              Get started free
            </Link>
          </div>

          <div className="mm-price-card pro">
            <span className="mm-pop">Most popular</span>
            <h3 className="mm-tier">Premium</h3>
            <div className="mm-price">
              <b>Rs {yearly ? '2,999' : '399'}</b>
              <span>/{yearly ? 'year' : 'month'}</span>
            </div>
            <p className="mm-price-desc">
              Unlimited access to everything on Merit Master.
            </p>
            <ul className="mm-feats">
              {PRO_FEATS.map((f) => (
                <li key={f.text}>
                  <span className="mm-check">
                    <Check size={13} />
                  </span>
                  {f.text}
                </li>
              ))}
            </ul>
            <Link
              href={`/billing?plan=${yearly ? 'yearly' : 'premium'}`}
              className="mm-btn mm-btn-accent"
            >
              Go Premium <ArrowRight size={15} />
            </Link>
          </div>
        </div>
        <p className="mm-price-note">
          Pay with Easypaisa, JazzCash or bank transfer · Cancel anytime
        </p>
      </div>
    </section>
  );
}
