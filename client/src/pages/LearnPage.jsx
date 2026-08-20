import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, Coins, User, Settings, Award, BookOpen, Lock, Check, Play, LogOut, Heart, Mic, Gamepad2, Edit3, BarChart2, Medal, ArrowRight, Home, Target, Bot, Globe, Bell, Menu, X, Users, Palette, Calendar, Hash, Dog, Coffee, FileText, Type, Headphones } from 'lucide-react';
import ProfileModal from '../components/ProfileModal';
import SettingsModal from '../components/SettingsModal';
import LessonPage from './LessonPage';
import LeaderboardModal from '../components/LeaderboardModal';
import TutorModal from '../components/TutorModal';
import ProgressModal from '../components/ProgressModal';
import StreakModal from '../components/StreakModal';
import ShopModal from '../components/ShopModal';
import AnnouncementsModal from '../components/AnnouncementsModal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import './Dashboard.css';
import './LearnPage.css';
import { API_BASE_URL } from '../config/api';

const getThematicIcon = (title, type) => {
  const tStr = (title || '').toLowerCase();
  if (tStr.includes('family') || tStr.includes('people')) return <Users size={28} />;
  if (tStr.includes('color')) return <Palette size={28} />;
  if (tStr.includes('day') || tStr.includes('week') || tStr.includes('time')) return <Calendar size={28} />;
  if (tStr.includes('number')) return <Hash size={28} />;
  if (tStr.includes('animal')) return <Dog size={28} />;
  if (tStr.includes('food') || tStr.includes('drink')) return <Coffee size={28} />;
  
  if (type === 'Reading') return <BookOpen size={28} />;
  if (type === 'Listening') return <Headphones size={28} />;
  if (type === 'Writing') return <Edit3 size={28} />;
  if (type === 'Speaking') return <Mic size={28} />;
  if (type === 'Grammar') return <Type size={28} />;
  if (type === 'Vocabulary') return <FileText size={28} />;
  
  return <Target size={28} />;
};

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
      
      const res = await fetch(`${API_BASE_URL}/api/dashboard/data?interfaceLang=${i18n.language || 'en'}`, {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BookOpen size={28} style={{ color: 'var(--color-primary-500)' }} /> {t('dash_learning_journey', 'Learning Journey')}
            </h1>
          </div>

          <div className="header-actions">
            <div className="lang-switcher">
              <Globe size={16} />
              <select 
                aria-label="Learning Language"
                value={user?.learning_language || 'hi'} 
                onChange={async (e) => {
                  const newLang = e.target.value;
                  try {
                    const token = localStorage.getItem('token');
                    await fetch(`${API_BASE_URL}/api/profile`, {
                      method: 'PUT',
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ learning_language: newLang })
                    });
                    const updatedUser = { ...user, learning_language: newLang };
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
          <div className="track-selector" style={{ background: 'transparent', boxShadow: 'none', border: 'none', padding: 0, display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            {['Beginner', 'Intermediate', 'Advanced'].map(lvl => (
              <Button
                key={lvl}
                variant="primary"
                onClick={() => setActiveTab(lvl)}
                className={`track-btn track-btn-${lvl.toLowerCase()} ${activeTab === lvl ? 'active' : ''}`}
                style={{
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  flex: '0 1 auto'
                }}
              >
                {t(`dash_${lvl.toLowerCase()}`, lvl)}
              </Button>
            ))}
          </div>

          <div className="learn-path">
            {currentUnitProgress.map((unit, idx) => (
              <div key={idx} className={`unit-section ${unit.status}`}>
                <div className="unit-header">
                  <h2>{unit.name}</h2>
                  <Badge variant="success" className="unit-progress">
                    {t('dash_completed_of', { done: unit.completedLessons, total: unit.totalLessons })}
                  </Badge>
                </div>
                
                <div className="unit-nodes">
                  {unit.lessons.map((lesson, lIdx) => (
                    <div 
                      key={lIdx} 
                      className={`lesson-node ${lesson.status}`}
                    >
                      <div 
                        className="node-icon" 
                        tabIndex={0} 
                        role="button"
                        onClick={() => {
                          if(lesson.status !== 'locked' && lesson.id != null && lesson.id !== 0) {
                            setActiveLessonId(lesson.id);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if(lesson.status !== 'locked' && lesson.id != null && lesson.id !== 0) {
                              setActiveLessonId(lesson.id);
                            }
                          }
                        }}
                      >
                        {getThematicIcon(lesson.title, lesson.type)}
                        {lesson.status === 'completed' && (
                          <div className="node-badge completed"><Check size={14} strokeWidth={3} /></div>
                        )}
                        {lesson.status === 'locked' && (
                          <div className="node-badge locked"><Lock size={12} strokeWidth={3} /></div>
                        )}
                        {lesson.status === 'active' && (
                          <div className="node-badge active"><Play size={12} fill="currentColor" /></div>
                        )}
                      </div>
                      <div className="node-label">{lesson.title}</div>
                      
                      {/* Connection line SVG */}
                      {lIdx < unit.lessons.length - 1 && (() => {
                        const nextIdx = lIdx + 1;
                        const isNextLast = nextIdx === unit.lessons.length - 1;
                        
                        let startX = 50;
                        if (lIdx !== 0) {
                           startX = (lIdx + 1) % 2 === 0 ? 25 : 75;
                        }
                        
                        let endX = 50;
                        if (!isNextLast) {
                           endX = (nextIdx + 1) % 2 === 0 ? 25 : 75;
                        }

                        const d = `M ${startX} 0 C ${startX} 45, ${endX} 55, ${endX} 100`;

                        return (
                          <svg className="path-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <path 
                               d={d} 
                               stroke={lesson.status === 'completed' ? "#10b981" : "#e2e8f0"} 
                               strokeWidth="4" 
                               fill="none" 
                               vectorEffect="non-scaling-stroke"
                               strokeLinecap="round"
                            />
                          </svg>
                        );
                      })()}
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
