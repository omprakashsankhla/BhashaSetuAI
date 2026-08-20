import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader, Heart, Flame, Lightbulb, CheckCircle, XCircle, X } from 'lucide-react';
import Confetti from 'react-confetti';
import './LessonPage.css';
import { API_BASE_URL } from '../config/api';
import { useLesson } from '../hooks/useLesson';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

import LessonHeader from '../components/lesson/LessonHeader';
import LessonContent from '../components/lesson/LessonContent';
import LessonProgress from '../components/lesson/LessonProgress';
import LessonAudio from '../components/lesson/LessonAudio';
import LessonNavigation from '../components/lesson/LessonNavigation';

const LessonPage = ({ lessonId: propLessonId, onClose }) => {
  const params = useParams();
  const id = propLessonId || params.id;

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'hi';

  const {
    lessonData,
    currentIdx,
    setCurrentIdx,
    selectedAnswer,
    setSelectedAnswer,
    isChecked,
    setIsChecked,
    isCorrect,
    setIsCorrect,
    feedbackText,
    setFeedbackText,
    lessonComplete,
    setLessonComplete,
    loading,
    xpEarned,
    setXpEarned,
    coinsEarned,
    setCoinsEarned,
    selectedPracticeMode,
    skillScores,
    hearts,
    setHearts,
    streak,
    setStreak,
    coins,
    setCoins,
    showHint,
    setShowHint,
    isGameOver,
    setIsGameOver,
    shakeHeart,
    setShakeHeart,
    fetchLessonData,
    startPracticeMode,
    completeLesson
  } = useLesson(id, propLessonId, onClose);

  const {
    isRecording,
    audioBlob,
    browserTranscript,
    startRecording,
    stopRecording,
    resetRecording
  } = useAudioRecorder();

  const playTTS = (textToSpeak, slow = false) => {
    try {
      if (!window.speechSynthesis) return;
      
      const isEnglish = /^[a-zA-Z0-9\s.,!?'"-]+$/.test(textToSpeak);
      let learningLang = 'hi';
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        learningLang = storedUser.learning_language || 'hi';
      } catch (e) {}

      const LANG_REC_MAP = { hi: 'hi-IN', ur: 'ur-PK', mwr: 'hi-IN', ta: 'ta-IN', te: 'te-IN', bn: 'bn-IN', mr: 'mr-IN', en: 'en-US' };
      const langCode = isEnglish ? 'en-US' : (LANG_REC_MAP[learningLang] || 'hi-IN');
      
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = langCode;
      utterance.rate = slow ? 0.5 : 0.85;
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

  const playSound = (type) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); 
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); 
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(250, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.log("Audio not supported");
    }
  };

  const handleCheck = async () => {
    const activity = lessonData.activities[currentIdx];
    let correct = false;
    let fbText = '';
    
    if (activity.type === 'Reading') {
      if (!audioBlob) {
        setIsCorrect(false);
        setFeedbackText(t('no_audio', 'No audio detected. Please try recording again.'));
        setIsChecked(true);
        return;
      }
      setIsChecked(true);
      setFeedbackText(t('analyzing_audio', 'Analyzing your pronunciation...')); 
      
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('audio', audioBlob, 'speech.webm');
        formData.append('expectedText', activity.word);
        if (browserTranscript) {
          formData.append('browserTranscript', browserTranscript);
        }

        const res = await fetch(`${API_BASE_URL}/api/assessment/voice`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });

        const data = await res.json();
        
        if (res.ok) {
          correct = data.scores.pronunciation >= 70;
          setIsCorrect(correct);
          fbText = `Score: ${data.scores.pronunciation}/100. ${data.scores.feedback || ''}`;
          setFeedbackText(fbText);
        } else {
          setIsCorrect(false);
          setFeedbackText(t('error_analyzing', 'Error analyzing audio.'));
        }
      } catch (err) {
        setIsCorrect(false);
        setFeedbackText(t('network_error', 'Network error.'));
      }
    } else {
      if (!selectedAnswer) return;

      correct = selectedAnswer.toLowerCase().trim() === activity.answer.toLowerCase().trim();
      fbText = correct ? t('excellent_job', 'Excellent job!') : `${t('not_quite', 'Not quite.')} ${activity.feedback || t('try_again', 'Try again next time.')}`;
      setIsCorrect(correct);
      setFeedbackText(fbText);
      setIsChecked(true);
    }

    try {
      const token = localStorage.getItem('token');
      fetch(`${API_BASE_URL}/api/learning/progress/skill`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ skill: activity.type, isCorrect: correct, source: 'lesson' })
      });
    } catch (e) {
      console.error('Error saving skill progress', e);
    }

    if (correct) {
      playSound('correct');
      setStreak(s => s + 1);
    } else {
      playSound('incorrect');
      setStreak(0);
      setShakeHeart(true);
      setTimeout(() => setShakeHeart(false), 500);
      if (hearts > 1) {
        setHearts(h => h - 1);
      } else {
        setHearts(0);
        setIsGameOver(true);
      }
    }
  };

  const handleNext = async () => {
    setIsChecked(false);
    setSelectedAnswer('');
    setIsCorrect(false);
    setFeedbackText('');
    setShowHint(false);
    resetRecording();
    
    if (currentIdx < lessonData.activities.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      const bonusXP = Math.floor(streak * 2); 
      const result = await completeLesson();
      if (result) {
        setXpEarned((result.xpEarned || 20) + bonusXP);
        setCoinsEarned(result.coinsEarned || 10);
      } else {
        setXpEarned(20 + bonusXP);
        setCoinsEarned(10);
      }
      setLessonComplete(true);
    }
  };

  useEffect(() => {
    if (lessonData && lessonData.activities && currentIdx < lessonData.activities.length) {
      const activity = lessonData.activities[currentIdx];
      if (activity.type === 'Listening' && activity.audioText) {
        playTTS(activity.audioText);
      }
    }
  }, [currentIdx, lessonData]);

  if (loading) return <div className="lesson-container"><Loader className="spin" size={48} color="#4285F4"/></div>;

  if (isGameOver) {
    return (
      <div className="lesson-container bg-writing">
        <div className="lesson-card engine-card">
          <h1>Out of Hearts! 💔</h1>
          <p>You made a few mistakes, but that's how we learn!</p>
          <div style={{ margin: '2rem 0' }}>
            <Heart size={64} fill="#ef4444" color="#ef4444" />
          </div>
          <button className="check-btn primary-btn" onClick={fetchLessonData}>Try Again</button>
          <Link to="/dashboard" className="check-btn natural" style={{ marginTop: '1rem', background: '#cbd5e1' }}>Return to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (lessonComplete) {
    const nextBtnText = id === 'practice' 
      ? (currentLang === 'hi' ? "अभ्यास लैब पर वापस जाएं" : currentLang === 'ta' ? "பயிற்சி கூடத்திற்குத் திரும்புக" : currentLang === 'te' ? "ప్రాక్టీస్ ల్యాబ్‌కు తిరిగి వెళ్ళు" : "Back to Practice Lab")
      : t('dash_next_lesson', 'Next Lesson (Dashboard)');

    const handleNextAction = () => {
      if (id === 'practice') {
        fetchLessonData();
      } else {
        if (onClose) onClose(); else navigate('/dashboard');
      }
    };

    return (
      <div className="lesson-container bg-mcq">
        <Confetti recycle={false} />
        <div className="lesson-card engine-card success-card" style={{ padding: '3rem 2rem', textAlign: 'center' }}>
          <CheckCircle size={64} color="#58cc02" style={{ margin: '0 auto 1rem auto' }} />
          <h1 style={{ fontSize: '2.2rem', color: '#1e293b', marginBottom: '0.5rem', fontWeight: 800 }}>Lesson Completed!</h1>
          <p style={{ color: '#64748b', fontSize: '1.1rem', marginBottom: '2.5rem' }}>You did an amazing job. Let's keep the momentum going!</p>
          
          <div style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
            <div style={{ background: '#f8fafc', padding: '1rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0', minWidth: '100px' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>XP Gained</span>
              <span style={{ fontSize: '1.8rem', color: '#3b82f6', fontWeight: 900 }}>+{xpEarned}</span>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem 2rem', borderRadius: '16px', border: '1px solid #e2e8f0', minWidth: '100px' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Coins</span>
              <span style={{ fontSize: '1.8rem', color: '#eab308', fontWeight: 900 }}>+{coinsEarned}</span>
            </div>
          </div>

          <button 
            className="check-btn primary-btn" 
            onClick={handleNextAction}
            style={{ width: '100%', maxWidth: '300px', margin: '0 auto' }}
          >
            {nextBtnText}
          </button>
        </div>
      </div>
    );
  }

  if (id === 'practice' && !selectedPracticeMode) {
    const modes = [
      { id: 'mixed', title: currentLang === 'hi' ? 'मिश्रित अभ्यास' : 'Mixed Practice', desc: currentLang === 'hi' ? 'आपकी कमजोरियों के आधार पर वैयक्तिकृत प्रश्न' : 'Personalized questions based on your weaknesses' },
      { id: 'reading', title: currentLang === 'hi' ? 'पढ़ना अभ्यास' : 'Reading Practice', desc: currentLang === 'hi' ? 'उच्चारण और पढ़ना कौशल सुधारें' : 'Improve pronunciation and reading skills' },
      { id: 'writing', title: currentLang === 'hi' ? 'लिखना अभ्यास' : 'Writing Practice', desc: currentLang === 'hi' ? 'वर्तनी और वाक्य संरचना कौशल' : 'Spelling and sentence structure skills' },
      { id: 'speaking', title: currentLang === 'hi' ? 'बोलना अभ्यास' : 'Speaking Practice', desc: currentLang === 'hi' ? 'मौखिक उच्चारण कौशल जांचें' : 'Check oral pronunciation skills' },
      { id: 'listening', title: currentLang === 'hi' ? 'सुनना अभ्यास' : 'Listening Practice', desc: currentLang === 'hi' ? 'श्रवण समझ कौशल सुधारें' : 'Improve auditory comprehension skills' }
    ];

    return (
      <div className="lesson-container bg-default">
        <div className="lesson-card engine-card practice-select-card" style={{ maxWidth: '600px', width: '90%', padding: '2rem' }}>
          <header style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center' }}>
            <button className="exit-btn" onClick={() => { if (onClose) onClose(); else navigate('/dashboard'); }} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
            <h2 style={{ flex: 1, margin: 0, fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>
              {currentLang === 'hi' ? 'अभ्यास लैब' : 'Practice Lab'}
            </h2>
          </header>
          
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>
            {t('practice_mode_desc', 'Choose a practice mode and sharpen your skills!')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxHeight: '55vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {modes.map(m => (
              <button 
                key={m.id} 
                className="practice-mode-option"
                onClick={() => startPracticeMode(m.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '1.25rem', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s', width: '100%' }}
              >
                <strong style={{ fontSize: '1.1rem', color: '#1e293b', marginBottom: '0.25rem' }}>{m.title}</strong>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>{m.desc}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activity = lessonData.activities[currentIdx];

  const getBgClass = () => {
    switch (activity.type) {
      case 'MCQ': return 'bg-mcq';
      case 'Reading': return 'bg-reading';
      case 'Writing': return 'bg-writing';
      case 'Listening': return 'bg-listening';
      case 'Puzzle': return 'bg-puzzle';
      default: return 'bg-default';
    }
  };

  return (
    <div className={`lesson-container ${getBgClass()}`}>
      <div className="lesson-card engine-card">
        
        <LessonHeader 
          title={id === 'practice' ? t('practice_title', 'Practice: {{mode}}', { mode: selectedPracticeMode?.toUpperCase() }) : t('lesson_number', 'Lesson: {{num}}', { num: lessonData?.lesson?.sequenceNumber || id })} 
          onClose={() => {
            if (id === 'practice') {
              fetchLessonData();
            } else {
              if (onClose) onClose(); else navigate('/dashboard');
            }
          }}
        />

        <div className="progress-stats-row">
          <div className="progress-bar-wrapper">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${((currentIdx + 1) / lessonData.activities.length) * 100}%` }}></div>
            </div>
            <span className="progress-text">{currentIdx + 1} / {lessonData.activities.length}</span>
          </div>

          <div className="stats-indicator">
            <div className="stat-item streak-wrap">
              <Flame size={20} color="#ff9600" fill="#ff9600" />
              <span>{streak}</span>
            </div>
            <div className={`stat-item hearts-wrap ${shakeHeart ? 'shake' : ''}`}>
              <Heart size={20} color="#ff4b4b" fill="#ff4b4b" />
              <span>{hearts}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', margin: '1rem 0' }}>
          <h2 style={{ fontSize: '1.5rem', color: '#1e293b', textAlign: 'left', margin: 0, fontWeight: '800', lineHeight: '1.3' }}>
            {activity.text}
          </h2>
          <button 
            className="hint-btn" 
            onClick={() => { if(coins > 0 && !showHint) { setCoins(c=>c-1); setShowHint(true); } }}
            style={{ background: '#fef3c7', color: '#d97706', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: coins > 0 ? 'pointer' : 'not-allowed', boxShadow: '0 4px 10px rgba(217, 119, 6, 0.2)' }}
            title={`Hint (Costs 1 Coin) - You have ${coins} coins`}
          >
            <Lightbulb size={24} fill={showHint ? '#d97706' : 'none'} />
          </button>
        </div>

        {showHint && (
          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1rem', borderRadius: '12px', color: '#b45309', marginBottom: '1.5rem', textAlign: 'left', fontSize: '1.0rem', fontWeight: '500' }}>
            💡 {t('hint', 'Hint')}: {activity.answer || activity.word || t('hint_default', 'Try to use the correct tense and gender based on context.')}
          </div>
        )}

        <div className="question-body">
          {activity.type === 'Reading' ? (
            <LessonAudio 
              word={activity.word}
              isRecording={isRecording}
              isChecked={isChecked}
              browserTranscript={browserTranscript}
              startRecording={startRecording}
              stopRecording={stopRecording}
              playTTS={playTTS}
            />
          ) : (
            <LessonContent 
              activity={activity}
              selectedAnswer={selectedAnswer}
              setSelectedAnswer={setSelectedAnswer}
              isChecked={isChecked}
              playTTS={playTTS}
            />
          )}
        </div>

        <LessonNavigation 
          isChecked={isChecked} 
          disabledCheck={(!selectedAnswer && activity.type !== 'Reading')}
          isRecording={isRecording} 
          feedbackText={feedbackText} 
          isLastActivity={currentIdx === lessonData.activities.length - 1} 
          handleCheck={handleCheck} 
          handleNext={handleNext} 
        />

        {isChecked && feedbackText !== t('analyzing_audio', 'Analyzing your pronunciation...') && (
          <div className={`feedback-box ${isCorrect ? 'correct' : 'incorrect'}`} style={{ padding: '1rem', borderRadius: '12px', marginTop: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: isCorrect ? '#d7ffb8' : '#ffdfe0', border: `2px solid ${isCorrect ? '#58cc02' : '#ea4335'}`, color: isCorrect ? '#2b7000' : '#ea4335' }}>
            {isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
            <div style={{ textAlign: 'left' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{isCorrect ? t('correct', 'Correct!') : t('incorrect', 'Incorrect')}</h3>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedbackText}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default LessonPage;
