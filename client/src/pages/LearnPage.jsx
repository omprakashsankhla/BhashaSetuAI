import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, Coins, User, Settings, Award, BookOpen, Lock, Check, Play, LogOut, Heart, Mic, Gamepad2, Edit3, BarChart2, Medal, ArrowRight, Home, Target, Bot, Globe, Bell } from 'lucide-react';
import ProfileModal from '../components/ProfileModal';
import SettingsModal from '../components/SettingsModal';
import LessonPage from './LessonPage';
import LeaderboardModal from '../components/LeaderboardModal';
import TutorModal from '../components/TutorModal';
import ProgressModal from '../components/ProgressModal';
import StreakModal from '../components/StreakModal';
import ShopModal from '../components/ShopModal';
import AnnouncementsModal from '../components/AnnouncementsModal';
import './Dashboard.css';
import './LearnPage.css';

const LearnPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/register');
        return;
      }
      
      const res = await fetch(`http://localhost:5000/api/dashboard/data?interfaceLang=${i18n.language || 'en'}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (!activeTab) {
          setActiveTab(json.user?.proficiency_level || 'Beginner');
        }
      } else {
        navigate('/register');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/register');
  };

  if (!data) return <div className="loading-dashboard">{t('dash_loading')}</div>;

  const { unitProgress, dayNumber, user, stats, rank } = data;
  const currentUnitProgress = activeTab && unitProgress ? unitProgress[activeTab] || [] : [];

  return (
    <div className="dashboard-layout">
      {/* Sidebar - Reused from Dashboard style */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>BhashaSetu</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => navigate('/dashboard')}><Home size={20} /> <span>{t('dash_nav_home', 'Home')}</span></button>
          <button className="nav-item active"><BookOpen size={20} /> <span>{t('dash_nav_learn', 'Learn')}</span></button>
          <button className="nav-item" onClick={() => navigate('/activities')}><Target size={20} /> <span>{t('dash_nav_activities', 'Activities')}</span></button>
          <button className="nav-item" onClick={() => navigate('/games')}><Gamepad2 size={20} /> <span>{t('dash_nav_games', 'Games')}</span></button>
          <button className="nav-item" onClick={() => navigate('/lesson/practice')}><Edit3 size={20} /> <span>{t('dash_nav_practice', 'Practice')}</span></button>
          <button className="nav-item" onClick={() => setShowLeaderboard(true)}><Award size={20} /> <span>{t('dash_nav_leaderboard', 'Leaderboard')}</span></button>
          <button className="nav-item" onClick={() => setShowProgress(true)}><BarChart2 size={20} /> <span>{t('dash_nav_progress', 'Progress')}</span></button>
          <button className="nav-item" onClick={() => setShowProfile(true)}><User size={20} /> <span>{t('dash_nav_profile', 'Profile')}</span></button>
          <button className="nav-item" onClick={() => setShowSettings(true)}><Settings size={20} /> <span>{t('dash_nav_settings', 'Settings')}</span></button>
          
          <button className="nav-item logout" onClick={handleLogout} style={{ marginTop: 'auto' }}>
            <LogOut size={20} /> <span>{t('dash_nav_logout', 'Logout')}</span>
          </button>
        </nav>
      </aside>

      <div className="dashboard-workspace learn-workspace">
        
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="welcome-text">
            <h1>{t('dash_learning_journey', 'Learning Journey')}</h1>
            <p>{t('dash_day_of', { current: dayNumber || 1, total: 30 })}</p>
          </div>

          <div className="header-lang-selectors" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Learning Language Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#f1f5f9', padding: '0.4rem 0.8rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <Globe size={16} color="#475569" />
              <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569' }}>{t('header_learn_lang', 'Learn')}:</span>
              <select 
                value={user?.preferred_language || 'hi'} 
                onChange={async (e) => {
                  const newLang = e.target.value;
                  try {
                    const token = localStorage.getItem('token');
                    await fetch('http://localhost:5000/api/profile', {
                      method: 'PUT',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ preferred_language: newLang })
                    });
                    const updatedUser = { ...user, preferred_language: newLang };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    fetchDashboardData();
                  } catch (err) {
                    console.error(err);
                  }
                }}
                style={{ border: 'none', background: 'transparent', fontWeight: '600', color: '#1e293b', cursor: 'pointer', outline: 'none', fontSize: '0.85rem' }}
              >
                <option value="en">English</option>
                <option value="hi">हिन्दी (Hindi)</option>
                <option value="mwr">मारवाड़ी (Marwadi)</option>
                <option value="ta">தமிழ் (Tamil)</option>
                <option value="te">తెలుగు (Telugu)</option>
                <option value="bn">বাংলা (Bengali)</option>
                <option value="mr">मराठी (Marathi)</option>
                <option value="ur">اردو (Urdu)</option>
              </select>
            </div>
          </div>
          
          <div className="header-stats">
            <div className="stat-item streak clickable" onClick={() => setShowStreakModal(true)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
              <Flame size={24} fill="#f97316" color="#f97316" />
              <span>{t('dash_day_streak', { count: stats.streak })}</span>
            </div>
            <div className="stat-item xp" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600' }}>
                <span style={{ color: '#eab308', fontSize: '1.2rem' }}>⭐</span>
                <span>XP : {stats.xp}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>🏆 {t('dash_rank', { rank: rank || 'Bronze Learner' })}</span>
            </div>
            <div className="stat-item coins clickable" onClick={() => setShowShopModal(true)} style={{ cursor: 'pointer', transition: 'transform 0.2s' }}>
              <Coins size={24} fill="#eab308" color="#eab308" />
              <span>{stats.coins}</span>
            </div>
            <div className="stat-item clickable" onClick={() => setShowAnnouncements(true)} style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Bell size={24} color="#64748b" />
              {data.announcements && data.announcements.length > 0 && (
                <span style={{
                  position: 'absolute', top: '-5px', right: '-5px',
                  background: '#ef4444', color: 'white', borderRadius: '50%',
                  width: '16px', height: '16px', fontSize: '0.65rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                }}>
                  {data.announcements.length}
                </span>
              )}
            </div>
            <div className="avatar-circle clickable" onClick={() => setShowProfile(true)} style={{ cursor: 'pointer', transition: 'transform 0.2s', padding: (user?.avatar && user.avatar !== '/default-avatar.png') ? 0 : '', overflow: 'hidden' }}>
              {user?.avatar && user.avatar !== '/default-avatar.png' ? (
                <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                user.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </header>

        <main className="learn-map-container">
          {/* Proficiency Track Selector */}
          <div className="track-selector" style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', background: '#f1f5f9', padding: '0.5rem', borderRadius: '12px', maxWidth: '600px', margin: '0 auto 2rem auto' }}>
            {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setActiveTab(lvl)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  background: activeTab === lvl ? '#111827' : 'transparent',
                  color: activeTab === lvl ? '#fff' : '#64748b',
                  transition: 'all 0.2s'
                }}
              >
                {t(`dash_${lvl.toLowerCase()}`, lvl)}
              </button>
            ))}
          </div>

          <div className="learn-path">
            {currentUnitProgress.map((unit, idx) => (
              <div key={idx} className={`unit-section ${unit.status}`}>
                <div className="unit-header">
                  <h2>{unit.name}</h2>
                  <span className="unit-progress">
                    {t('dash_completed_of', { done: unit.completedLessons, total: unit.totalLessons })}
                  </span>
                </div>
                
                <div className="unit-nodes">
                  {unit.lessons.map((lesson, lIdx) => (
                    <div 
                      key={lIdx} 
                      className={`lesson-node ${lesson.status}`}
                      onClick={() => {
                        if(lesson.status !== 'locked' && lesson.id != null && lesson.id !== 0) {
                          setActiveLessonId(lesson.id);
                        }
                      }}
                    >
                      <div className="node-icon">
                        {lesson.status === 'completed' ? <Check size={24} color="white" /> 
                          : lesson.status === 'active' ? <Play size={24} fill="white" /> 
                          : <Lock size={20} color="#94a3b8" />}
                      </div>
                      <div className="node-label">{lesson.title}</div>
                      
                      {/* Connection line */}
                      {lIdx < unit.lessons.length - 1 && (
                        <div className="path-line"></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      <div 
        className="ai-tutor-fab"
        onClick={() => setShowTutor(true)}
      >
        <span style={{ fontWeight: '600', fontSize: '1.05rem', letterSpacing: '0.5px' }}>{t('dash_talk_with_me')}</span>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}>
          <Bot size={24} />
        </div>
      </div>

      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      {showTutor && <TutorModal onClose={() => setShowTutor(false)} />}
      {showProgress && <ProgressModal data={data} onClose={() => setShowProgress(false)} />}
      {showStreakModal && <StreakModal stats={stats} onClose={() => setShowStreakModal(false)} />}
      {showShopModal && <ShopModal stats={stats} fetchDashboardData={fetchDashboardData} onClose={() => setShowShopModal(false)} />}
      {showAnnouncements && <AnnouncementsModal announcements={data.announcements} onClose={() => setShowAnnouncements(false)} />}
      {activeLessonId && <LessonPage lessonId={activeLessonId} onClose={() => { setActiveLessonId(null); fetchDashboardData(); }} />}
    </div>
  );
};

export default LearnPage;
