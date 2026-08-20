import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, RefreshCw, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { TRACE_LETTERS, VOCAB_WORDS } from './traceMasterData';

const getTraceData = (lang) => TRACE_LETTERS[lang] || TRACE_LETTERS['hi'] || TRACE_LETTERS['en'];

const TraceMaster = ({ onGameComplete }) => {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const letters = getTraceData((JSON.parse(localStorage.getItem('user') || '{}').learning_language || 'hi'));

  const [currentIdx, setCurrentIdx] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [mastery, setMastery] = useState({}); // letter index -> 'traced' | 'pending'
  const [showVocab, setShowVocab] = useState(false); // show vocab card after passing

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const pointsRef = useRef([]);

  const currentLetter = letters[currentIdx];
  const masteredCount = Object.values(mastery).filter(v => v === 'traced').length;

  useEffect(() => {
    initCanvas();
  }, [currentIdx]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = 220;
    canvas.height = 220;

    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctxRef.current = ctx;

    ctx.clearRect(0, 0, 220, 220);
    ctx.font = '800 110px "Inter", sans-serif';
    ctx.fillStyle = '#f1f5f9';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 12;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeText(currentLetter.letter, 110, 110);
    ctx.fillText(currentLetter.letter, 110, 110);

    pointsRef.current = [];
    setAccuracy(null);
    setShowVocab(false);
  };

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const handleStart = (e) => {
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;
    setIsDrawing(true);
    const ctx = ctxRef.current;
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 8;
    pointsRef.current.push(coords);
  };

  const handleMove = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const coords = getCoordinates(e);
    if (!coords) return;
    const ctx = ctxRef.current;
    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
    pointsRef.current.push(coords);
  };

  const handleEnd = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    calculateAccuracy();
  };

  const calculateAccuracy = () => {
    const canvas = canvasRef.current;
    if (!canvas || pointsRef.current.length === 0) return;

    const testPoints = pointsRef.current;

    // --- Step 1: Create reference letter canvas ---
    const refCanvas = document.createElement('canvas');
    refCanvas.width = 220;
    refCanvas.height = 220;
    const refCtx = refCanvas.getContext('2d');
    refCtx.font = '800 110px "Inter", sans-serif';
    refCtx.textAlign = 'center';
    refCtx.textBaseline = 'middle';
    refCtx.fillText(currentLetter.letter, 110, 110);

    // Count total filled pixels on reference letter
    const refImgData = refCtx.getImageData(0, 0, 220, 220).data;
    let totalRefPixels = 0;
    for (let i = 3; i < refImgData.length; i += 4) {
      if (refImgData[i] > 50) totalRefPixels++;
    }

    // --- Step 2: Create user drawing canvas ---
    const userCanvas = document.createElement('canvas');
    userCanvas.width = 220;
    userCanvas.height = 220;
    const userCtx = userCanvas.getContext('2d');
    userCtx.lineCap = 'round';
    userCtx.lineJoin = 'round';
    userCtx.strokeStyle = '#000';
    userCtx.lineWidth = 8;
    if (testPoints.length > 0) {
      userCtx.beginPath();
      userCtx.moveTo(testPoints[0].x, testPoints[0].y);
      for (let i = 1; i < testPoints.length; i++) {
        userCtx.lineTo(testPoints[i].x, testPoints[i].y);
      }
      userCtx.stroke();
    }

    // --- Step 3: Precision — what % of user strokes land on the letter ---
    let precisionHits = 0;
    testPoints.forEach(p => {
      if (p.x >= 0 && p.x < 220 && p.y >= 0 && p.y < 220) {
        const px = refCtx.getImageData(Math.round(p.x), Math.round(p.y), 1, 1).data;
        if (px[3] > 50) precisionHits++;
      }
    });
    const precision = testPoints.length > 0 ? precisionHits / testPoints.length : 0;

    // --- Step 4: Coverage — what % of reference letter pixels are covered by user strokes ---
    const userImgData = userCtx.getImageData(0, 0, 220, 220).data;
    let coveredPixels = 0;
    for (let i = 0; i < refImgData.length; i += 4) {
      if (refImgData[i + 3] > 50 && userImgData[i + 3] > 50) {
        coveredPixels++;
      }
    }
    const coverage = totalRefPixels > 0 ? coveredPixels / totalRefPixels : 0;

    // --- Step 5: Combined accuracy (40% precision, 60% coverage) ---
    const combined = (precision * 0.4 + coverage * 0.6);
    const percent = Math.min(100, Math.round(combined * 100));
    setAccuracy(percent);

    if (percent >= 50) {
      setScore(prev => prev + percent);
      setMastery(prev => ({ ...prev, [currentIdx]: 'traced' }));
      setShowVocab(true);
    }
  };

  const handleNext = () => {
    if (currentIdx < letters.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setGameOver(true);
      if (onGameComplete) onGameComplete(score);
    }
  };

  const selectLetter = (idx) => {
    setCurrentIdx(idx);
  };

  // Get the vocabulary word for the current letter
  const getVocab = () => {
    const lang = (JSON.parse(localStorage.getItem('user') || '{}').learning_language || 'hi');
    const vocabMap = VOCAB_WORDS[lang] || VOCAB_WORDS['en'];
    return vocabMap[currentLetter.letter] || null;
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setScore(0);
    setMastery({});
    setShowVocab(false);
    setGameOver(false);
  };

  return (
    <div className="flashcards-container" style={{ background: '#f1f5f9', height: '100vh', overflow: 'hidden' }}>
      {/* Header */}
      <div className="flashcards-header sticky-header">
        <button className="icon-btn" onClick={() => navigate('/games')}>
          <ArrowLeft size={24} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Award size={20} color="#eab308" />
          <span style={{ fontWeight: 700, color: '#334155' }}>
            Traced: {masteredCount} / {letters.length}
          </span>
        </div>
        <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#1e293b', fontWeight: 800 }}>✍️ Trace Master</h2>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 72px)' }}>

        {/* Left Column: Alphabet Sidebar Selector */}
        <div style={{ width: '300px', borderRight: '1px solid #e2e8f0', background: 'white', display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9' }}>
            <h4 style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Alphabet List</h4>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
            {letters.map((item, idx) => {
              const status = mastery[idx] || 'pending';
              const isSelected = idx === currentIdx;

              let statusColor = '#94a3b8';
              let statusText = '●';
              if (status === 'traced') {
                statusColor = '#10b981';
                statusText = '✓';
              }

              return (
                <div
                  key={idx}
                  onClick={() => selectLetter(idx)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem', borderRadius: '12px', cursor: 'pointer', marginBottom: '0.4rem', transition: 'all 0.2s', background: isSelected ? '#fdf2f8' : 'transparent', border: isSelected ? '1px solid #fbcfe8' : '1px solid transparent' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: isSelected ? '#ec4899' : '#94a3b8', width: '24px' }}>
                      {idx + 1}
                    </span>
                    <div>
                      <div style={{ fontWeight: 800, color: isSelected ? '#be185d' : '#1e293b', fontSize: '1.2rem' }}>
                        {item.letter}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {item.name}
                      </div>
                    </div>
                  </div>
                  <span style={{ color: statusColor, fontWeight: 900, fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>
                    {statusText}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Static Centered Tracing Station */}
        {(() => {
          // Rotating color palette — changes with every letter
          const PALETTES = [
            { bg: 'linear-gradient(135deg, #fdf2f8, #fbcfe8)', border: '#fbcfe8', accent: '#be185d', badge: '#ec4899', canvasBorder: '#fbcfe8', resultBg: '#fdf2f8' },
            { bg: 'linear-gradient(135deg, #eff6ff, #bfdbfe)', border: '#bfdbfe', accent: '#1e40af', badge: '#3b82f6', canvasBorder: '#bfdbfe', resultBg: '#eff6ff' },
            { bg: 'linear-gradient(135deg, #ecfdf5, #a7f3d0)', border: '#a7f3d0', accent: '#065f46', badge: '#10b981', canvasBorder: '#a7f3d0', resultBg: '#ecfdf5' },
            { bg: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '#fde68a', accent: '#92400e', badge: '#f59e0b', canvasBorder: '#fde68a', resultBg: '#fef3c7' },
            { bg: 'linear-gradient(135deg, #ede9fe, #c4b5fd)', border: '#c4b5fd', accent: '#5b21b6', badge: '#8b5cf6', canvasBorder: '#c4b5fd', resultBg: '#ede9fe' },
            { bg: 'linear-gradient(135deg, #fce7f3, #f9a8d4)', border: '#f9a8d4', accent: '#9d174d', badge: '#ec4899', canvasBorder: '#f9a8d4', resultBg: '#fce7f3' },
            { bg: 'linear-gradient(135deg, #ecfeff, #a5f3fc)', border: '#a5f3fc', accent: '#155e75', badge: '#06b6d4', canvasBorder: '#a5f3fc', resultBg: '#ecfeff' },
            { bg: 'linear-gradient(135deg, #fff7ed, #fed7aa)', border: '#fed7aa', accent: '#9a3412', badge: '#f97316', canvasBorder: '#fed7aa', resultBg: '#fff7ed' },
            { bg: 'linear-gradient(135deg, #fef2f2, #fecaca)', border: '#fecaca', accent: '#991b1b', badge: '#ef4444', canvasBorder: '#fecaca', resultBg: '#fef2f2' },
            { bg: 'linear-gradient(135deg, #f0fdf4, #bbf7d0)', border: '#bbf7d0', accent: '#166534', badge: '#22c55e', canvasBorder: '#bbf7d0', resultBg: '#f0fdf4' },
          ];
          const pal = PALETTES[currentIdx % PALETTES.length];

          return (
            <div style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f1f5f9', padding: '1rem', overflowY: 'auto', height: '100%' }}>
              <div style={{ background: pal.bg, borderRadius: '20px', padding: '1.2rem 1.8rem', width: '100%', maxWidth: '480px', boxShadow: '0 8px 20px -5px rgba(0,0,0,0.08)', border: `2px solid ${pal.border}`, textAlign: 'center', position: 'relative', boxSizing: 'border-box', transition: 'background 0.4s ease, border-color 0.4s ease', margin: 'auto' }}>

                {gameOver ? (
                  <div style={{ padding: '2rem 0' }}>
                    <span style={{ fontSize: '3.5rem' }}>🏆</span>
                    <h2 style={{ color: pal.accent, fontSize: '1.6rem', margin: '0.8rem 0' }}>All Letters Traced!</h2>
                    <p style={{ color: '#64748b', marginBottom: '1.5rem', fontSize: '0.9rem' }}>You earned {score} accuracy points!</p>
                    <button onClick={handleRestart} style={{ background: pal.badge, color: 'white', border: 'none', padding: '0.7rem 1.5rem', borderRadius: '10px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      <RefreshCw size={14} /> Replay
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Header Badge */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span style={{ background: pal.badge, color: 'white', fontWeight: 700, padding: '0.25rem 0.7rem', borderRadius: '10px', fontSize: '0.75rem' }}>
                        Letter {currentIdx + 1} / {letters.length}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: pal.accent, fontWeight: 800, fontSize: '0.85rem' }}>
                        <Award size={14} /> Score: {score}
                      </div>
                    </div>

                    {/* Letter Name */}
                    <h1 style={{ fontSize: '1.8rem', color: pal.accent, margin: '0 0 0.2rem 0', fontWeight: 900, lineHeight: 1.1 }}>
                      {currentLetter.letter}
                    </h1>
                    <p style={{ margin: '0 0 0.6rem 0', color: '#64748b', fontSize: '0.8rem', fontWeight: 700 }}>
                      "{currentLetter.name}"
                    </p>

                    {/* Canvas */}
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '0.3rem 0 0.6rem 0' }}>
                      <canvas
                        ref={canvasRef}
                        onMouseDown={handleStart}
                        onMouseMove={handleMove}
                        onMouseUp={handleEnd}
                        onMouseLeave={handleEnd}
                        onTouchStart={handleStart}
                        onTouchMove={handleMove}
                        onTouchEnd={handleEnd}
                        style={{
                          background: 'white',
                          border: `2px solid ${pal.canvasBorder}`,
                          borderRadius: '16px',
                          cursor: 'crosshair',
                          touchAction: 'none',
                          boxShadow: '0 4px 10px rgba(0,0,0,0.03)'
                        }}
                      />
                    </div>

                    {/* Instruction */}
                    <p style={{ color: '#475569', fontSize: '0.78rem', maxWidth: '320px', margin: '0 auto 0.6rem auto', lineHeight: 1.4 }}>
                      💡 {currentLetter.instructions}
                    </p>

                    {/* Accuracy Result */}
                    {accuracy !== null && (
                      <div style={{ background: pal.resultBg, padding: '0.8rem 1rem', borderRadius: '12px', border: `1px solid ${pal.border}`, display: 'inline-block', minWidth: '240px', maxWidth: '380px', width: '100%', boxSizing: 'border-box' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                          <div>
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Accuracy: </span>
                            <span style={{ color: accuracy >= 50 ? '#10b981' : '#ef4444', fontSize: '1.2rem', fontWeight: 800 }}>
                              {accuracy}%
                            </span>
                          </div>
                        </div>

                        {/* Vocabulary Word Card — shown after passing */}
                        {showVocab && getVocab() && (
                          <div style={{ background: 'white', borderRadius: '8px', padding: '0.6rem 0.8rem', marginBottom: '0.5rem', textAlign: 'left', border: `1px solid ${pal.border}` }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.3rem' }}>
                              <span style={{ fontSize: '1.1rem' }}>📖</span>
                              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: pal.accent }}>{getVocab().word}</span>
                            </div>
                            <p style={{ margin: '0 0 0.3rem 0', fontSize: '0.78rem', color: '#475569', lineHeight: 1.3 }}>
                              <strong>Meaning:</strong> {getVocab().meaning}
                            </p>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', lineHeight: 1.3, fontStyle: 'italic', background: pal.resultBg, padding: '0.35rem 0.6rem', borderRadius: '6px' }}>
                              ✏️ {getVocab().example}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={accuracy >= 50 ? handleNext : initCanvas}
                          style={{ background: accuracy >= 50 ? pal.badge : '#64748b', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', width: '100%' }}
                        >
                          {accuracy >= 50 ? 'Continue to Next Letter →' : '🔄 Retry Tracing'}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default TraceMaster;
