import React from 'react';
import { Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LessonContent({ 
  activity, 
  selectedAnswer, 
  setSelectedAnswer, 
  isChecked, 
  playTTS 
}) {
  const { t } = useTranslation();

  const renderMCQ = () => (
    <div className="q-mcq">
      <div className="options-grid">
        {activity.options.map(opt => (
          <button 
            key={opt} 
            className={`option-btn ${selectedAnswer === opt ? 'selected' : ''}`}
            onClick={() => setSelectedAnswer(opt)}
            disabled={isChecked}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const renderWriting = () => (
    <div className="q-writing">
      <input 
        type="text" 
        className="text-input" 
        placeholder={t('tutor_placeholder', 'Type your message...')}
        value={selectedAnswer}
        onChange={(e) => setSelectedAnswer(e.target.value)}
        disabled={isChecked}
      />
    </div>
  );

  const renderListening = () => (
    <div className="q-listening">
      <button className="play-audio-btn" onClick={() => playTTS(activity.audioText)}>
        <Volume2 size={40} color="#4285F4" />
      </button>
      <input 
        type="text" 
        className="text-input" 
        placeholder={t('assessment_placeholder_hear')}
        value={selectedAnswer}
        onChange={(e) => setSelectedAnswer(e.target.value)}
        disabled={isChecked}
      />
    </div>
  );

  const renderPuzzle = () => {
    const activeWords = selectedAnswer ? selectedAnswer.split(' ') : [];
    return (
      <div className="q-puzzle">
        <div className="puzzle-dropzone">
          {selectedAnswer || t('assessment_build_sentence')}
        </div>
        <div className="puzzle-words">
          {activity.words.map(w => (
            <button 
              key={w} 
              className="puzzle-piece"
              onClick={() => setSelectedAnswer(prev => prev ? prev + ' ' + w : w)}
              disabled={isChecked || activeWords.includes(w)}
            >
              {w}
            </button>
          ))}
        </div>
        <button 
          className="clear-btn" 
          onClick={() => setSelectedAnswer('')} 
          disabled={isChecked}
        >
          {t('assessment_clear')}
        </button>
      </div>
    );
  };

  switch (activity.type) {
    case 'MCQ': return renderMCQ();
    case 'Writing': return renderWriting();
    case 'Listening': return renderListening();
    case 'Puzzle': return renderPuzzle();
    default: return null;
  }
}
