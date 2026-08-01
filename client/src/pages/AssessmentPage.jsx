import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Mic, Square, Loader, CheckCircle, XCircle, Volume2 } from 'lucide-react';
import './AssessmentPage.css';

const AssessmentPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.proficiency_level || 'Beginner';
      } catch (e) {
        return 'Beginner';
      }
    }
    return 'Beginner';
  });
  
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); 
  const [results, setResults] = useState([]);
  
  const [isComplete, setIsComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [aiEvaluation, setAiEvaluation] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [browserTranscript, setBrowserTranscript] = useState('');
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const recognitionRef = useRef(null);
  const isRecordingRef = useRef(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isRetake = params.get('retake') === 'true';

    const userStr = localStorage.getItem('user');
    if (userStr && !isRetake) {
      try {
        const user = JSON.parse(userStr);
        if (user.has_completed_assessment) {
          navigate('/dashboard', { replace: true });
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchQuestions(selectedLevel);
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [navigate, selectedLevel]);

  const playTTS = (textToSpeak) => {
    try {
      if (!window.speechSynthesis) return;
      
      // Determine the user's LEARNING language (not interface language)
      let learningLang = 'hi';
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        learningLang = storedUser.preferred_language || 'hi';
      } catch (e) {}

      const LANG_REC_MAP = { hi: 'hi-IN', ur: 'ur-PK', mwr: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', mr: 'mr-IN', en: 'en-US' };
      const isEnglish = /^[a-zA-Z0-9\s.,!?'"-]+$/.test(textToSpeak);
      const langCode = isEnglish ? 'en-US' : (LANG_REC_MAP[learningLang] || 'hi-IN');
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = langCode;
      utterance.rate = 0.85; 
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const speakUtterance = () => {
        const voices = window.speechSynthesis.getVoices();
        const exactVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
        const premiumVoice = voices.find(v => v.lang.startsWith(langCode.split('-')[0]) && (v.name.includes('Google') || v.name.includes('Premium') || v.name.includes('Natural')));
        
        if (premiumVoice) {
          utterance.voice = premiumVoice;
        } else if (exactVoice) {
          utterance.voice = exactVoice;
        }

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
      };

      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          speakUtterance();
        };
      } else {
        speakUtterance();
      }
    } catch (e) {
      console.error("TTS playback failed", e);
    }
  };

  useEffect(() => {
    if (questions && questions.length > 0 && currentIndex < questions.length) {
      const currentQ = questions[currentIndex];
      if (currentQ.type === 'Listening' && currentQ.audioText) {
        playTTS(currentQ.audioText);
      } else if (currentQ.type === 'Writing' && currentQ.text) {
        playTTS(currentQ.text);
      }
    }
  }, [currentIndex, questions]);

  const fetchQuestions = async (level) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/assessment/generate?lang=${i18n.language}&level=${level}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setQuestions(data.questions);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCheckAnswer = async () => {
    const currentQ = questions[currentIndex];
    
    // For Reading/Voice tasks, we send the transcription to backend for grading
    if (currentQ.type === 'Reading') {
      if (!audioBlob) {
        setFeedback({ isCorrect: false, text: 'No audio detected. Please try recording again.' });
        return;
      }
      setFeedback({ isCorrect: true, text: 'Analyzing your pronunciation...' }); // temporary loading state
      
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('audio', audioBlob, 'speech.webm');
        formData.append('expectedText', currentQ.word);
        if (browserTranscript) {
          formData.append('browserTranscript', browserTranscript);
        }
        console.log("Sending assessment voice request with browserTranscript:", browserTranscript);

        const res = await fetch('http://localhost:5000/api/assessment/voice', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await res.json();
        
        if (res.ok) {
          const isGood = data.scores.pronunciation >= 70;
          setFeedback({
            isCorrect: isGood,
            text: `Score: ${data.scores.pronunciation}/100. ${data.scores.feedback || ''}`
          });
          setResults([...results, { id: currentQ.id, isCorrect: isGood }]);
        } else {
          setFeedback({ isCorrect: false, text: 'Error analyzing audio.' });
        }
      } catch (err) {
        setFeedback({ isCorrect: false, text: 'Network error.' });
      }
      return;
    }

    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer.toLowerCase().trim() === currentQ.answer.toLowerCase().trim();
    
    setFeedback({
      isCorrect,
      text: isCorrect ? 'Excellent job! +10 Points' : `Not quite. ${currentQ.feedback}`
    });
    
    setResults([...results, { id: currentQ.id, type: currentQ.type, isCorrect }]);
  };

  const handleNext = async () => {
    setFeedback(null);
    setSelectedAnswer('');
    setAudioBlob(null);
    setBrowserTranscript('');
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const score = results.filter(r => r.isCorrect).length;
      setFinalScore(score);
      setIsComplete(true);
      setIsEvaluating(true);
      
      // Submit all results
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/assessment/submit', {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ results, lang: i18n.language, level: selectedLevel })
        });
        
        if (!response.ok) {
          throw new Error('API submission failed');
        }

        const data = await response.json();
        if (data.evaluation) {
          setAiEvaluation(data.evaluation);
        }
        if (data.insights) {
          setAiInsights(data.insights);
        }
        
        // Update local storage so user doesn't take assessment again
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          storedUser.has_completed_assessment = true;
          if (data.insights && data.insights.overall_level) {
            storedUser.proficiency_level = data.insights.overall_level;
          } else {
            storedUser.proficiency_level = selectedLevel;
          }
          localStorage.setItem('user', JSON.stringify(storedUser));
        } catch (e) {
          console.error(e);
        }

      } catch (err) {
        console.error(err);
        setAiEvaluation('There was an error saving your assessment due to high server load. Please try again later.');
      } finally {
        setIsEvaluating(false);
      }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setFeedback(null);
      setSelectedAnswer('');
      setAudioBlob(null);
    }
  };

  const handleSkip = () => {
    const currentQ = questions[currentIndex];
    setFeedback({
      isCorrect: false,
      text: `Skipped. ${currentQ.feedback}`
    });
    setResults([...results, { id: currentQ.id, type: currentQ.type, isCorrect: false }]);
  };

  // --- MEDIA RECORDER LOGIC FOR NGROK STT ---
  const startRecording = async () => {
    try {
      setBrowserTranscript('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Start Browser Speech Recognition for instant STT evaluation
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        let recLang = 'hi';
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          recLang = storedUser.preferred_language || 'hi';
        } catch (e) {}
        const LANG_REC_MAP = { hi: 'hi-IN', ur: 'ur-PK', mwr: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', mr: 'mr-IN', en: 'en-US' };
        recognition.lang = LANG_REC_MAP[recLang] || 'en-US';
        
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          console.log("Local browser SpeechRecognition transcript:", transcript);
          setBrowserTranscript(transcript);
        };
        recognition.onerror = (e) => {
          console.error("Local SpeechRecognition error:", e);
        };
        recognition.start();
        recognitionRef.current = recognition;
      }

      // --- Silence Detection ---
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      const scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);

      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 1024;
      microphone.connect(analyser);
      analyser.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      let silenceStart = performance.now();
      let hasSpoken = false;

      scriptProcessor.onaudioprocess = () => {
        if (mediaRecorder.state !== 'recording') return;
        
        const array = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(array);
        
        let sum = 0;
        for (let i = 0; i < array.length; i++) {
          sum += array[i];
        }
        const average = sum / array.length;

        // Threshold for speaking
        if (average > 10) {
          hasSpoken = true;
          silenceStart = performance.now();
        } else if (hasSpoken) {
          // If silent for 1.0 seconds after speaking, stop recording
          if (performance.now() - silenceStart > 1000) {
            stopRecording();
            scriptProcessor.disconnect();
            microphone.disconnect();
          }
        }
      };

    } catch (err) {
      console.error("Microphone error", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }
  };

  if (loading) {
    return <div className="assessment-container"><Loader className="spin" size={48} color="#4285F4"/></div>;
  }

  if (!questions || questions.length === 0) {
    return <div className="assessment-container">{t('assessment_failed_load')}</div>;
  }

  if (isComplete) {
    return (
      <div className="assessment-container bg-default">
        <div 
          className="assessment-card engine-card evaluation-card" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: '300px 1fr', 
            gap: '2rem', 
            width: '90vw', 
            maxWidth: '1200px', 
            maxHeight: '92vh', 
            overflow: 'hidden', 
            padding: '2rem', 
            height: 'auto',
            textAlign: 'left'
          }}
        >
          {/* Left Column: Score, badge, continue button */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderRight: '1px solid #e2e8f0', paddingRight: '2rem' }}>
            <div>
              <div className="a-orb-container small mb-4" style={{ margin: '0 0 1rem 0', width: '50px', height: '50px' }}>
                <div className={`ai-orb ${isEvaluating ? 'pulsing' : ''}`} style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, #4285f4, #8b5cf6)', animation: 'pulse-orb 2s infinite alternate' }}></div>
              </div>
              
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1f2937', marginBottom: '0.5rem', lineHeight: 1.2 }}>
                {t('assessment_complete')}
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '2rem' }}>
                {t('assessment_final_eval')}
              </p>
              
              <div className="evaluation-score" style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', textAlign: 'center' }}>
                <div className="score-circle" style={{ 
                  width: '90px', height: '90px', borderRadius: '50%', 
                  background: '#e8f0fe', color: '#1A73E8', fontSize: '2rem', 
                  fontWeight: '800', display: 'flex', alignItems: 'center', 
                  justifyContent: 'center', margin: '0 auto 0.75rem' 
                }}>
                  {finalScore}/{questions.length}
                </div>
                <h3 style={{ color: '#10b981', margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>
                  {t('assessment_xp_earned', { xp: finalScore * 10 })}
                </h3>
              </div>
            </div>

            <div style={{ paddingTop: '1.5rem' }}>
              <button 
                className="check-btn natural" 
                onClick={() => navigate('/dashboard')} 
                disabled={isEvaluating} 
                style={{ margin: 0, width: '100%' }}
              >
                {t('assessment_continue_dash')}
              </button>
            </div>
          </div>

          {/* Right Column: AI Feedback and Recommendations */}
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', margin: '0 0 1rem 0' }}>
                AI Analysis & Recommended Track
              </h3>
              
              <div style={{ padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {isEvaluating ? (
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flex: 1, minHeight: '200px' }}>
                    <Loader className="spin" size={36} color="#8b5cf6" style={{ marginBottom: '1rem' }} />
                    <span style={{ color: '#8b5cf6', fontWeight: '600' }}>AI is analyzing your performance...</span>
                  </div>
                ) : (
                  <>
                    <div style={{ fontStyle: 'italic', color: '#334155', lineHeight: '1.6', fontSize: '1.05rem', borderLeft: '4px solid #8b5cf6', paddingLeft: '1rem' }}>
                      "{aiEvaluation || (finalScore > (questions.length * 0.7) ? t('assessment_feedback_excellent') : 
                       finalScore > (questions.length * 0.4) ? t('assessment_feedback_good') : 
                       t('assessment_feedback_keep_practicing'))}"
                    </div>
                    
                    {aiInsights && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: 'auto' }}>
                        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', minHeight: '140px' }}>
                          <h4 style={{ color: '#16a34a', marginTop: 0, marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: '700' }}>💪 Strengths</h4>
                          <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#374151', fontSize: '0.85rem', lineHeight: '1.4' }}>
                            {aiInsights.strengths?.slice(0, 3).map((item, i) => <li key={i} style={{ marginBottom: '0.2rem' }}>{item}</li>)}
                          </ul>
                        </div>
                        
                        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', minHeight: '140px' }}>
                          <h4 style={{ color: '#dc2626', marginTop: 0, marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: '700' }}>📈 Weaknesses</h4>
                          <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#374151', fontSize: '0.85rem', lineHeight: '1.4' }}>
                            {aiInsights.weaknesses?.slice(0, 3).map((item, i) => <li key={i} style={{ marginBottom: '0.2rem' }}>{item}</li>)}
                          </ul>
                        </div>

                        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', minHeight: '140px' }}>
                          <h4 style={{ color: '#d97706', marginTop: 0, marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: '700' }}>🎯 Recommended Focus</h4>
                          <div style={{ color: '#374151', fontSize: '1rem', fontWeight: '700', textTransform: 'capitalize', marginTop: '0.25rem', background: '#fef3c7', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                            {aiInsights.recommended_focus}
                          </div>
                        </div>

                        <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', minHeight: '140px' }}>
                          <h4 style={{ color: '#2563eb', marginTop: 0, marginBottom: '0.5rem', fontSize: '0.95rem', fontWeight: '700' }}>🚀 Improvements</h4>
                          <ul style={{ margin: 0, paddingLeft: '1.1rem', color: '#374151', fontSize: '0.85rem', lineHeight: '1.4' }}>
                            {aiInsights.improvements?.slice(0, 3).map((item, i) => <li key={i} style={{ marginBottom: '0.2rem' }}>{item}</li>)}
                          </ul>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  
  const getBgClass = () => {
    switch(currentQ.type) {
      case 'MCQ': return 'bg-mcq';
      case 'Reading': return 'bg-reading';
      case 'Writing': return 'bg-writing';
      case 'Listening': return 'bg-listening';
      case 'Grammar': return 'bg-grammar';
      case 'Puzzle': return 'bg-puzzle';
      default: return 'bg-default';
    }
  };

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
    <div className="q-reading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '0.75rem' }}>
      <div className="flashcard large">{currentQ.word}</div>
      <div className="a-controls mt-4" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {!isRecording ? (
          <button className="mic-btn record" onClick={startRecording} disabled={feedback !== null}>
            <Mic size={32} color="#fff" />
          </button>
        ) : (
          <button className="mic-btn stop" onClick={stopRecording}>
            <Square size={24} color="#fff" fill="#fff" />
          </button>
        )}
        <div className="recording-status">
          {isRecording ? "Listening... (Click the square button to stop)" : (audioBlob ? t('assessment_recording_saved') : t('assessment_tap_record'))}
        </div>
      </div>
    </div>
  );

  const renderWriting = () => (
    <div className="q-writing">
      <button className="play-audio-btn" onClick={() => playTTS(currentQ.text)}>
        <Volume2 size={40} color="#4285F4" />
      </button>
      <p className="hint-text">{t('assessment_hint_listen_type')}</p>
      <textarea 
        className="text-input" 
        rows={2}
        placeholder={t('assessment_placeholder_type')}
        value={selectedAnswer}
        onChange={(e) => setSelectedAnswer(e.target.value)}
        disabled={feedback !== null}
        style={{ height: 'auto', minHeight: '72px', resize: 'none' }}
      />
    </div>
  );

  const renderListening = () => (
    <div className="q-listening">
      <button className="play-audio-btn" onClick={() => playTTS(currentQ.audioText)}>
        <Volume2 size={40} color="#4285F4" />
      </button>
      <p className="hint-text">{t('assessment_hint_click_listen')}</p>
      <input 
        type="text" 
        className="text-input" 
        placeholder={t('assessment_placeholder_hear')}
        value={selectedAnswer}
        onChange={(e) => setSelectedAnswer(e.target.value)}
        disabled={feedback !== null}
      />
    </div>
  );

  const renderPuzzle = () => {
    return (
      <div className="q-puzzle">
        <div className="puzzle-dropzone">
          {selectedAnswer || t('assessment_build_sentence')}
        </div>
        <div className="puzzle-words">
          {currentQ.words.map(w => (
            <button 
              key={w} 
              className="puzzle-piece"
              onClick={() => setSelectedAnswer(prev => prev ? prev + ' ' + w : w)}
              disabled={feedback !== null || selectedAnswer.includes(w)}
            >
              {w}
            </button>
          ))}
        </div>
        <button className="clear-btn" onClick={() => setSelectedAnswer('')} disabled={feedback !== null}>{t('assessment_clear')}</button>
      </div>
    );
  };

  return (
    <div className={`assessment-container ${getBgClass()}`}>
      <div className="assessment-card engine-card">
        
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
        </div>
        <div className="progress-text">{t('assessment_progress', { current: currentIndex + 1, total: questions.length })}</div>

        <h1 style={{ textAlign: 'center', margin: '0 0 1rem 0', fontSize: '1.8rem', fontWeight: 'bold', color: '#1e293b' }}>
          Assessment
        </h1>

        <div className="a-orb-container small">
          <div className="ai-orb pulsing"></div>
        </div>

        <div className="assessment-top-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
          <button 
            className="check-btn natural" 
            onClick={() => navigate('/dashboard')} 
            style={{ padding: '0.4rem 1rem', width: 'auto', margin: 0, fontSize: '0.9rem', flex: '0 0 auto' }}
          >
            Dashboard
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '0 0 auto' }}>
            <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 500 }}>Level:</span>
            <select 
              value={selectedLevel} 
              onChange={(e) => {
                const newLevel = e.target.value;
                setSelectedLevel(newLevel);
                setCurrentIndex(0);
                setResults([]);
                setIsComplete(false);
                setFeedback(null);
                setSelectedAnswer('');
                fetchQuestions(newLevel);
              }}
              style={{ 
                padding: '0.4rem 0.8rem', 
                borderRadius: '8px', 
                border: 'none',
                background: '#4285F4',
                fontSize: '0.9rem',
                fontWeight: 600,
                color: '#ffffff',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="Beginner" style={{ background: '#fff', color: '#333' }}>Beginner</option>
              <option value="Intermediate" style={{ background: '#fff', color: '#333' }}>Intermediate</option>
              <option value="Advanced" style={{ background: '#fff', color: '#333' }}>Advanced</option>
            </select>
          </div>
        </div>

        <div className="question-header">
          <span className="question-badge">{currentQ.type}</span>
          {/* Hide the text if it's a Writing question so they are forced to listen */}
          {currentQ.type !== 'Writing' && <h2>{currentQ.text}</h2>}
        </div>

        <div 
          className="question-body" 
          style={currentQ.type === 'Reading' ? { minHeight: 'unset', height: 'auto', alignItems: 'flex-start', justifyContent: 'center' } : {}}
        >
          {currentQ.type === 'MCQ' && renderMCQ()}
          {currentQ.type === 'Grammar' && renderMCQ()}
          {currentQ.type === 'Reading' && renderReading()}
          {currentQ.type === 'Writing' && renderWriting()}
          {currentQ.type === 'Listening' && renderListening()}
          {currentQ.type === 'Puzzle' && renderMCQ()}
        </div>
        {/* Action Button & Feedback */}
        <div className="action-area">
          {!feedback || feedback.text === 'Analyzing your pronunciation...' ? (
            <button 
              className="check-btn natural" 
              onClick={handleCheckAnswer}
              disabled={(currentQ.type === 'Reading' ? !audioBlob : !selectedAnswer) || (feedback && feedback.text === 'Analyzing your pronunciation...')}
            >
              {feedback && feedback.text === 'Analyzing your pronunciation...' ? 'Analyzing...' : t('assessment_check_answer')}
            </button>
          ) : (
            <button className="next-btn natural" onClick={handleNext}>
              {currentIndex === questions.length - 1 ? t('assessment_complete_btn') : t('assessment_next_btn')}
            </button>
          )}

          <div className="nav-controls natural">
            <button className="btn-back" onClick={handleBack} disabled={currentIndex === 0}>{t('assessment_back')}</button>
            <button className="btn-skip" onClick={handleSkip} disabled={feedback !== null}>{t('assessment_skip')}</button>
          </div>
          
          {feedback && feedback.text !== 'Analyzing your pronunciation...' && (
            <div className={`inline-feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
              <div className="inline-feedback-icon">
                {feedback.isCorrect ? <CheckCircle size={20} /> : <XCircle size={20} />}
              </div>
              <div className="inline-feedback-text">
                <strong>{feedback.isCorrect ? 'Correct!' : 'Incorrect.'}</strong> {feedback.text}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AssessmentPage;
