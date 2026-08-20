import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LessonNavigation({ 
  isChecked, 
  disabledCheck, 
  isRecording, 
  feedbackText, 
  isLastActivity, 
  handleCheck, 
  handleNext 
}) {
  const { t } = useTranslation();
  return (
    <footer className="lesson-footer">
      {!isChecked ? (
        <button 
          className="check-btn primary-btn" 
          onClick={handleCheck}
          disabled={disabledCheck || feedbackText === t('analyzing_audio', 'Analyzing your pronunciation...')}
          style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#58cc02', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
        >
          {feedbackText === t('analyzing_audio', 'Analyzing your pronunciation...') ? t('analyzing', 'Analyzing...') : t('check', 'Check')}
        </button>
      ) : (
        <button 
          className="check-btn primary-btn" 
          onClick={handleNext}
          style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#4285F4', color: 'white', fontSize: '1.2rem', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}
        >
          {isLastActivity ? t('finish_lesson', 'Finish Lesson') : t('continue', 'Continue')}
        </button>
      )}
    </footer>
  );
}
