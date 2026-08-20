import React from 'react';

export default function LessonProgress({ currentIdx, total }) {
  const percent = total > 0 ? Math.round((currentIdx / total) * 100) : 0;
  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percent}%` }}></div>
      </div>
      <span className="progress-text">{currentIdx} / {total}</span>
    </div>
  );
}
