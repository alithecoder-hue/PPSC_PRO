'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import { Medal, FileText, Clock, Star } from 'lucide-react';

export default function ExamCard({ test, subjectName }: { test: any, subjectName: string }) {
  const [difficulty, setDifficulty] = useState(5);

  // Determine theme class based on difficulty
  let difficultyClass = 'diff-medium'; // 4-7
  if (difficulty <= 3) difficultyClass = 'diff-easy'; // 1-3
  else if (difficulty >= 8) difficultyClass = 'diff-hard'; // 8-10

  return (
    <div className={`test-zone ${difficultyClass}`}>
      <div className="zone-badge exam-badge">Final Assessment</div>
      <div className="gig-card exam-card">
        <div className="gig-image-wrapper">
          <Image src={test.image} alt={test.title} fill style={{ objectFit: 'cover' }} />
          <span className="gig-badge" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Medal size={14} /> Final Exam</span>
        </div>
        
        <div className="gig-content">
          <h3 className="gig-title">{subjectName} Grand Test</h3>
          <p className="gig-desc">{test.desc}</p>
          
          <div className="gig-action-area">
            <div className="gig-stats" style={{ flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileText size={16} />
                  <span><strong>{test.mcqs}</strong> MCQs</span>
                </div>
                <div className="stat-item" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={16} />
                  <span><strong>{test.time}</strong></span>
                </div>
              </div>
              <div className="stat-item difficulty-slider-container" style={{width: '100%', alignItems: 'stretch'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '10px', fontSize: '0.9rem'}}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Star size={16} /> Difficulty: <strong>{difficulty}</strong></span>
                  <span style={{color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', letterSpacing: '1px'}}>{difficulty <= 3 ? 'EASY' : difficulty <= 7 ? 'MEDIUM' : 'HARD'}</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={difficulty} 
                  onChange={(e) => setDifficulty(Number(e.target.value))}
                  className={`diff-slider ${difficultyClass}`}
                />
              </div>
            </div>
            <button className="take-test-btn">
              <span className="btn-text">Take Test</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
