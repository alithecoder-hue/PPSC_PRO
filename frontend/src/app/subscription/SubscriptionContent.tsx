'use client';

import React, { useState } from 'react';
import styles from './subscriptions.module.css';
import Link from 'next/link';
import { 
  Check, 
  X, 
  Sparkles, 
  Lock, 
  Zap, 
  Headphones, 
  ChevronDown, 
  ChevronUp, 
  HelpCircle,
  ShieldCheck,
  Star
} from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: "How do I download past papers in PDF?",
    answer: "Premium subscribers have access to download high-quality solved PDFs for all past papers. You can download them directly from the study/practice room screen."
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: "Yes, absolutely! You can cancel your subscription directly from your profile settings page with a single click. You will retain access until the end of your billing cycle."
  },
  {
    question: "What payment options are available?",
    answer: "We support JazzCash, EasyPaisa, Nayapay, Sadapay, and all major credit/debit cards via our secure unified checkout gateway."
  },
  {
    question: "Is there a refund policy?",
    answer: "Yes, we offer a 3-day no-questions-asked refund policy. If you feel Meritmaster is not the right fit for your prep, contact our support team for a full refund."
  }
];

export default function SubscriptionContent() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.heroGlow}></div>
      <div className={styles.heroGlowSecondary}></div>

      <div className={styles.content}>
        {/* 1. Hero Header */}
        <div className={styles.header}>
          <div className={styles.badgeCapsule}>
            <Sparkles size={13} className={styles.badgeIcon} />
            <span>MERITMASTER PREMIUM</span>
          </div>

          <h1 className={styles.title}>
            Unlock Your <span className={styles.highlight}>Premium Prep</span>
          </h1>
          
          <p className={styles.subtitle}>
            Choose the plan that fits your preparation journey. Master PPSC, FPSC, and NTS exams with unlimited access.
          </p>
          
          {/* Billing Toggle */}
          <div className={styles.toggleWrapper}>
            <span className={`${styles.toggleLabel} ${!isYearly ? styles.activeLabel : ''}`}>Monthly</span>
            <button 
              className={`${styles.toggleBtn} ${isYearly ? styles.toggled : ''}`}
              onClick={() => setIsYearly(!isYearly)}
              aria-label="Toggle billing interval"
            >
              <div className={styles.toggleCircle}></div>
            </button>
            <span className={`${styles.toggleLabel} ${isYearly ? styles.activeLabel : ''}`}>
              Yearly <span className={styles.saveBadgeSmall}>Save 37%</span>
            </span>
          </div>
        </div>

        {/* 2. Pricing Grid */}
        <div className={styles.pricingGrid}>
          {/* Free Tier */}
          <div className={`${styles.pricingCard} ${styles.freeCard}`}>
            <div className={styles.cardHeader}>
              <h3 className={styles.tierName}>Basic Free</h3>
              <div className={styles.price}>
                <span className={styles.currency}>Rs</span>
                <span className={styles.amount}>0</span>
                <span className={styles.period}>/forever</span>
              </div>
            </div>
            <p className={styles.cardDesc}>For those exploring the Meritmaster platform.</p>
            
            <ul className={styles.featuresList}>
              <li className={styles.included}>
                <Check size={18} className={styles.checkIcon}/> 
                <span>Access to basic syllabus</span>
              </li>
              <li className={styles.included}>
                <Check size={18} className={styles.checkIcon}/> 
                <span>5 Mock tests per month</span>
              </li>
              <li className={styles.excluded}>
                <X size={18} className={styles.crossIcon}/> 
                <span>No PDF downloads</span>
              </li>
              <li className={styles.excluded}>
                <X size={18} className={styles.crossIcon}/> 
                <span>No Past papers library</span>
              </li>
              <li className={styles.excluded}>
                <X size={18} className={styles.crossIcon}/> 
                <span>No Premium materials</span>
              </li>
            </ul>
            
            <Link href="/signup" className={styles.actionBtn}>
              Get Started Free
            </Link>
          </div>

          {/* Premium Tier */}
          <div className={`${styles.pricingCard} ${styles.premiumCard}`}>
            <div className={styles.premiumGlow}></div>
            <div className={styles.cardHeader}>
              <span className={styles.popularBadge}>Most Popular</span>
              <h3 className={styles.tierName} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} className={styles.proSparkleIcon}/> Pro Premium
              </h3>
              <div className={styles.price}>
                <span className={styles.currency}>Rs</span>
                <span className={styles.amount}>{isYearly ? '2999' : '399'}</span>
                <span className={styles.period}>{isYearly ? '/year' : '/month'}</span>
              </div>
            </div>
            <p className={styles.cardDesc}>Unlimited access to everything you need to succeed.</p>
            
            <ul className={styles.featuresList}>
              <li className={styles.included}>
                <Check size={18} className={styles.checkIcon}/> 
                <span>Unlimited mock tests & study rooms</span>
              </li>
              <li className={styles.included}>
                <Check size={18} className={styles.checkIcon}/> 
                <span>Full study material access (all subjects)</span>
              </li>
              <li className={styles.included}>
                <Check size={18} className={styles.checkIcon}/> 
                <span>High-quality solved PDF downloads</span>
              </li>
              <li className={styles.included}>
                <Check size={18} className={styles.checkIcon}/> 
                <span>5+ years of Past Papers library access</span>
              </li>
              <li className={styles.included}>
                <Check size={18} className={styles.checkIcon}/> 
                <span>Custom Daily Test Builder & tracking</span>
              </li>
              <li className={styles.included}>
                <Check size={18} className={styles.checkIcon}/> 
                <span>24/7 Priority support & exam alerts</span>
              </li>
            </ul>
            
            <Link 
              href={`/billing?plan=${isYearly ? 'yearly' : 'premium'}`} 
              className={`${styles.actionBtn} ${styles.primaryBtn}`}
            >
              Subscribe to Pro
            </Link>
          </div>
        </div>

        {/* 3. Secure Trust Badges Section */}
        <section className={styles.trustSection}>
          <div className={styles.trustItem}>
            <Lock size={20} className={styles.trustIcon} />
            <div className={styles.trustText}>
              <h4>Secure Payment</h4>
              <p>256-bit SSL secure gateway</p>
            </div>
          </div>

          <div className={styles.trustItem}>
            <Zap size={20} className={styles.trustIcon} />
            <div className={styles.trustText}>
              <h4>Instant Access</h4>
              <p>Features unlocked immediately</p>
            </div>
          </div>

          <div className={styles.trustItem}>
            <Headphones size={20} className={styles.trustIcon} />
            <div className={styles.trustText}>
              <h4>Priority Support</h4>
              <p>24/7 Dedicated helper team</p>
            </div>
          </div>
        </section>

        {/* 4. Interactive FAQ Section */}
        <section className={styles.faqSection}>
          <div className={styles.faqHeader}>
            <HelpCircle size={24} className={styles.faqIconHeading} />
            <h2 className={styles.faqTitle}>Frequently Asked Questions</h2>
          </div>

          <div className={styles.faqContainer}>
            {FAQ_ITEMS.map((item, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className={`${styles.faqItem} ${isOpen ? styles.faqItemOpen : ''}`}>
                  <button 
                    className={styles.faqQuestionRow}
                    onClick={() => toggleFaq(index)}
                  >
                    <span>{item.question}</span>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                  {isOpen && (
                    <div className={styles.faqAnswer}>
                      <p>{item.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
