import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config/api';

export function useLesson(id, propLessonId, onClose) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || 'hi';

  const [lessonData, setLessonData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  
  const [lessonComplete, setLessonComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [xpEarned, setXpEarned] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);

  // Practice selection states
  const [selectedPracticeMode, setSelectedPracticeMode] = useState(null);
  const [skillScores, setSkillScores] = useState(null);

  // Gamification States
  const [hearts, setHearts] = useState(5);
  const [streak, setStreak] = useState(0);
  const [coins, setCoins] = useState(10); 
  const [showHint, setShowHint] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [shakeHeart, setShakeHeart] = useState(false);

  const fetchLessonData = async () => {
    setLoading(true);
    setLessonComplete(false);
    setCurrentIdx(0);
    setHearts(5);
    setStreak(0);
    setIsGameOver(false);
    setSelectedPracticeMode(null);
    let learningLang = 'hi';
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      learningLang = storedUser.learning_language || 'hi';
    } catch (e) {}

    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/register');
      
      const res = await fetch(`${API_BASE_URL}/api/learning/${id}?lang=${learningLang}&interfaceLang=${i18n.language}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const json = await res.json();
        setLessonData(json);
        
        if (id === 'practice') {
          try {
            const dashRes = await fetch(`${API_BASE_URL}/api/dashboard/data`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (dashRes.ok) {
              const dashJson = await dashRes.json();
              setSkillScores(dashJson.skillAnalysis || { reading: 65, writing: 40, speaking: 55, listening: 70, vocabulary: 50 });
            }
          } catch (e) {
            console.error('Error fetching dashboard skill analysis in practice:', e);
          }
        }
        
        setLoading(false);
      } else {
        if (onClose) onClose(); else navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
      if (onClose) onClose(); else navigate('/dashboard');
    }
  };

  useEffect(() => {
    fetchLessonData();
  }, [id]);

  const startPracticeMode = (mode) => {
    setSelectedPracticeMode(mode);
    if (!lessonData || !lessonData.activities) return;

    let filtered = [];
    if (mode === 'reading') {
      filtered = lessonData.activities.filter(a => a.type === 'MCQ' || a.type === 'Reading');
    } else if (mode === 'writing') {
      filtered = lessonData.activities.filter(a => a.type === 'Writing' || a.type === 'Puzzle');
    } else if (mode === 'speaking') {
      filtered = lessonData.activities.filter(a => a.type === 'Reading');
    } else if (mode === 'listening') {
      filtered = lessonData.activities.filter(a => a.type === 'Listening');
    } else if (mode === 'mixed') {
      let lowest = 'reading';
      let lowestVal = 100;
      if (skillScores) {
        Object.entries(skillScores).forEach(([k, v]) => {
          if (v < lowestVal) {
            lowestVal = v;
            lowest = k;
          }
        });
      }
      let typeMatch = 'MCQ';
      if (lowest === 'writing') typeMatch = 'Writing';
      if (lowest === 'speaking') typeMatch = 'Reading';
      if (lowest === 'listening') typeMatch = 'Listening';

      const matched = lessonData.activities.filter(a => a.type === typeMatch || (typeMatch === 'Writing' && a.type === 'Puzzle'));
      const others = lessonData.activities.filter(a => !(a.type === typeMatch || (typeMatch === 'Writing' && a.type === 'Puzzle')));
      filtered = [...matched.slice(0, 5), ...others.slice(0, 5)];
    }

    if (filtered.length < 8) {
      const rest = lessonData.activities.filter(a => !filtered.includes(a));
      filtered = [...filtered, ...rest];
    }

    const finalActivities = filtered.slice(0, 8);
    const DIFFICULTY_ORDER = { MCQ: 1, Listening: 2, Reading: 3, Puzzle: 4, Writing: 5 };
    finalActivities.sort((a, b) => (DIFFICULTY_ORDER[a.type] || 3) - (DIFFICULTY_ORDER[b.type] || 3));

    setLessonData(prev => ({
      ...prev,
      activities: finalActivities
    }));
  };

  const completeLesson = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/learning/${id}/complete`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.error(err);
    }
    return null;
  };

  return {
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
  };
}
