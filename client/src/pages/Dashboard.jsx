import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, Coins, User, Settings, Award, BookOpen, Lock, Check, Play, LogOut, Heart, Mic, Gamepad2, Edit3, BarChart2, Medal, ArrowRight, Home, Target, Loader, Bot, Globe, Bell } from 'lucide-react';
import ProfileModal from '../components/ProfileModal';
import SettingsModal from '../components/SettingsModal';
import LeaderboardModal from '../components/LeaderboardModal';
import TutorModal from '../components/TutorModal';
import ProgressModal from '../components/ProgressModal';
import StreakModal from '../components/StreakModal';
import ShopModal from '../components/ShopModal';
import AnnouncementsModal from '../components/AnnouncementsModal';
import LessonPage from './LessonPage';
import './Dashboard.css';

// Helper: get time-of-day greeting key
function getGreetingKey() {
  const hour = new Date().getHours();
  if (hour < 12) return 'dash_good_morning';
  if (hour < 17) return 'dash_good_afternoon';
  return 'dash_good_evening';
}

const Dashboard = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [aiInsightLoading, setAiInsightLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState(null);
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    fetchAiInsight();
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

  const fetchAiInsight = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('http://localhost:5000/api/dashboard/ai-insight', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        const json = await res.json();
        setAiInsight(json);
      }
    } catch (err) {
      console.error('AI Insight fetch error:', err);
    } finally {
      setAiInsightLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/register');
  };

  if (!data) return <div className="loading-dashboard">{t('dash_loading')}</div>;

  const { user, stats, lessons, todaysGoal, dayNumber, unitProgress, achievements, rank, leaderboard, skillAnalysis, todaysTasks, assignedTasks } = data;

  // Filter lessons based on activeTab
  const filteredLessons = lessons.filter(l => l.level === activeTab);
  
  // Calculate track progress
  const completedLessons = filteredLessons.filter(l => l.status === 'completed').length;
  const totalLessons = filteredLessons.length;
  const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

  // Find current active lesson for the track
  const currentTrackLesson = filteredLessons.find(l => l.status === 'active') || filteredLessons.find(l => l.status !== 'completed') || filteredLessons[filteredLessons.length - 1];

  // Today's goal percentage
  const goalPercent = todaysGoal ? Math.min(100, Math.round((todaysGoal.earned / todaysGoal.target) * 100)) : 0;

  // Count completed today's tasks
  const tasksCompleted = todaysTasks ? [todaysTasks.lessonCompleted, todaysTasks.activityCompleted, todaysTasks.speakingDone, todaysTasks.gameCompleted].filter(Boolean).length : 0;
  const totalTasksXp = 80;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>BhashaSetu</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item active"><Home size={20} /> <span>{t('dash_nav_home', 'Home')}</span></button>
          <button className="nav-item" onClick={() => navigate('/learn')}><BookOpen size={20} /> <span>{t('dash_nav_learn', 'Learn')}</span></button>
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

      {/* Main Workspace */}
      <div className="dashboard-workspace">
        
        {/* Top Header */}
        <header className="dashboard-header">
          <div className="welcome-text">
            <h1>{t('dash_hello', { name: user.name.split(' ')[0] })}</h1>
            <p>{t(getGreetingKey())}</p>
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
            <button 
              className="action-btn secondary mr-4" 
              onClick={() => navigate('/assessment?retake=true')}
              style={{ padding: '0.6rem 1.2rem', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontWeight: '600', color: '#64748b', marginRight: '1rem' }}
            >
              {t('dash_retake_assessment')}
            </button>
            <div className="stat-item streak clickable" onClick={() => setShowStreakModal(true)} style={{ cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.05)' } }}>
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
            <div className="stat-item coins clickable" onClick={() => setShowShopModal(true)} style={{ cursor: 'pointer', transition: 'transform 0.2s', ':hover': { transform: 'scale(1.05)' } }}>
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

        {/* Two-Column Scrollable Area */}
        <main className="dashboard-main-area" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* Middle Column: Main Activities */}
          <div className="activities-column">
            
            {/* Today's Goal */}
            <div className="stat-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>{t('dash_todays_goal')}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ flex: 1, height: '16px', background: '#e5e7eb', borderRadius: '8px', overflow: 'hidden', display: 'flex' }}>
                  <div style={{ width: `${goalPercent}%`, height: '100%', background: '#111827', borderRadius: '8px', transition: 'width 0.5s ease' }}></div>
                </div>
                <span style={{ fontWeight: 'bold', color: '#475569', whiteSpace: 'nowrap' }}>
                  {todaysGoal ? `${todaysGoal.earned} / ${todaysGoal.target} XP` : '0 / 60 XP'}
                </span>
              </div>
            </div>

            {/* BhashaSetu Analysis Widget */}
            {data.settings && data.settings.ai_insights && (
              <div className="stat-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #bbf7d0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#22c55e', color: 'white', padding: '0.5rem', borderRadius: '12px' }}>
                    <Bot size={24} />
                  </div>
                  <h3 style={{ margin: 0, color: '#166534', fontSize: '1.25rem' }}>BhashaSetu Analysis</h3>
                </div>
                
                <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#374151', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI Learning Strategy</h4>
                  <p style={{ margin: 0, color: '#4b5563', lineHeight: '1.5', fontStyle: 'italic' }}>
                    "{data.settings.ai_insights.learning_strategy}"
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#16a34a', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Check size={16}/> Strengths</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', fontSize: '0.9rem' }}>
                      {data.settings.ai_insights.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#dc2626', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Target size={16}/> Focus Areas</h4>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', color: '#374151', fontSize: '0.9rem' }}>
                      {data.settings.ai_insights.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>
                
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dashed #86efac', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: '#166534', fontWeight: '500' }}>Overall Level:</span>
                  <span style={{ background: '#166534', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    {data.settings.ai_insights.overall_level}
                  </span>
                </div>
              </div>
            )}

            {/* Proficiency Track Selector */}
            <div className="track-selector" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: '#f1f5f9', padding: '0.5rem', borderRadius: '12px' }}>
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

            {/* Continue Learning */}
            <div className="stat-card continue-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '16px' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#111827', fontSize: '1.1rem' }}>{t('dash_continue_learning')}</h3>
              
              {currentTrackLesson ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                    <Play size={24} fill="#111827" />
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>
                      {t('dash_lesson', { num: filteredLessons.findIndex(l => l.id === currentTrackLesson.id) + 1, title: currentTrackLesson.title })}
                    </h4>
                  </div>
                  
                  <p style={{ margin: '0 0 1.5rem 0', color: '#475569', fontWeight: '500' }}>
                    {t('dash_progress_pct', { pct: progressPercent })}
                  </p>

                  <button 
                    className="primary-btn" 
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#111827', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
                    onClick={() => setActiveLessonId(currentTrackLesson.id)}
                  >
                    {t('dash_continue_btn')}
                  </button>
                </>
              ) : (
                <div>
                  <p style={{ color: '#475569', marginBottom: '1rem' }}>
                    {completedLessons === totalLessons && totalLessons > 0 
                      ? t('dash_congrats') 
                      : t('dash_take_assessment')}
                  </p>
                  {completedLessons !== totalLessons && (
                    <button 
                      className="primary-btn" 
                      style={{ width: '100%', padding: '1rem', borderRadius: '12px', background: '#111827', color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}
                      onClick={() => navigate('/assessment')}
                    >
                      {t('dash_take_assessment_btn')}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Today's Tasks */}
            <div className="stat-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>{t('dash_todays_tasks')}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1rem 0' }}>
                <TaskItem done={todaysTasks?.lessonCompleted} label={t('dash_task_lesson')} />
                <TaskItem done={todaysTasks?.activityCompleted} label={t('dash_task_activity')} />
                <TaskItem done={todaysTasks?.speakingDone} label={t('dash_task_speak')} />
                <TaskItem done={todaysTasks?.gameCompleted} label={t('dash_task_game')} />
                {assignedTasks && assignedTasks.length > 0 && assignedTasks.map(task => (
                  <li key={task.assignmentId} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', color: '#111827', background: '#fef08a', padding: '0.5rem', borderRadius: '8px' }}>
                    <div style={{
                      width: '20px', height: '20px', 
                      background: 'transparent', 
                      border: '1px solid #ca8a04', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      borderRadius: '4px'
                    }}>
                    </div>
                    <span 
                      style={{ textDecoration: 'none', cursor: 'pointer', fontWeight: '500', color: '#854d0e' }}
                      onClick={() => setActiveLessonId(task.lessonId)}
                    >
                      Assigned: {task.title}
                    </span>
                  </li>
                ))}
              </ul>
              <div style={{ padding: '0.5rem 0', borderTop: '1px dashed #e2e8f0', color: '#111827', fontWeight: 'bold' }}>
                {t('dash_reward', { xp: totalTasksXp })} {tasksCompleted === 4 && '✅'}
              </div>
            </div>



          </div>

          {/* Right Column: Progress & Gamification */}
          <div className="progress-column">
            
            {/* Daily Streak */}
            <div className="stat-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>{t('dash_daily_streak')}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <Flame size={40} fill="#f97316" color="#f97316" />
                <div>
                  <h2 style={{ margin: 0 }}>{t('dash_days', { count: stats.streak })}</h2>
                </div>
              </div>
              <p style={{ margin: '0 0 0.5rem 0', color: '#64748b', fontSize: '0.9rem' }}>{t('dash_next_reward')}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', color: '#eab308' }}>
                <Coins size={20} fill="#eab308" /> {stats.streak < 7 ? t('dash_coins_at_7') : stats.streak < 30 ? t('dash_coins_at_30') : t('dash_legendary')}
              </div>
            </div>

            {/* Achievements */}
            <div className="stat-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 1.25rem 0' }}>{t('dash_achievements')}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                {achievements && achievements.map((ach) => {
                  const percent = Math.min(100, Math.round((ach.current / ach.target) * 100));
                  return (
                    <div 
                      key={ach.id} 
                      title={t(`ach_${ach.id}_desc`, ach.desc)}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 0.5rem',
                        borderRadius: '16px',
                        background: ach.unlocked ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' : '#f8fafc',
                        border: `2px solid ${ach.unlocked ? '#4ade80' : '#e2e8f0'}`,
                        opacity: ach.unlocked ? 1 : 0.7,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        cursor: 'help',
                        boxShadow: ach.unlocked ? '0 4px 12px rgba(74, 222, 128, 0.15)' : 'none',
                        position: 'relative'
                      }}
                      className="achievement-badge-card"
                    >
                      {!ach.unlocked && (
                        <div style={{ position: 'absolute', top: '5px', right: '5px', fontSize: '0.75rem', color: '#94a3b8' }}>
                          🔒
                        </div>
                      )}
                      <span style={{ fontSize: '2rem', marginBottom: '0.25rem', filter: ach.unlocked ? 'none' : 'grayscale(100%)' }}>
                        {ach.icon}
                      </span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: ach.unlocked ? '#15803d' : '#475569', textAlign: 'center', lineHeight: '1.1', height: '24px', display: 'flex', alignItems: 'center' }}>
                        {t(`ach_${ach.id}_title`, ach.title)}
                      </span>
                      <div style={{ width: '80%', height: '5px', background: '#e2e8f0', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
                        <div style={{ width: `${percent}%`, height: '100%', background: ach.unlocked ? '#22c55e' : '#cbd5e1', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#64748b', marginTop: '0.25rem', fontWeight: '600' }}>
                        {ach.current >= ach.target ? ach.target : ach.current}/{ach.target}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skill Analysis */}
            <div className="stat-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0' }}>{t('dash_skill_analysis')}</h3>
              
              {skillAnalysis && Object.entries(skillAnalysis).map(([skill, percent]) => (
                <div key={skill} style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem', fontWeight: '500' }}>
                    <span>{t(`dash_${skill}`, skill.charAt(0).toUpperCase() + skill.slice(1))}</span>
                    <span>{percent}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#e5e7eb', borderRadius: '4px' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: '#111827', borderRadius: '4px', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Leaderboard */}
            <div className="stat-card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 1rem 0' }}>{t('dash_leaderboard')}</h3>
              {leaderboard && leaderboard.length > 0 ? (
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {leaderboard.map((entry, idx) => (
                    <li key={idx} style={{ 
                      padding: '0.8rem', 
                      background: entry.isCurrentUser ? '#f1f5f9' : 'transparent',
                      borderRadius: entry.isCurrentUser ? '8px' : '0',
                      borderBottom: idx < leaderboard.length - 1 ? '1px solid #f1f5f9' : 'none',
                      fontWeight: entry.isCurrentUser ? 'bold' : '400',
                      color: entry.isCurrentUser ? '#111827' : '#475569',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <span>#{entry.rank} {entry.name.split(' ')[0]} {entry.isCurrentUser ? t('dash_you') : ''}</span>
                      <span style={{ color: '#eab308', fontWeight: '600' }}>{entry.xp} XP</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p style={{ color: '#94a3b8', margin: 0 }}>{t('dash_no_users')}</p>
              )}
            </div>

            {/* AI Feedback */}
            <div className="stat-card" style={{ 
              marginBottom: '1.5rem', 
              padding: '1.5rem', 
              background: '#fff', 
              borderRadius: '16px', 
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(139, 92, 246, 0.1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span className="pulse-animation" style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#8b5cf6' }} />
                <span style={{ fontSize: '0.65rem', fontWeight: 'bold', color: '#8b5cf6', letterSpacing: '0.5px', textTransform: 'uppercase' }}>AI Active</span>
              </div>

              <h3 style={{ margin: '0 0 1.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1f2937' }}>
                <Bot size={22} color="#8b5cf6" />
                <span>{t('dash_ai_feedback', 'AI Insights & Feedback')}</span>
              </h3>

              {aiInsightLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', padding: '0.5rem 0' }}>
                  <Loader size={16} className="spin-animation" /> {t('dash_ai_analyzing')}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ 
                    background: '#f3f0ff', 
                    padding: '1rem', 
                    borderRadius: '12px 12px 12px 0', 
                    border: '1px solid #e9d5ff', 
                    position: 'relative' 
                  }}>
                    <strong style={{ display: 'block', fontSize: '0.75rem', color: '#6b21a8', textTransform: 'uppercase', marginBottom: '0.25rem', letterSpacing: '0.5px' }}>Observation:</strong>
                    <p style={{ margin: 0, color: '#581c87', fontSize: '0.9rem', lineHeight: '1.4', fontWeight: '500' }}>
                      "{aiInsight?.feedback || 'Complete some lessons to get personalized AI feedback!'}"
                    </p>
                  </div>

                  {aiInsight?.recommendation && (
                    <div style={{ 
                      background: '#f8fafc', 
                      padding: '1rem', 
                      borderRadius: '12px', 
                      border: '1px dashed #cbd5e1', 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0.5rem'
                    }}>
                      <strong style={{ fontSize: '0.75rem', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Recommended Action:</strong>
                      <p style={{ margin: 0, color: '#334155', fontSize: '0.85rem', lineHeight: '1.4' }}>
                        {aiInsight.recommendation}
                      </p>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Was this helpful?</span>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '2px 6px', borderRadius: '4px' }}>👍</button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', padding: '2px 6px', borderRadius: '4px' }}>👎</button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </main>
      </div>

      {/* Floating AI Tutor Bot */}
      <div 
        className="ai-tutor-fab"
        onClick={() => setShowTutor(true)}
      >
        <span style={{ fontWeight: '600', fontSize: '1.05rem', letterSpacing: '0.5px' }}>{t('dash_talk_with_me')}</span>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '0.6rem', borderRadius: '50%', display: 'flex' }}>
          <Bot size={24} />
        </div>
      </div>

      {showProfile && (
        <ProfileModal onClose={() => setShowProfile(false)} />
      )}
      
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

// Reusable TaskItem component
const TaskItem = ({ done, label }) => (
  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem', color: done ? '#111827' : '#475569' }}>
    <div style={{
      width: '20px', height: '20px', 
      background: done ? '#10b981' : 'transparent', 
      border: done ? 'none' : '1px solid #cbd5e1', 
      display: 'flex', alignItems: 'center', justifyContent: 'center', 
      borderRadius: '4px'
    }}>
      {done && <Check size={14} color="white" />}
    </div>
    <span style={{ textDecoration: done ? 'line-through' : 'none' }}>{label}</span>
  </li>
);

export default Dashboard;
