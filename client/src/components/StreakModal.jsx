import React from 'react';
import { useTranslation } from 'react-i18next';
import { X, Flame, Calendar, Trophy } from 'lucide-react';

const StreakModal = ({ stats, onClose }) => {
  const { t } = useTranslation();

  return (
    <div className="progress-modal-overlay">
      <div className="progress-modal-content" style={{ maxWidth: '400px', height: 'auto' }}>
        <header className="progress-header" style={{ borderBottom: 'none', paddingBottom: '1rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame size={28} fill="#f97316" color="#f97316" /> {t('streak_title', 'Your Streak')}
          </h1>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </header>

        <div className="progress-scroll-area" style={{ paddingTop: '0' }}>
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '5rem', lineHeight: '1', marginBottom: '1rem' }}>🔥</div>
            <h2 style={{ fontSize: '2.5rem', margin: '0', color: '#f97316' }}>{stats.streak}</h2>
            <p style={{ fontSize: '1.2rem', color: '#64748b', margin: '0.5rem 0 2rem 0', fontWeight: '600' }}>
              {t('streak_days_in_a_row', 'Days in a row!')}
            </p>
            
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '16px', textAlign: 'left', border: '1px solid #e2e8f0' }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 0 1rem 0' }}>
                <Trophy size={20} color="#eab308" /> {t('streak_milestone', 'Next Milestone')}
              </h3>
              <p style={{ margin: '0', color: '#475569' }}>
                Reach a <strong>7-day streak</strong> to unlock a special Bronze Badge and earn 50 bonus coins! You're doing great!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreakModal;
