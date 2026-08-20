import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Target, CheckCircle, XCircle, Loader } from 'lucide-react';
import './AssessmentPage.css';
import { API_BASE_URL } from '../config/api';
import { useAssessment } from '../hooks/useAssessment';
import { useAudioRecorder } from '../hooks/useAudioRecorder';

import QuestionCard from '../components/assessment/QuestionCard';
import AssessmentTimer from '../components/assessment/AssessmentTimer';
import AssessmentNavigation from '../components/assessment/AssessmentNavigation';
import AssessmentSummary from '../components/assessment/AssessmentSummary';

const AssessmentPage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const {
    selectedLevel,
    setSelectedLevel,
    questions,
    setQuestions,
    currentIndex,
    setCurrentIndex,
    selectedAnswer,
    setSelectedAnswer,
    feedback,
    setFeedback,
    results,
    setResults,
    isComplete,
    setIsComplete,
    finalScore,
    setFinalScore,
    aiEvaluation,
    setAiEvaluation,
    aiInsights,
    setAiInsights,
    isEvaluating,
    setIsEvaluating,
    loading,
    setLoading
  } = useAssessment();

  const {
    isRecording,
    audioBlob,
    browserTranscript,
    startRecording,
    stopRecording,
    resetRecording
  } = useAudioRecorder();

  const playTTS = (textToSpeak) => {
    try {
      if (!window.speechSynthesis) return;
      
      let learningLang = 'hi';
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        learningLang = storedUser.learning_language || 'hi';
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

  const handleCheckAnswer = async () => {
    const currentQ = questions[currentIndex];
    
    if (currentQ.type === 'Reading') {
      if (!audioBlob) return;
      setFeedback({ isCorrect: false, text: 'Analyzing your pronunciation...' });
      
      try {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('audio', audioBlob, 'speech.webm');
        formData.append('expectedText', currentQ.word);
        if (browserTranscript) {
          formData.append('browserTranscript', browserTranscript);
        }

        const response = await fetch(`${API_BASE_URL}/api/assessment/voice`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
        
        const data = await response.json();
        const isGood = response.ok && data.scores && data.scores.pronunciation >= 70;
        
        setFeedback({
          isCorrect: isGood,
          text: isGood ? 'Pronunciation looks correct! +10 Points' : `Keep practicing! Score: ${data.scores?.pronunciation || 0}/100. ${data.scores?.feedback || ''}`
        });
        setResults(prev => {
          const filtered = prev.filter(r => r.id !== currentQ.id);
          return [...filtered, { id: currentQ.id, isCorrect: isGood }];
        });
      } catch (err) {
        console.error(err);
        setFeedback({ isCorrect: false, text: 'Error analyzing pronunciation.' });
      }
      return;
    }

    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer.toLowerCase().trim() === currentQ.answer.toLowerCase().trim();
    
    setFeedback({
      isCorrect,
      text: isCorrect ? t('excellent_job', 'Excellent job! +10 Points') : `${t('not_quite', 'Not quite.')} ${currentQ.feedback}`
    });
    setResults(prev => {
      const filtered = prev.filter(r => r.id !== currentQ.id);
      return [...filtered, { id: currentQ.id, type: currentQ.type, isCorrect }];
    });
  };

  const handleNext = async () => {
    setFeedback(null);
    setSelectedAnswer('');
    resetRecording();
    
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const score = results.filter(r => r.isCorrect).length;
      setFinalScore(score);
      setIsComplete(true);
      setIsEvaluating(true);
      
      try {
        const token = localStorage.getItem('token');
        let learningLang = 'hi';
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          learningLang = storedUser.learning_language || 'hi';
        } catch (e) {}

        const response = await fetch(`${API_BASE_URL}/api/assessment/submit`, {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ results, lang: learningLang, interfaceLang: i18n.language, level: selectedLevel })
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
      resetRecording();
    }
  };

  const handleSkip = () => {
    const currentQ = questions[currentIndex];
    setFeedback({
      isCorrect: false,
      text: `Skipped. ${currentQ.feedback}`
    });
    setResults(prev => {
      const filtered = prev.filter(r => r.id !== currentQ.id);
      return [...filtered, { id: currentQ.id, type: currentQ.type, isCorrect: false }];
    });
  };

  useEffect(() => {
    if (questions && questions.length > 0 && currentIndex < questions.length) {
      let q = { ...questions[currentIndex] };
      if (q.type === 'Writing' && q.text === q.answer) {
        q.type = 'Listening';
        q.audioText = q.answer;
      }
      if (q.type === 'Listening' && q.audioText) {
        playTTS(q.audioText);
      }
    }
  }, [currentIndex, questions]);

  if (loading) {
    return <div className="assessment-container"><Loader className="spin" size={48} color="#4285F4"/></div>;
  }

  if (!questions || questions.length === 0) {
    return <div className="assessment-container">{t('assessment_failed_load')}</div>;
  }

  if (isComplete) {
    return (
      <AssessmentSummary 
        finalScore={finalScore}
        totalQuestions={questions.length}
        aiEvaluation={aiEvaluation}
        aiInsights={aiInsights}
        isEvaluating={isEvaluating}
      />
    );
  }

  const rawQ = questions ? questions[currentIndex] : null;
  let currentQ = null;
  if (rawQ) {
    currentQ = { ...rawQ };
    if (currentQ.type === 'Writing' && currentQ.text === currentQ.answer) {
      currentQ.type = 'Listening';
      currentQ.audioText = currentQ.answer;
      currentQ.text = t('assessment_listen_and_type', 'Listen and type what you hear');
    }
  }

  const getBgClass = () => {
    switch (currentQ.type) {
      case 'MCQ': return 'bg-mcq';
      case 'Reading': return 'bg-reading';
      case 'Writing': return 'bg-writing';
      case 'Listening': return 'bg-listening';
      case 'Puzzle': return 'bg-puzzle';
      default: return 'bg-default';
    }
  };

  return (
    <div className={`assessment-container ${getBgClass()}`}>
      <div className="assessment-card engine-card">
        
        <div className="progress-header">
          <div className="progress-bar-container">
            <div className="progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}></div>
          </div>
          <div className="progress-text">
            {t('assessment_question_progress', 'Question {{current}} of {{total}}').replace('{{current}}', currentIndex + 1).replace('{{total}}', questions.length)}
          </div>
        </div>

        <h1 className="assessment-title">{t('assessment', 'Assessment')}</h1>
        
        <div className="a-orb-container">
          <div className="ai-orb pulsing"></div>
        </div>

        <div className="assessment-header-actions">
          <button 
            className="dashboard-btn-pill" 
            onClick={() => navigate('/dashboard')} 
          >
            {t('dashboard_upper', 'DASHBOARD')}
          </button>
          
          <div className="level-select-pill-wrapper">
            <span>{t('level', 'Level')}:</span>
            <select 
              className="level-select-pill"
              aria-label="Select Assessment Level"
              value={selectedLevel} 
              onChange={(e) => {
                const newLevel = e.target.value;
                setSelectedLevel(newLevel);
                setCurrentIndex(0);
                setResults([]);
                setIsComplete(false);
                setFeedback(null);
              }}
            >
              <option value="Beginner">{t('beginner', 'Beginner')}</option>
              <option value="Intermediate">{t('intermediate', 'Intermediate')}</option>
              <option value="Advanced">{t('advanced', 'Advanced')}</option>
            </select>
          </div>
        </div>

        <div className="question-header" style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <span className="question-badge">{currentQ.type}</span>
          <h2 style={{ marginTop: '0.25rem' }}>{currentQ.text}</h2>
        </div>

        <div className="question-body">
          <QuestionCard 
            currentQ={currentQ}
            selectedAnswer={selectedAnswer}
            setSelectedAnswer={setSelectedAnswer}
            feedback={feedback}
            isRecording={isRecording}
            audioBlob={audioBlob}
            browserTranscript={browserTranscript}
            startRecording={startRecording}
            stopRecording={stopRecording}
            playTTS={playTTS}
          />
        </div>

        <AssessmentNavigation 
          feedback={feedback}
          currentQ={currentQ}
          audioBlob={audioBlob}
          selectedAnswer={selectedAnswer}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          handleCheckAnswer={handleCheckAnswer}
          handleNext={handleNext}
        />

        <div className="bottom-actions">
          <button className="action-btn-back" onClick={handleBack} disabled={currentIndex === 0 || feedback !== null}>
            {t('btn_back', 'Back')}
          </button>
          <button className="action-btn-skip" onClick={handleSkip} disabled={feedback !== null}>
            {t('btn_skip', 'Skip')}
          </button>
        </div>

        {feedback && feedback.text !== 'Analyzing your pronunciation...' && (
          <div className={`inline-feedback ${feedback.isCorrect ? 'correct' : 'incorrect'}`}>
            {feedback.isCorrect ? <CheckCircle size={24} /> : <XCircle size={24} />}
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{feedback.isCorrect ? t('correct', 'Correct!') : t('incorrect', 'Incorrect')}</h3>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>{feedback.text}</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AssessmentPage;
