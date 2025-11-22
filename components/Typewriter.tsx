'use client';
import React, { useState, useEffect, useRef } from 'react';

export const Typewriter = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);
  useEffect(() => {
    indexRef.current = 0;
    setDisplayedText('');
    if (!text) return;
    const intervalId = setInterval(() => {
      setDisplayedText((prev) => {
        const nextChar = text.charAt(indexRef.current);
        indexRef.current++;
        if (indexRef.current >= text.length) {
          clearInterval(intervalId);
          if (onComplete) {
            setTimeout(onComplete, 0);
          }
          return text;
        }
        return prev + nextChar;
      });
    }, 5);
    return () => clearInterval(intervalId);
  }, [text, onComplete]);
  return <div className="space-y-2 text-left font-sans leading-relaxed text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{displayedText}</div>;
};
