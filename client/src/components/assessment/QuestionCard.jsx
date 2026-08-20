import React from 'react';
import { Volume2, Mic } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function QuestionCard({ 
  currentQ, 
  selectedAnswer, 
  setSelectedAnswer, 
  feedback, 
  isRecording, 
  audioBlob, 
  browserTranscript, 
  startRecording, 
  stopRecording, 
  playTTS 
}) {
  const { t } = useTranslation();

  const renderMCQ = () => (
    <div className="q-mcq">
      <div className="options-grid">
        {currentQ.options.map(opt => (
          <button 
            key={opt} 
            className={`option-btn ${selectedAnswer === opt ? 'selected' : ''}`}
            onClick={() => setSelectedAnswer(opt)}
            disabled={feedback !== null}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  const renderReading = () => (
    <div className="q-reading" style={{ textAlign: 'center' }}>
      <div className="flashcard large">
        {currentQ.word}
      </div>
      
      <div className="mic-action-wrapper">
        <button 
          className={`mic-record-btn ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={feedback !== null}
        >
          <Mic size={32} color="white" />
        </button>
        <p className="record-hint">
          {isRecording ? t('tutor_listening', 'Listening...') : t('tutor_tap_speak', 'Tap to record yourself')}
        </p>
        
        {browserTranscript && (
          <div className="transcript-preview" style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', width: '100%', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>Detected Speech:</strong>
            <p style={{ margin: 0, fontWeight: 500 }}>"{browserTranscript}"</p>
          </div>
        )}
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
        disabled={feedback !== null}
        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '1.1rem', outline: 'none' }}
      />
    </div>
  );

  const renderListening = () => (
    <div className="q-listening" style={{ textAlign: 'center' }}>
      <button className="play-audio-btn" onClick={() => playTTS(currentQ.audioText)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', margin: '0 auto 1.5rem auto' }}>
        <Volume2 size={40} color="#4285F4" />
      </button>
      <p className="hint-text" style={{ color: '#64748b', marginBottom: '1.5rem' }}>{t('assessment_hint_click_listen')}</p>
      <input 
        type="text" 
        className="text-input" 
        placeholder={t('assessment_placeholder_hear')}
        value={selectedAnswer}
        onChange={(e) => setSelectedAnswer(e.target.value)}
        disabled={feedback !== null}
        style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '2px solid #cbd5e1', fontSize: '1.1rem', outline: 'none' }}
      />
    </div>
  );

  const renderPuzzle = () => {
    return (
      <div className="q-puzzle">
        <div className="puzzle-dropzone" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '2px dashed #cbd5e1', minHeight: '60px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedAnswer ? '#1e293b' : '#94a3b8', fontSize: '1.2rem', fontWeight: 500 }}>
          {selectedAnswer || t('assessment_build_sentence')}
        </div>
        <div className="puzzle-words" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.5rem' }}>
          {currentQ.words.map(w => (
            <button 
              key={w} 
              className="puzzle-piece"
              onClick={() => setSelectedAnswer(prev => prev ? prev + ' ' + w : w)}
              disabled={feedback !== null || selectedAnswer.includes(w)}
              style={{ padding: '0.75rem 1.25rem', background: 'white', border: '2px solid #cbd5e1', borderRadius: '12px', fontSize: '1.05rem', fontWeight: 600, color: '#1e293b', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
            >
              {w}
            </button>
          ))}
        </div>
        <button 
          className="clear-btn" 
          onClick={() => setSelectedAnswer('')} 
          disabled={feedback !== null}
          style={{ background: 'none', border: 'none', color: '#ef4444', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
        >
          {t('assessment_clear')}
        </button>
      </div>
    );
  };

  switch (currentQ.type) {
    case 'MCQ':
    case 'Grammar':
    case 'Vocabulary':
    case 'Puzzle':
      return currentQ.type === 'Puzzle' ? renderPuzzle() : renderMCQ();
    case 'Reading': return renderReading();
    case 'Writing': return renderWriting();
    case 'Listening': return renderListening();
    default: return null;
  }
}
