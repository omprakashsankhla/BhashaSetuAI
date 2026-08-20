import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

export default function AssessmentTimer({ isActive }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748b', fontWeight: 600, fontSize: '0.95rem' }}>
      <Clock size={16} />
      <span>{formatTime(seconds)}</span>
    </div>
  );
}
