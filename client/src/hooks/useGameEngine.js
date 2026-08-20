import { useState } from 'react';
import { API_BASE_URL } from '../config/api';

export function useGameEngine(gameType) {
  const [sessionScore, setSessionScore] = useState(null);

  const handleGameComplete = (score) => {
    setSessionScore(score);
    
    const progressStr = localStorage.getItem('games_progress') || '{}';
    try {
      const prog = JSON.parse(progressStr);
      prog[gameType] = true;
      
      const gameSequence = [
        'balloon-pop',
        'trace-letters',
        'sound-match',
        'fruit-catch',
        'pic-bingo',
        'memory-flip',
        'sentence-builder',
        'sign-reader',
        'shop-keeper',
        'crossword-clue',
        'tense-shift',
        'dialogue-puzzler',
        'word-sprint',
        'echo-chamber',
        'text-detective',
        'speed-editor',
        'debate-builder',
        'idiom-connect'
      ];
      
      const nextIdx = gameSequence.indexOf(gameType) + 1;
      if (nextIdx < gameSequence.length) {
        prog[gameSequence[nextIdx]] = true;
      }
      
      localStorage.setItem('games_progress', JSON.stringify(prog));
      
      let mappedSkill = 'vocabulary';
      if (['trace-letters', 'sentence-builder', 'tense-shift', 'speed-editor', 'idiom-connect'].includes(gameType)) mappedSkill = 'grammar';
      if (['sound-match', 'echo-chamber', 'dialogue-puzzler', 'debate-builder'].includes(gameType)) mappedSkill = 'listening';
      if (['sign-reader', 'text-detective'].includes(gameType)) mappedSkill = 'reading';

      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${API_BASE_URL}/api/learning/progress/skill`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ skill: mappedSkill, isCorrect: score >= 50, source: 'game' })
        }).catch(err => console.error('Skill progress update failed', err));

        fetch(`${API_BASE_URL}/api/dashboard/award-coins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ coins: Math.round(score / 5) })
        }).catch(err => console.error('Coin award failed', err));
      }
    } catch (e) {
      console.error('Error saving game progress', e);
    }
  };

  return {
    sessionScore,
    setSessionScore,
    handleGameComplete
  };
}
