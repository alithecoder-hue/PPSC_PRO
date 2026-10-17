"use client";

import React, { useState, useEffect } from 'react';
import styles from './exam.module.css';

export default function ExamEngine() {
  const [timeLeft, setTimeLeft] = useState(60 * 90); // 90 minutes
  const [currentQuestion, setCurrentQuestion] = useState(0);

  // Mock Data
  const questions = [
    {
      id: 1,
      text: "Which of the following is not an operating system?",
      options: ["Windows", "Linux", "Oracle", "DOS"],
    },
    {
      id: 2,
      text: "The brain of any computer system is?",
      options: ["ALU", "Memory", "CPU", "Control unit"],
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <main className={`container ${styles.container}`}>
      <div className={styles.header}>
        <h2>Computer Science Exam</h2>
        <div className={`${styles.timer} ${timeLeft < 300 ? styles.timerWarning : styles.timerSafe}`}>
          ⏱️ {formatTime(timeLeft)}
        </div>
      </div>

      <section className={styles.mainCard}>
        <p className={styles.progress}>Question {currentQuestion + 1} of {questions.length}</p>
        <h3 className={styles.questionText}>{questions[currentQuestion].text}</h3>

        <div className={styles.optionsList}>
          {questions[currentQuestion].options.map((opt, index) => (
            <label key={index} className={styles.optionLabel}>
              <input type="radio" name="answer" value={opt} />
              {opt}
            </label>
          ))}
        </div>

        <div className={styles.footer}>
          <button 
            disabled={currentQuestion === 0} 
            onClick={() => setCurrentQuestion(p => Math.max(0, p - 1))}
            className={styles.prevBtn}
          >
            Previous
          </button>
          
          {currentQuestion < questions.length - 1 ? (
            <button 
              onClick={() => setCurrentQuestion(p => Math.min(questions.length - 1, p + 1))}
              className={styles.nextBtn}
            >
              Next
            </button>
          ) : (
            <button 
              className={styles.submitBtn}
            >
              Submit Exam
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
