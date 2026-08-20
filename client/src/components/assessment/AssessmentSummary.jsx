import React from 'react';
import { Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function AssessmentSummary({ 
  finalScore, 
  totalQuestions, 
  aiEvaluation, 
  aiInsights, 
  isEvaluating 
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <img src="/assessment_complete.png" alt="Assessment Complete" style={{ width: '100%', maxWidth: '240px', borderRadius: '16px', marginBottom: '1.5rem' }} />
            
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
                {finalScore}/{totalQuestions}
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
                    "{aiEvaluation || (finalScore > (totalQuestions * 0.7) ? t('assessment_feedback_excellent') : 
                     finalScore > (totalQuestions * 0.4) ? t('assessment_feedback_good') : 
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
