'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, HelpCircle, Check, ArrowRight, Lightbulb } from 'lucide-react';

const questions = [
  {
    id: 1,
    question: "The largest lake in Pakistan is:",
    options: [
      "Manchar Lake",
      "Keenjhar Lake",
      "Hanna Lake",
      "Saif-ul-Muluk Lake"
    ],
    correctIndex: 0,
    explanation: "Manchar Lake is the largest natural freshwater lake in Pakistan and one of the largest in South Asia, located west of the Indus River in Sindh."
  },
  {
    id: 2,
    question: "Which Pakistani scientist won the Nobel Prize in Physics?",
    options: [
      "Dr. Abdul Qadeer Khan",
      "Dr. Abdus Salam",
      "Dr. Atta-ur-Rahman",
      "Dr. Salimuzzaman Siddiqui"
    ],
    correctIndex: 1,
    explanation: "Dr. Abdus Salam won the Nobel Prize in Physics in 1979 for his groundbreaking work on electroweak unification theory."
  },
  {
    id: 3,
    question: "Which is the highest mountain peak in Pakistan?",
    options: [
      "Nanga Parbat",
      "K2 (Godwin-Austen)",
      "Broad Peak",
      "Tirich Mir"
    ],
    correctIndex: 1,
    explanation: "K2, at 8,611 meters (28,251 ft), is the highest peak in Pakistan and the second-highest peak in the world."
  },
  {
    id: 4,
    question: "Who was the first Prime Minister of Pakistan?",
    options: [
      "Liaquat Ali Khan",
      "Muhammad Ali Jinnah",
      "Khawaja Nazimuddin",
      "Chaudhry Muhammad Ali"
    ],
    correctIndex: 0,
    explanation: "Liaquat Ali Khan was appointed as the first Prime Minister of Pakistan in August 1947."
  },
  {
    id: 5,
    question: "The national flower of Pakistan is:",
    options: [
      "Rose",
      "Tulip",
      "Jasmine",
      "Sunflower"
    ],
    correctIndex: 2,
    explanation: "Jasmine (Chambeli) is the official national flower of Pakistan."
  }
];

export default function QuestionOfTheDay() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState(questions[0]);
  const [showPulsar, setShowPulsar] = useState(true);

  useEffect(() => {
    // Select question based on the day of the month
    const day = new Date().getDate();
    setActiveQuestion(questions[day % questions.length]);
  }, []);

  const handleSelect = (idx: number) => {
    if (hasSubmitted) return;
    setSelectedIdx(idx);
    setHasSubmitted(true);
    setShowPulsar(false);
  };

  const handleCTAClick = () => {
    router.push('/classroom');
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 1000,
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Closed Button Pill */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#111827',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '50px',
            padding: '14px 22px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
            cursor: 'pointer',
            position: 'relative',
            transition: 'transform 0.2s, background-color 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <HelpCircle size={18} color="#D97706" />
          <span>Question of the Day</span>
          {showPulsar && (
            <span style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              background: '#EF4444',
              borderRadius: '50%',
              boxShadow: '0 0 0 2px #FFF, 0 0 8px #EF4444'
            }} />
          )}
        </button>
      )}

      {/* Expanded Widget Card */}
      {isOpen && (
        <div style={{
          width: '340px',
          background: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F3F4F6', paddingBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#111827', fontWeight: 'bold', fontSize: '0.95rem' }}>
              <Lightbulb size={18} color="#D97706" />
              <span>Question of the Day</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#111827'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
            >
              <X size={16} />
            </button>
          </div>

          {/* Question Body */}
          <div>
            <p style={{
              margin: '0 0 12px 0',
              fontSize: '1rem',
              fontWeight: 700,
              color: '#111827',
              lineHeight: 1.4,
              fontFamily: 'Georgia, serif'
            }}>
              {activeQuestion.question}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {activeQuestion.options.map((option, idx) => {
                let btnStyle: React.CSSProperties = {
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  background: '#FFFFFF',
                  color: '#374151',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                };

                if (hasSubmitted) {
                  if (idx === activeQuestion.correctIndex) {
                    btnStyle.background = 'rgba(16, 185, 129, 0.08)';
                    btnStyle.borderColor = '#10B981';
                    btnStyle.color = '#065F46';
                  } else if (idx === selectedIdx) {
                    btnStyle.background = 'rgba(239, 68, 68, 0.08)';
                    btnStyle.borderColor = '#EF4444';
                    btnStyle.color = '#991B1B';
                  } else {
                    btnStyle.opacity = 0.6;
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={hasSubmitted}
                    style={btnStyle}
                    onMouseEnter={(e) => {
                      if (!hasSubmitted) {
                        e.currentTarget.style.background = '#F9FAFB';
                        e.currentTarget.style.borderColor = '#D97706';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!hasSubmitted) {
                        e.currentTarget.style.background = '#FFFFFF';
                        e.currentTarget.style.borderColor = '#E5E7EB';
                      }
                    }}
                  >
                    <span>{option}</span>
                    {hasSubmitted && idx === activeQuestion.correctIndex && <Check size={14} color="#10B981" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Explanation & CTA */}
          {hasSubmitted && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              animation: 'fadeIn 0.3s ease-out'
            }}>
              <div style={{
                background: '#F9FAFB',
                borderLeft: '3px solid #D97706',
                padding: '10px 12px',
                borderRadius: '0 8px 8px 0',
                fontSize: '0.8rem',
                color: '#4B5563',
                lineHeight: 1.4
              }}>
                <strong>Explanation:</strong> {activeQuestion.explanation}
              </div>

              <button
                onClick={handleCTAClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  width: '100%',
                  background: '#111827',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#1F2937'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#111827'}
              >
                <span>Practice 1,000+ PPSC MCQs</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
