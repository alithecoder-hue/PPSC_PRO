'use client';
import React, { useState, useEffect } from 'react';

const words = ['PPSC', 'FPSC', 'CSS', 'NTS', 'LAT', 'SPSC', 'BPSC', 'KPPSC'];

export default function WordRotator() {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const handleType = () => {
      const i = loopNum % words.length;
      const fullText = words[i];

      setText(isDeleting ? fullText.substring(0, text.length - 1) : fullText.substring(0, text.length + 1));

      // Adjust speed
      setTypingSpeed(isDeleting ? 70 : 150);

      // If full word is typed, pause before deleting
      if (!isDeleting && text === fullText) {
        setTypingSpeed(2000);
        setIsDeleting(true);
      } 
      // If word is fully deleted, pause before typing next word
      else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
        setTypingSpeed(500);
      }
    };

    timer = setTimeout(handleType, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed]);

  return (
    <span className="word-rotator">
      {text}
    </span>
  );
}
