'use client';

import { API_BASE } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Star } from 'lucide-react';
import styles from './testimonials.module.css';

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    fetch(API_BASE + '/api/public/testimonials')
      .then(res => res.json())
      .then(data => {
        const formatted = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          job: d.role,
          avatar: d.avatar || <User size={20} />,
          text: d.quote,
          rating: d.rating
        }));
        
        // Ensure we have at least 6 items for smooth circular animation
        let finalTestimonials = formatted;
        if (formatted.length > 0 && formatted.length < 6) {
          while (finalTestimonials.length < 6) {
            finalTestimonials = [...finalTestimonials, ...formatted];
          }
        }
        // Assign unique IDs to duplicates to prevent react key collision
        const withUniqueIds = finalTestimonials.map((item: any, idx: number) => ({
          ...item,
          uniqueId: `${item.id}-${idx}`
        }));
        setTestimonials(withUniqueIds);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (testimonials.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  const getCardStyle = (index: number) => {
    const total = testimonials.length;
    if (total === 0) return {};

    // Calculate shortest circular distance
    let diff = index - activeIndex;
    if (diff > total / 2) {
      diff -= total;
    } else if (diff < -total / 2) {
      diff += total;
    }

    if (diff === 0) {
      // Center (Active)
      return { x: '0%', scale: 1, zIndex: 10, opacity: 1, filter: 'blur(0px)' };
    } else if (diff === 1) {
      // Right
      return { x: '60%', scale: 0.88, zIndex: 5, opacity: 0.85, filter: 'blur(0px)' };
    } else if (diff === -1) {
      // Left
      return { x: '-60%', scale: 0.88, zIndex: 5, opacity: 0.85, filter: 'blur(0px)' };
    } else if (diff > 1) {
      // Hidden Right
      return { x: '120%', scale: 0.75, zIndex: 1, opacity: 0, filter: 'blur(5px)' };
    } else {
      // Hidden Left
      return { x: '-120%', scale: 0.75, zIndex: 1, opacity: 0, filter: 'blur(5px)' };
    }
  };

  return (
    <div className={styles.testimonialsContainer}>
      <div className="container">
        <div className={styles.header}>
          <h2 className={styles.title}>Join 10,000+ Successful Candidates</h2>
          <p className={styles.subtitle}>Don't just take our word for it. Here is what our successful students have to say about their preparation journey.</p>
        </div>

        <div className={styles.carousel}>
          <AnimatePresence initial={false}>
            {testimonials.map((testimonial, index) => {
              const style = getCardStyle(index);
              return (
                <motion.div
                  key={testimonial.uniqueId}
                  className={styles.cardWrapper}
                  animate={{
                    x: style.x,
                    scale: style.scale,
                    zIndex: style.zIndex,
                    opacity: style.opacity,
                    filter: style.filter
                  }}
                  transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
                  onClick={() => setActiveIndex(index)}
                >
                  <div className={styles.card}>
                    <div className={styles.stars}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} fill={i < testimonial.rating ? "currentColor" : "none"} strokeWidth={i < testimonial.rating ? 0 : 2} />
                    ))}
                  </div>
                    <p className={styles.quote}>"{testimonial.text}"</p>
                    <div className={styles.author}>
                      <div className={styles.avatar}>{testimonial.avatar}</div>
                      <div className={styles.authorInfo}>
                        <h4>{testimonial.name}</h4>
                        <p>{testimonial.job}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
