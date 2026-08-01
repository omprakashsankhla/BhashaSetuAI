import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, TrendingUp, Award, Target, BookOpen, Mic, Ear, PenTool, Hash, Activity } from 'lucide-react';
import './ProgressModal.css';

const ProgressModal = ({ data, onClose }) => {
  const { t } = useTranslation();

  if (!data) return null;

  const { skillAnalysis, stats, achievements, rank } = data;

  const skills = [
    { name: t('skill_reading', 'Reading'), value: skillAnalysis.reading, icon: <BookOpen size={18} />, color: '#3b82f6' },
    { name: t('skill_writing', 'Writing'), value: skillAnalysis.writing, icon: <PenTool size={18} />, color: '#8b5cf6' },
    { name: t('skill_speaking', 'Speaking'), value: skillAnalysis.speaking, icon: <Mic size={18} />, color: '#f59e0b' },
    { name: t('skill_listening', 'Listening'), value: skillAnalysis.listening, icon: <Ear size={18} />, color: '#10b981' },
    { name: t('skill_vocabulary', 'Vocabulary'), value: skillAnalysis.vocabulary, icon: <Hash size={18} />, color: '#ec4899' },
  ];

  return (
    <div className="progress-modal-overlay">
      <div className="progress-modal-content">
        <header className="progress-header">
          <h1>{t('progress_title', 'Progress & Achievements')}</h1>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </header>

        <div className="progress-scroll-area">
          <div className="progress-grid">
            
            {/* Quick Stats Summary */}
            <section className="progress-section">
              <h2 className="section-title"><Activity size={20} /> {t('progress_overall', 'Overall Performance')}</h2>
              <div className="progress-card">
                <div className="stats-grid-horizontal">
                  <div className="stat-box">
                    <span className="stat-label">{t('dash_xp', 'Total XP')}</span>
                    <span className="stat-value text-blue">{stats.xp}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">{t('dash_streak', 'Day Streak')}</span>
                    <span className="stat-value text-orange">{stats.streak}</span>
                  </div>
                  <div className="stat-box">
                    <span className="stat-label">{t('dash_rank', 'Current Rank')}</span>
                    <span className="stat-value text-purple">{rank}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Skill Analysis */}
            <section className="progress-section">
              <h2 className="section-title"><Target size={20} /> {t('progress_skills', 'Skill Proficiency')}</h2>
              <div className="progress-card">
                {skills.map((skill, idx) => (
                  <div key={idx} className="progress-item">
                    <div className="progress-info">
                      <h3 style={{ color: skill.color }}>
                        {skill.icon} {skill.name}
                      </h3>
                      <div className="skill-bar-container">
                        <div className="skill-bar-bg">
                          <div 
                            className="skill-bar-fill" 
                            style={{ width: `${skill.value}%`, backgroundColor: skill.color }}
                          ></div>
                        </div>
                        <span className="skill-percent">{skill.value}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Achievements Snippet */}
            <section className="progress-section">
              <h2 className="section-title"><Award size={20} /> {t('progress_achievements', 'Earned Achievements')}</h2>
              <div className="progress-card">
                {achievements && achievements.length > 0 ? (
                  <div className="achievements-grid">
                    {achievements.map((ach, idx) => (
                      <div key={idx} className="achievement-badge">
                        <span className="badge-icon">{ach.icon}</span>
                        <span className="badge-label">{ach.label}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0', margin: 0 }}>
                    {t('progress_no_achievements', "You haven't unlocked any achievements yet. Keep learning!")}
                  </p>
                )}
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressModal;
