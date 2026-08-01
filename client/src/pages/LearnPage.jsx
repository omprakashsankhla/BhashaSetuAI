import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, Coins, User, Settings, Award, BookOpen, Lock, Check, Play, LogOut, Heart, Mic, Gamepad2, Edit3, BarChart2, Medal, ArrowRight, Home, Target, Bot, Globe, Bell, Menu, X } from 'lucide-react';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar - Reused from Dashboard style */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <h2>BhashaSetu</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item" onClick={() => { navigate('/dashboard'); setSidebarOpen(false); }}><Home size={20} /> <span>{t('dash_nav_home', 'Home')}</span></button>
          <button className="nav-item active" onClick={() => setSidebarOpen(false)}><BookOpen size={20} /> <span>{t('dash_nav_learn', 'Learn')}</span></button>
          <button className="nav-item" onClick={() => { navigate('/activities'); setSidebarOpen(false); }}><Target size={20} /> <span>{t('dash_nav_activities', 'Activities')}</span></button>
          <button className="nav-item" onClick={() => { navigate('/games'); setSidebarOpen(false); }}><Gamepad2 size={20} /> <span>{t('dash_nav_games', 'Games')}</span></button>
          <button className="nav-item" onClick={() => { navigate('/lesson/practice'); setSidebarOpen(false); }}><Edit3 size={20} /> <span>{t('dash_nav_practice', 'Practice')}</span></button>
          <button className="nav-item" onClick={() => { setShowLeaderboard(true); setSidebarOpen(false); }}><Award size={20} /> <span>{t('dash_nav_leaderboard', 'Leaderboard')}</span></button>
          <button className="nav-item" onClick={() => { setShowProgress(true); setSidebarOpen(false); }}><BarChart2 size={20} /> <span>{t('dash_nav_progress', 'Progress')}</span></button>
          <button className="nav-item" onClick={() => { setShowProfile(true); setSidebarOpen(false); }}><User size={20} /> <span>{t('dash_nav_profile', 'Profile')}</span></button>
          <button className="nav-item" onClick={() => { setShowSettings(true); setSidebarOpen(false); }}><Settings size={20} /> <span>{t('dash_nav_settings', 'Settings')}</span></button>
          
          <button className="nav-item logout" onClick={handleLogout} style={{ marginTop: 'auto' }}>
            <LogOut size={20} /> <span>{t('dash_nav_logout', 'Logout')}</span>
          </button>
        </nav>
      </aside>

      <div className="dashboard-workspace learn-workspace">
        
        {/* Top Header */}
        <header className="dashboard-header">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="welcome-text">
            <h1>{t('dash_learning_journey', 'Learning Journey')}</h1>
            <p>{t('dash_day_of', { current: dayNumber || 1, total: 30 })}</p>
          </div>

          <div className="header-actions">
            <div className="lang-switcher">
              <Globe size={16} />
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
            
            <div className="notification-bell clickable" onClick={() => setShowAnnouncements(true)}>
              <Bell size={24} />
              {data.announcements && data.announcements.length > 0 && (
                <span className="badge">{data.announcements.length}</span>
              )}
            </div>
            <div className="avatar-circle clickable" onClick={() => setShowProfile(true)}>
              {user?.avatar && user.avatar !== '/default-avatar.png' ? (
                <img src={user.avatar} alt="Profile" />
              ) : (
                user?.name ? user.name.charAt(0).toUpperCase() : 'U'
              )}
            </div>
          </div>
        </header>

        <main className="learn-map-container">
          {/* Proficiency Track Selector */}
          <div className="track-selector">
            {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setActiveTab(lvl)}
                className={`track-btn ${activeTab === lvl ? 'active' : ''}`}
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
