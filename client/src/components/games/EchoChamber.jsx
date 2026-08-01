import React, { useState, useRef, useEffect } from 'react';
import { Award, Mic, MicOff, Volume2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { speakText as ttsSpeak } from '../../utils/ttsHelper';

const TWISTERS_DATA = {
  hi: [
    { id: 1, text: 'चंदू के चाचा ने चंदू की चाची को चटनी चटाई', meaning: 'Chandu\'s uncle fed Chandu\'s aunt chutney.', expected: 'चंदू के चाचा ने चंदू की चाची को चटनी चटाई' },
    { id: 2, text: 'खड़क सिंह के खड़कने से खड़कती हैं खिड़कियाँ', meaning: 'Windows rattle when Khadak Singh rattles.', expected: 'खड़क सिंह के खड़कने से खड़कती हैं खिड़कियाँ' },
    { id: 3, text: 'पक्के पेड़ पर पका पपीता', meaning: 'Ripe papaya on a firm tree.', expected: 'पक्के पेड़ पर पका पपीता' }
  ],
  ur: [
    { id: 1, text: 'لالا کے لال قلعے میں لالی کے لال لال پپیتے', meaning: 'Lali\'s red papayas in Lala\'s red fort.', expected: 'لالا کے لال قلعے میں لالی کے لال لال پپیتے' },
    { id: 2, text: 'سڑک پر سکون ہے سکون پر سڑک ہے', meaning: 'There is peace on the road, the road is on peace.', expected: 'سڑک پر سکون ہے سکون پر سڑک ہے' },
    { id: 3, text: 'کچا پاپڑ پکا پاپڑ', meaning: 'Raw papadum, cooked papadum.', expected: 'کچا پاپڑ پکا پاپڑ' }
  ],
  en: [
    { id: 1, text: 'She sells seashells by the seashore', meaning: 'She sells seashells by the seashore.', expected: 'she sells seashells by the seashore' },
    { id: 2, text: 'Peter Piper picked a peck of pickled peppers', meaning: 'Peter Piper picked a peck of pickled peppers.', expected: 'peter piper picked a peck of pickled peppers' }
  ]
};

const getTwisters = (lang) => TWISTERS_DATA[lang] || TWISTERS_DATA['hi'] || TWISTERS_DATA['en'];
const LANG_REC_MAP = { hi: 'hi-IN', ur: 'ur-PK', en: 'en-US' };

const EchoChamber = ({ onGameComplete }) => {
  const { i18n } = useTranslation();
  const list = getTwisters((JSON.parse(localStorage.getItem('user') || '{}').preferred_language || 'hi'));

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState(null); // 'great' | 'try-again'
  const [transcript, setTranscript] = useState('');
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const recognitionRef = useRef(null);
  const activeTwister = list[currentIdx];

  const startRecording = () => {
    setResult(null);
    setTranscript('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = LANG_REC_MAP[(JSON.parse(localStorage.getItem('user') || '{}').preferred_language || 'hi')] || 'hi-IN';
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);

      const cleanText = text.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();
      const cleanExpected = activeTwister.expected.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim();

      // Proximity check: check if at least 50% of words are matching
      const userWords = cleanText.split(' ');
      const expectedWords = cleanExpected.split(' ');
      const matchCount = userWords.filter(w => expectedWords.includes(w)).length;

      const accuracy = matchCount / expectedWords.length;
      if (accuracy >= 0.45) {
        setResult('great');
        setScore(s => s + Math.round(accuracy * 100));
      } else {
        setResult('try-again');
      }
      setIsRecording(false);
    };

    recognition.onerror = () => {
      setIsRecording(false);
      setResult('try-again');
    };

    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  const speak = () => {
    ttsSpeak(activeTwister.text, { rate: 0.8 });
  };

  const handleNext = () => {
    if (currentIdx < list.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setResult(null);
      setTranscript('');
    } else {
      setGameOver(true);
      if (onGameComplete) onGameComplete(score);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setScore(0);
    setGameOver(false);
  };

  return (
    <div style={{ background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '580px', margin: '0 auto', border: '2px solid #cbd5e1', boxSizing: 'border-box', textAlign: 'center' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span className="card-badge active" style={{ background: '#db2777', color: 'white' }}>
          Twister {currentIdx + 1} / {list.length}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#be185d', fontWeight: 800 }}>
          <Award size={18} /> Score: {score}
        </div>
      </div>

      {gameOver ? (
        <div style={{ padding: '3rem 0' }}>
          <span style={{ fontSize: '4.5rem' }}>🎤</span>
          <h2 style={{ color: '#be185d', fontSize: '1.8rem', margin: '1rem 0' }}>Echo Twisters Completed!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>You earned {score} points speaking fluently!</p>
          <button onClick={handleRestart} style={{ background: '#db2777', color: 'white', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={16} /> Replay
          </button>
        </div>
      ) : (
        <div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 1rem 0', fontWeight: 700 }}>
            Read this tongue twister aloud as fast and clearly as possible:
          </p>

          <div style={{ background: 'white', borderRadius: '20px', padding: '2rem 1.5rem', border: '1px solid #fbcfe8', marginBottom: '1.5rem' }}>
            <h1 style={{ margin: '0 0 0.8rem 0', color: '#be185d', fontSize: '2rem', fontWeight: 900, lineHeight: 1.4 }}>
              {activeTwister?.text}
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0, fontStyle: 'italic' }}>
              meaning: "{activeTwister?.meaning}"
            </p>
          </div>

          <button 
            onClick={speak} 
            style={{ background: '#fdf2f8', border: '1px solid #fbcfe8', color: '#db2777', padding: '0.5rem 1.2rem', borderRadius: '20px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 700, marginBottom: '2rem' }}
          >
            <Volume2 size={16} /> Hear Example
          </button>

          {/* Mic Record Toggle */}
          <div style={{ marginBottom: '1.5rem' }}>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              style={{ width: 80, height: 80, borderRadius: '50%', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', background: isRecording ? '#ef4444' : '#db2777', boxShadow: isRecording ? '0 0 0 10px rgba(239,68,68,0.2)' : '0 4px 20px rgba(219,39,119,0.3)', transition: 'all 0.3s' }}
            >
              {isRecording ? <MicOff size={30} color="white" /> : <Mic size={30} color="white" />}
            </button>
            <p style={{ color: '#64748b', marginTop: '0.6rem', fontSize: '0.85rem', fontWeight: 700 }}>
              {isRecording ? 'Listening... Speak!' : 'Tap Mic to Speak'}
            </p>
          </div>

          {transcript && (
            <p style={{ color: '#475569', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
              You said: <strong style={{ color: '#be185d' }}>"{transcript}"</strong>
            </p>
          )}

          {result && (
            <div style={{ marginTop: '1rem', padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', background: result === 'great' ? '#dcfce7' : '#fee2e2', border: `1px solid ${result === 'great' ? '#bbf7d0' : '#fecaca'}`, animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {result === 'great' ? <CheckCircle size={18} color="#10b981" /> : <AlertCircle size={18} color="#ef4444" />}
                <span style={{ fontWeight: 800, color: result === 'great' ? '#14532d' : '#7f1d1d' }}>
                  {result === 'great' ? '🎉 Fantastic pronunciation rhythm!' : '❌ Try pronouncing again.'}
                </span>
              </div>
              {result === 'great' && (
                <button onClick={handleNext} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>
                  Continue →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EchoChamber;
