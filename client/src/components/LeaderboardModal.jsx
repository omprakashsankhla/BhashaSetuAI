import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Award, Medal, Crown } from 'lucide-react';
import './LeaderboardModal.css';
import { API_BASE_URL } from '../config/api';

const LeaderboardModal = ({ onClose }) => {
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/dashboard/leaderboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
        setCurrentUser(data.currentUser || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Podium is top 3 of the list
  const podiumUsers = leaderboard.slice(0, 3);
  const listUsers = leaderboard.slice(3);

  // Reorder podium to [2, 1, 3] for display purposes
  const displayPodium = [];
  if (podiumUsers.length > 1) displayPodium.push(podiumUsers[1]); // 2nd place
  if (podiumUsers.length > 0) displayPodium.push(podiumUsers[0]); // 1st place
  if (podiumUsers.length > 2) displayPodium.push(podiumUsers[2]); // 3rd place

  if (loading) {
    return (
      <div className="leaderboard-modal-overlay">
        <div className="leaderboard-modal-content">
          <div className="loading-spinner">Loading Leaderboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="leaderboard-modal-overlay">
      <div className="leaderboard-modal-content">
        <header className="leaderboard-header">
          <div className="header-title">
            <Award size={28} className="header-icon" />
            <h1>{t('dash_nav_leaderboard', 'Leaderboard')}</h1>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </header>

        <div className="leaderboard-scroll-area">
          {/* Podium */}
          {displayPodium.length > 0 && (
            <div className="podium-container">
              {displayPodium.map((user) => {
                const isFirst = user.rank === 1;
                const isSecond = user.rank === 2;
                const isThird = user.rank === 3;
                
                return (
                  <div key={user.rank} className={`podium-step step-${user.rank} ${user.isCurrentUser ? 'current-user-podium' : ''}`}>
                    <div className="podium-avatar">
                      {isFirst && <Crown size={32} color="#f59e0b" className="crown-icon" />}
                      <div className="avatar-circle" style={{ padding: (user.avatar && user.avatar !== '/default-avatar.png') ? 0 : '', overflow: 'hidden' }}>
                        {user.avatar && user.avatar !== '/default-avatar.png' ? (
                          <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          user.name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                    <div className="podium-name">{user.name.split(' ')[0]}</div>
                    <div className="podium-xp">{user.xp} XP</div>
                    <div className="podium-base">
                      {user.rank}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* List */}
          <div className="leaderboard-list">
            {listUsers.map((user) => (
              <div key={user.rank} className={`list-item ${user.isCurrentUser ? 'current-user-item' : ''}`}>
                <div className="rank-number">{user.rank}</div>
                <div className="list-avatar" style={{ padding: (user.avatar && user.avatar !== '/default-avatar.png') ? 0 : '', overflow: 'hidden' }}>
                  {user.avatar && user.avatar !== '/default-avatar.png' ? (
                    <img src={user.avatar} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="list-name">{user.name}</div>
                <div className="list-xp">{user.xp} XP</div>
              </div>
            ))}
            
            {leaderboard.length === 0 && (
              <div className="empty-state">No users in leaderboard yet.</div>
            )}
          </div>
        </div>

        {/* Sticky Current User Bar (if not in visible list or always show for quick reference) */}
        {currentUser && (
          <div className="sticky-current-user">
            <div className="rank-number">{currentUser.rank}</div>
            <div className="list-avatar" style={{ padding: (currentUser.avatar && currentUser.avatar !== '/default-avatar.png') ? 0 : '', overflow: 'hidden' }}>
              {currentUser.avatar && currentUser.avatar !== '/default-avatar.png' ? (
                <img src={currentUser.avatar} alt={currentUser.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                currentUser.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="list-name">You ({currentUser.name})</div>
            <div className="list-xp">{currentUser.xp} XP</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardModal;
