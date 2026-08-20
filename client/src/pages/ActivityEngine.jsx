import React, { useEffect, Suspense } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Award, Trophy, Play, CheckCircle2, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { GameRegistry } from './GameRegistry';
import './ActivityEngine.css';
import { API_BASE_URL } from '../config/api';
import { useGameEngine } from '../hooks/useGameEngine';

const SkeletonLoader = () => (
  <div style={{ background: '#f1f5f9', width: '100%', height: '400px', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'pulse 1.5s infinite ease-in-out' }}>
    <p style={{ color: '#94a3b8', fontWeight: 'bold' }}>Loading Activity...</p>
  </div>
);

const ActivityEngine = () => {
  const { gameType } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language || 'hi';
  const loc = {
    wellPlayed: t('game_engine.wellPlayed'),
    syncMsg: t('game_engine.syncMsg'),
    score: t('game_engine.score'),
    coins: t('game_engine.coins'),
    backBtn: t('game_engine.backBtn')
  };
  const pageTitle = t(`game_titles.${gameType}`, gameType.replace('-', ' '));
  
  const { sessionScore, handleGameComplete } = useGameEngine(gameType);

  const renderGame = () => {
    const GameComponent = GameRegistry[gameType];
    if (GameComponent) {
      return (
        <Suspense fallback={<SkeletonLoader />}>
          <GameComponent gameType={gameType} onGameComplete={handleGameComplete} />
        </Suspense>
      );
    }
    return <div className="game-placeholder">Unknown Game Sandbox</div>;
  };

  // TraceMaster has its own full-page layout
  if (gameType === 'trace-letters') {
    const TraceMasterComponent = GameRegistry['trace-letters'];
    return (
      <Suspense fallback={<SkeletonLoader />}>
        <TraceMasterComponent onGameComplete={handleGameComplete} />
      </Suspense>
    );
  }
  return (
    <div className="activity-container bg-default">
      <header className="activity-header">
        <button className="icon-btn" onClick={() => navigate('/games')}>
          <ArrowLeft size={24} />
        </button>
        <h2 style={{ textTransform: 'capitalize', fontWeight: 800 }}>
          {pageTitle}
        </h2>
        <div style={{ width: 24 }}></div>
      </header>

      <main className="activity-main" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        {sessionScore !== null ? (
          <div 
            style={{ 
              background: 'white', 
              borderRadius: '24px', 
              padding: '3rem', 
              textAlign: 'center', 
              boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0',
              maxWidth: '440px',
              width: '100%',
              boxSizing: 'border-box'
            }}
          >
            <Trophy size={64} color="#eab308" style={{ margin: '0 auto 1.5rem auto' }} />
            <h2 style={{ fontSize: '1.8rem', color: '#1e293b', margin: '0 0 0.5rem 0', fontWeight: 800 }}>{loc.wellPlayed}</h2>
            <p style={{ color: '#64748b', margin: '0 0 2rem 0' }}>{loc.syncMsg}</p>
            
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-around', marginBottom: '2rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', fontWeight: 700 }}>{loc.score}</span>
                <span style={{ fontSize: '1.6rem', color: '#2b58ff', fontWeight: 900 }}>{sessionScore}</span>
              </div>
              <div style={{ borderLeft: '1px solid #e2e8f0' }} />
              <div>
                <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'block', fontWeight: 700 }}>{loc.coins}</span>
                <span style={{ fontSize: '1.6rem', color: '#10b981', fontWeight: 900 }}>+{Math.round(sessionScore / 5)}</span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/games')} 
              style={{ width: '100%', background: '#2b58ff', color: 'white', border: 'none', padding: '0.8rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
            >
              {loc.backBtn}
            </button>
          </div>
        ) : (
          renderGame()
        )}
      </main>
    </div>
  );
};

export default ActivityEngine;
