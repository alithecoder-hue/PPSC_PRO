'use client';

import { API_BASE } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import styles from './faq.module.css';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [faqs, setFaqs] = useState<any[]>([]);

  useEffect(() => {
    fetch(API_BASE + '/api/public/faqs')
      .then(res => res.json())
      .then(data => setFaqs(data))
      .catch(err => console.error(err));
  }, []);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className={styles.faqContainer}>
      <div className={`container ${styles.splitContainer}`}>
        <div className={styles.leftCol}>
          <h2 className={styles.title}>Frequently Asked<br/><span>Questions</span></h2>
          <p className={styles.subtitle}>Everything you need to know about the Meritmaster platform and how it accelerates your success.</p>
          <div className={`${styles.contactBox} ${styles.desktopContact}`}>
            <h4>Still have questions?</h4>
            <p>Can't find the answer you're looking for? Please chat to our friendly team.</p>
            <Link href="/contact" className={styles.contactBtn}>Contact Support</Link>
          </div>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`${styles.faqItem} ${openIndex === index ? styles.active : ''}`}
            >
              <button className={styles.questionBtn} onClick={() => toggleFaq(index)}>
                {faq.question}
                <ChevronDown className={styles.icon} size={20} />
              </button>
              <div className={styles.answerWrapper}>
                <div className={styles.answerInner}>
                  <div className={styles.answer}>
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className={`${styles.contactBox} ${styles.mobileContact}`}>
          <h4>Still have questions?</h4>
          <p>Can't find the answer you're looking for? Please chat to our friendly team.</p>
          <Link href="/contact" className={styles.contactBtn}>Contact Support</Link>
        </div>
      </div>
    </div>
  );
}
