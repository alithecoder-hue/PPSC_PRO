'use client';

import { API_BASE } from '@/lib/api';
import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Smartphone, CreditCard, Landmark, Check } from 'lucide-react';
import styles from './billing.module.css';

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan') || 'premium';
  
  const isYearly = planParam === 'yearly';
  const planName = isYearly ? 'Meritmaster Pro (Yearly)' : 'Meritmaster Premium (Monthly)';
  const planPrice = isYearly ? '2,999' : '399';
  const currentDate = new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  
  const [selectedMethod, setSelectedMethod] = useState<string>('easypaisa');
  const [transactionId, setTransactionId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  
  const [scanStep, setScanStep] = useState(0);
  
  const handleTransactionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) return;
    
    setIsScanning(true);
    setScanStep(1);

    try {
      // Simulate connecting to ledger
      await new Promise(resolve => setTimeout(resolve, 1500));
      setScanStep(2);

      // Verify transaction against our new backend endpoint
      // We'll hardcode a dummy user ID for now since we haven't wired up a full auth context
      const userId = localStorage.getItem('userId') || '1';
      
      const response = await fetch(API_BASE + '/api/subscriptions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          planId: planParam,
          transactionId
        })
      });

      if (!response.ok) throw new Error('Verification failed');

      setScanStep(3);
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsScanning(false);
      setScanStep(0);
      alert('Transaction verified successfully! Welcome to Meritmaster Premium.');
      setTransactionId('');
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      setIsScanning(false);
      setScanStep(0);
      alert('Transaction verification failed. Please try again.');
    }
  };

  const paymentMethods = [
    {
      id: 'easypaisa',
      name: 'Easypaisa',
      details: { number: '03297615378', title: 'MUHAMMAD ALI TAHIR' },
      icon: <Smartphone size={32} />,
      color: '#00B900',
      glow: 'rgba(0, 185, 0, 0.4)'
    },
    {
      id: 'jazzcash',
      name: 'JazzCash',
      details: { number: '03297615378', title: 'MUHAMMAD ALI TAHIR' },
      icon: <CreditCard size={32} />,
      color: '#EE2A24',
      glow: 'rgba(238, 42, 36, 0.4)'
    },
    {
      id: 'ubl',
      name: 'UBL Bank',
      details: { number: '364381809', title: 'MUHAMMAD ALI TAHIR' },
      icon: <Landmark size={32} />,
      color: '#005AAA',
      glow: 'rgba(0, 90, 170, 0.4)'
    },
  ];

  return (
    <>
      <title>Checkout - Meritmaster</title>
      <div className={styles.pageContainer}>
        {/* Background Animated Orbs */}
        <div className="orb-container">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
        </div>

        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Secure <span className={styles.highlight}>Checkout</span></h1>
            <p className={styles.subtitle}>Complete your payment to instantly unlock Meritmaster Premium.</p>
          </div>

          <div className={styles.checkoutContainer}>
            
            {/* Left Column: Order Summary */}
            <div className={styles.orderSummaryPanel}>
              <h2 className={styles.summaryTitle}>
                <ShieldCheck size={24} color="#00FF80" /> Order Summary
              </h2>
              
              <div className={styles.receiptItem}>
                <span>Invoice Date</span>
                <span style={{ color: '#FFF' }}>{currentDate}</span>
              </div>
              <div className={styles.receiptItem}>
                <span>Billed To</span>
                <span style={{ color: '#FFF' }}>New Subscriber</span>
              </div>
              
              <div className={styles.receiptDivider}></div>
              
              <div className={styles.receiptItem}>
                <span>{planName}</span>
                <span style={{ color: '#FFF' }}>Rs. {planPrice}</span>
              </div>
              <div className={styles.receiptItem}>
                <span>Taxes & Fees</span>
                <span style={{ color: '#FFF' }}>Rs. 0</span>
              </div>

              <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
                <div style={{ color: '#F59E0B', fontSize: '0.9rem', fontWeight: 700, marginBottom: '10px' }}>PACKAGE INCLUDES:</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem', lineHeight: '1.6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><Check size={16} color="#10B981" /> Unlimited Mock Tests</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><Check size={16} color="#10B981" /> Full Study Material Access</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><Check size={16} color="#10B981" /> All Past Papers (2020-2024)</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={16} color="#10B981" /> Premium Dashboard Features</div>
                </div>
              </div>
              
              <div className={styles.receiptDivider}></div>
              
              <div className={styles.receiptTotal}>
                <span>Total Due</span>
                <span className={styles.totalPrice}>Rs. {planPrice}</span>
              </div>

              <div className={styles.securityBadge}>
                <ShieldCheck size={20} />
                <span>256-bit SSL Encrypted Checkout</span>
              </div>
            </div>

            {/* Right Column: Payment Portal */}
            <div className={styles.paymentPanel}>
              <h2 className={styles.portalTitle}>1. Select Payment Method</h2>
              
              <div className={styles.methodsGrid}>
                {paymentMethods.map((method) => (
                  <div 
                    key={method.id}
                    className={`${styles.methodCard} ${selectedMethod === method.id ? styles.selected : ''}`}
                    onClick={() => setSelectedMethod(method.id)}
                    style={{ 
                      '--method-color': method.color,
                      '--method-glow': method.glow 
                    } as React.CSSProperties}
                  >
                    <div className={styles.methodContent}>
                      <div className={styles.methodIcon}>{method.icon}</div>
                      <h3>{method.name}</h3>
                    </div>
                  </div>
                ))}
              </div>

              <div 
                className={styles.paymentTerminal}
                style={{ 
                  '--method-color': paymentMethods.find(m => m.id === selectedMethod)?.color || '#FFF',
                  '--method-glow': paymentMethods.find(m => m.id === selectedMethod)?.glow || 'rgba(255,255,255,0.2)'
                } as React.CSSProperties}
              >
                <div className={styles.detailsHeader}>
                      <h2>2. Transfer Funds</h2>
                      <p>Send exactly Rs. {planPrice} to the following account using your app.</p>
                    </div>
                    
                    {paymentMethods.filter(m => m.id === selectedMethod).map(method => (
                      <div key={method.id} className={styles.accountInfo} style={{ '--method-color': method.color } as React.CSSProperties}>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>Account Name:</span>
                          <span className={styles.value}>{method.details.title}</span>
                        </div>
                        <div className={styles.infoRow}>
                          <span className={styles.label}>{method.id === 'ubl' ? 'Account Number:' : 'Mobile Number:'}</span>
                          <span className={`${styles.value} ${styles.highlightNumber}`}>{method.details.number}</span>
                        </div>
                      </div>
                    ))}

                    <form className={styles.transactionForm} onSubmit={handleTransactionSubmit}>
                      <h4>3. Verify Transaction</h4>
                      <p>Enter the 11-digit Trx ID / TID from your receipt SMS.</p>
                      
                      <div className={styles.inputGroup}>
                        <input 
                          type="text" 
                          className={styles.transactionInput}
                          placeholder="e.g. 01234567890"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                          required
                        />
                        <button 
                          type="submit" 
                          className={styles.transactionBtn}
                          disabled={!transactionId.trim()}
                        >
                          Verify Now
                        </button>
                      </div>
                    </form>
              </div>
            </div>
            
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div 
            className={styles.scanningOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className={styles.radar}>
              <div className={styles.radarCenter}></div>
            </div>
            <div className={styles.scanningText}>
              {scanStep === 1 && "CONNECTING TO LEDGER..."}
              {scanStep === 2 && "VERIFYING TRANSACTION..."}
              {scanStep === 3 && "PAYMENT CONFIRMED!"}
            </div>
            <div className={styles.scanningSubtext}>Tracing ID: {transactionId}</div>
            
            <div style={{ marginTop: '30px', width: '300px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
              <motion.div 
                style={{ height: '100%', background: '#F59E0B' }}
                initial={{ width: '0%' }}
                animate={{ width: scanStep === 3 ? '100%' : scanStep === 2 ? '66%' : '33%' }}
                transition={{ duration: 1 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>Loading checkout...</div>}>
      <BillingContent />
    </Suspense>
  );
}
