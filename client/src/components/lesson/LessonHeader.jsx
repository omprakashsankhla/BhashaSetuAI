import React from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LessonHeader({ title, onClose }) {
  return (
    <header className="lesson-top-nav">
      {onClose ? (
        <button className="close-btn" onClick={onClose} aria-label="Close Lesson">
          <X size={24} />
        </button>
      ) : (
        <Link to="/dashboard" className="close-btn" aria-label="Return to Dashboard">
          <X size={24} />
        </Link>
      )}

      <div className="title-wrapper">
        <h2>{title}</h2>
      </div>
    </header>
  );
}
