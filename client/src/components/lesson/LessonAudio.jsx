import React from 'react';
import { Mic, Volume2, Snail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LessonAudio({ 
  word, 
  isRecording, 
  isChecked, 
  browserTranscript, 
  startRecording, 
  stopRecording, 
  playTTS 
}) {
  const { t } = useTranslation();

  return (
    <div className="q-reading">
      <div className="reading-prompt">
        <button className="play-audio-btn" onClick={() => playTTS(word)}>
          <Volume2 size={40} color="#4285F4" />
        </button>
        <span className="slow-audio-btn" onClick={() => playTTS(word, true)}>
          <Snail size={20} color="#cbd5e1" />
        </span>
        <h3 className="read-word">{word}</h3>
      </div>
      
      <div className="mic-action-wrapper" style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <button 
          className={`mic-record-btn ${isRecording ? 'recording' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isChecked}
        >
          <Mic size={32} color="white" />
        </button>
        <p className="record-hint" style={{ marginTop: '1rem', color: '#64748b' }}>
          {isRecording ? t('tutor_listening', 'Listening...') : t('tutor_tap_speak', 'Tap to speak')}
        </p>
        
        {browserTranscript && (
          <div className="transcript-preview" style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px', width: '80%', maxWidth: '400px', border: '1px solid #e2e8f0', textAlign: 'left' }}>
            <strong style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.8rem', color: '#64748b' }}>Detected Speech:</strong>
            <p style={{ margin: 0, fontWeight: 500 }}>"{browserTranscript}"</p>
          </div>
        )}
      </div>
    </div>
  );
}
