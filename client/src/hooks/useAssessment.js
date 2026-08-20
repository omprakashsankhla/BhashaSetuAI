import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config/api';

export function useAssessment() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

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

  const [questions, setQuestions] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [feedback, setFeedback] = useState(null); 
  const [results, setResults] = useState([]);
  
  const [isComplete, setIsComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [aiEvaluation, setAiEvaluation] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchQuestions = async (level) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      let learningLang = 'hi';
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        learningLang = storedUser.learning_language || 'hi';
      } catch (e) { /* use default */ }

      const res = await fetch(`${API_BASE_URL}/api/assessment/generate?lang=${learningLang}&interfaceLang=${i18n.language}&level=${level}`, {
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
    const cached = localStorage.getItem('assessmentProgress');
    if (cached && !isRetake) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.questions && parsed.questions.length > 0) {
          // Check if cache matches current level and learning language
          let currentLang = 'hi';
          try {
            const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
            currentLang = storedUser.learning_language || 'hi';
          } catch (e) {}

          if (parsed.level === selectedLevel && parsed.lang === currentLang) {
            setQuestions(parsed.questions);
            setCurrentIndex(parsed.currentIndex || 0);
            setResults(parsed.results || []);
            setLoading(false);
            return;
          }
        }
      } catch(e) {
        console.error("Failed to parse cached assessment progress", e);
      }
    }

    fetchQuestions(selectedLevel);
  }, [navigate, selectedLevel]);

  // Auto-save progress
  useEffect(() => {
    if (isComplete) {
      localStorage.removeItem('assessmentProgress');
    } else if (questions && questions.length > 0) {
      let currentLang = 'hi';
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        currentLang = storedUser.learning_language || 'hi';
      } catch (e) {}

      localStorage.setItem('assessmentProgress', JSON.stringify({
        questions,
        currentIndex,
        results,
        level: selectedLevel,
        lang: currentLang
      }));
    }
  }, [questions, currentIndex, results, isComplete]);

  return {
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
    setLoading,
    fetchQuestions
  };
}
