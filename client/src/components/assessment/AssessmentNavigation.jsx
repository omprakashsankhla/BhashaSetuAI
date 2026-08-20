import React from 'react';
import { useTranslation } from 'react-i18next';

export default function AssessmentNavigation({ 
  feedback, 
  currentQ, 
  audioBlob, 
  selectedAnswer, 
  currentIndex, 
  totalQuestions, 
  handleCheckAnswer, 
  handleNext 
}) {
  const { t } = useTranslation();

  return (
    <div className="action-area" style={{ marginTop: '0.5rem' }}>
      {!feedback || feedback.text === 'Analyzing your pronunciation...' ? (
        <button 
          className={`check-btn natural ${!(currentQ.type === 'Reading' ? !audioBlob : !selectedAnswer) && (!feedback || feedback.text !== 'Analyzing your pronunciation...') ? 'active' : ''}`} 
          onClick={handleCheckAnswer}
          disabled={(currentQ.type === 'Reading' ? !audioBlob : !selectedAnswer) || (feedback && feedback.text === 'Analyzing your pronunciation...')}
        >
          {feedback && feedback.text === 'Analyzing your pronunciation...' ? 'Analyzing...' : t('assessment_check_answer')}
        </button>
      ) : (
        <button 
          className="check-btn next-btn natural active" 
          onClick={handleNext}
        >
          {currentIndex === totalQuestions - 1 ? t('assessment_complete_btn') : t('assessment_next_btn')}
        </button>
      )}
    </div>
  );
}
