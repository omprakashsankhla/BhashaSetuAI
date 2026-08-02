import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Flame, Coins, User, Settings, Award, BookOpen, Lock, Check, Play, LogOut, Heart, Mic, Gamepad2, Edit3, BarChart2, Medal, ArrowRight, Home, Target, Loader, Bot, Globe, Bell, Menu, X } from 'lucide-react';
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
import { API_BASE_URL } from '../config/api';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [aiExpanded, setAiExpanded] = useState(false);

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

  const fetchAiInsight = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch(`${API_BASE_URL}/api/dashboard/ai-insight`, {
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
      {/* Sidebar Backdrop */}
      <div className={`sidebar-backdrop ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-logo">
          <h2>BhashaSetu</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button className="nav-item active" onClick={() => setSidebarOpen(false)}><Home size={20} /> <span>{t('dash_nav_home', 'Home')}</span></button>
          <button className="nav-item" onClick={() => { navigate('/learn'); setSidebarOpen(false); }}><BookOpen size={20} /> <span>{t('dash_nav_learn', 'Learn')}</span></button>
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

      {/* Main Workspace */}
      <div className="dashboard-workspace">
        
        {/* Top Header */}
        <header className="dashboard-header">
          <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle Sidebar">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="welcome-text">
            <h1>{t('dash_hello', { name: user.name.split(' ')[0] })}</h1>
            <p>{t(getGreetingKey())}</p>
          </div>

          <div className="header-actions">
            <div className="lang-switcher">
              <Globe size={16} />
              <span>{t('header_learn_lang', 'Learn')}:</span>
              <select 
                value={user?.preferred_language || 'hi'} 
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
                <option value="hi">हिन्दी</option>
                <option value="mwr">मारवाड़ी</option>
                <option value="ta">தமிழ்</option>
                <option value="te">తెలుగు</option>
                <option value="bn">বাংলা</option>
                <option value="mr">मराठी</option>
                <option value="ur">اردو</option>
              </select>
            </div>
            
            <button className="btn-secondary retake-btn" onClick={() => navigate('/assessment?retake=true')}>
              {t('dash_retake_assessment')}
            </button>
            
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
                user.name.charAt(0).toUpperCase()
              )}
            </div>
          </div>
        </header>

        {/* Top Metrics Row */}
        <div className="dashboard-metrics-row">
          <div className="metric-card clickable" onClick={() => setShowStreakModal(true)}>
            <div className="metric-icon streak-icon"><Flame size={24} /></div>
            <div className="metric-info">
              <span className="metric-value">{stats.streak}</span>
              <span className="metric-label">{t('dash_day_streak', 'Day Streak')}</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon xp-icon">⭐</div>
            <div className="metric-info">
              <span className="metric-value">{stats.xp}</span>
              <span className="metric-label">Total XP</span>
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-icon rank-icon"><Award size={24} /></div>
            <div className="metric-info">
              <span className="metric-value" style={{fontSize: '1.2rem'}}>{t('dash_rank', { rank: rank || 'Bronze' })}</span>
              <span className="metric-label">Current Rank</span>
            </div>
          </div>
          <div className="metric-card clickable" onClick={() => setShowShopModal(true)}>
            <div className="metric-icon coins-icon"><Coins size={24} /></div>
            <div className="metric-info">
              <span className="metric-value">{stats.coins}</span>
              <span className="metric-label">Coins</span>
            </div>
          </div>
        </div>

        {/* Two-Column Scrollable Area */}
        <main className="dashboard-main-area">
          
          {/* Middle Column: Main Activities */}
          <div className="activities-column">
            
            {/* Today's Goal */}
            <div className="dash-card goal-card">
              <div className="card-header">
                <h3>{t('dash_todays_goal', "Today's Goal")}</h3>
                <span className="goal-text">{todaysGoal ? `${todaysGoal.earned} / ${todaysGoal.target} XP` : '0 / 60 XP'}</span>
              </div>
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${goalPercent}%` }}></div>
              </div>
            </div>

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
            <div className="dash-card continue-card">
              <h3>{t('dash_continue_learning', 'Continue Learning')}</h3>
              
              {currentTrackLesson ? (
                <>
                  <div className="lesson-info">
                    <div className="lesson-icon-circle"><Play size={24} /></div>
                    <h4>
                      {t('dash_lesson', { num: filteredLessons.findIndex(l => l.id === currentTrackLesson.id) + 1, title: currentTrackLesson.title })}
                    </h4>
                  </div>
                  
                  <p className="progress-text">
                    {t('dash_progress_pct', { pct: progressPercent })}
                  </p>

                  <button className="btn-primary" onClick={() => setActiveLessonId(currentTrackLesson.id)}>
                    {t('dash_continue_btn', 'Continue')}
                  </button>
                </>
              ) : (
                <div className="empty-state">
                  <p>
                    {completedLessons === totalLessons && totalLessons > 0 
                      ? t('dash_congrats', 'You have completed all lessons!') 
                      : t('dash_take_assessment', 'Take an assessment to unlock lessons.')}
                  </p>
                  {completedLessons !== totalLessons && (
                    <button className="btn-primary" onClick={() => navigate('/assessment')}>
                      {t('dash_take_assessment_btn', 'Take Assessment')}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Today's Tasks */}
            <div className="dash-card">
              <h3>{t('dash_todays_tasks', "Today's Tasks")}</h3>
              <ul className="task-list">
                <TaskItem done={todaysTasks?.lessonCompleted} label={t('dash_task_lesson')} />
                <TaskItem done={todaysTasks?.activityCompleted} label={t('dash_task_activity')} />
                <TaskItem done={todaysTasks?.speakingDone} label={t('dash_task_speak')} />
                <TaskItem done={todaysTasks?.gameCompleted} label={t('dash_task_game')} />
                {assignedTasks && assignedTasks.length > 0 && assignedTasks.map(task => (
                  <li key={task.assignmentId} className="assigned-task" onClick={() => setActiveLessonId(task.lessonId)}>
                    <div className="checkbox-empty"></div>
                    <span>Assigned: {task.title}</span>
                  </li>
                ))}
              </ul>
              <div className="task-reward">
                {t('dash_reward', { xp: totalTasksXp })} {tasksCompleted === 4 && '✅'}
              </div>
            </div>

          </div>

          {/* Right Column: Progress & Gamification */}
          <div className="progress-column">
            {/* AI Analysis Widget - Professional Collapsible */}
            {data.settings && data.settings.ai_insights && (
              <div className="dash-card ai-insight-card">
                <div className="ai-card-header" onClick={() => setAiExpanded(!aiExpanded)}>
                  <div className="ai-title-wrap">
                    <div className="ai-icon-bg">
                      <Bot size={20} />
                    </div>
                    <h3>AI Learning Insights</h3>
                  </div>
                  <button className="expand-btn">
                    {aiExpanded ? '▲' : '▼'}
                  </button>
                </div>
                
                {aiExpanded && (
                  <div className="ai-card-body">
                    <div className="ai-strategy">
                      <h4>Learning Strategy</h4>
                      <p>"{data.settings.ai_insights.learning_strategy}"</p>
                    </div>

                    <div className="ai-strengths-weaknesses">
                      <div>
                        <h4 className="strengths-title"><Check size={16}/> Strengths</h4>
                        <ul>
                          {data.settings.ai_insights.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="focus-title"><Target size={16}/> Focus Areas</h4>
                        <ul>
                          {data.settings.ai_insights.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                      </div>
                    </div>
                    
                    <div className="ai-overall-level">
                      <span>Overall Level:</span>
                      <span className="level-badge">{data.settings.ai_insights.overall_level}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Achievements */}
            <div className="dash-card">
              <h3>{t('dash_achievements', 'Achievements')}</h3>
              <div className="achievements-grid">
                {achievements && achievements.map((ach) => {
                  const percent = Math.min(100, Math.round((ach.current / ach.target) * 100));
                  return (
                    <div 
                      key={ach.id} 
                      title={t(`ach_${ach.id}_desc`, ach.desc)}
                      className={`achievement-badge-card ${ach.unlocked ? 'unlocked' : 'locked'}`}
                    >
                      {!ach.unlocked && <div className="lock-icon">🔒</div>}
                      <span className="ach-icon">{ach.icon}</span>
                      <span className="ach-title">{t(`ach_${ach.id}_title`, ach.title)}</span>
                      <div className="ach-progress-bg">
                        <div className="ach-progress-fill" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="ach-progress-text">
                        {ach.current >= ach.target ? ach.target : ach.current}/{ach.target}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Skill Analysis */}
            <div className="dash-card">
              <h3>{t('dash_skill_analysis', 'Skill Analysis')}</h3>
              <div className="skills-list">
                {skillAnalysis && Object.entries(skillAnalysis).map(([skill, percent]) => (
                  <div key={skill} className="skill-item">
                    <div className="skill-header">
                      <span>{t(`dash_${skill}`, skill.charAt(0).toUpperCase() + skill.slice(1))}</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${percent}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
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
      <div className="ai-tutor-fab" onClick={() => setShowTutor(true)}>
        <span>{t('dash_talk_with_me', 'Chat')}</span>
        <div className="tutor-icon-wrap">
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
  <li className={`task-item ${done ? 'done' : ''}`}>
    <div className={`checkbox ${done ? 'checked' : ''}`}>
      {done && <Check size={14} color="white" />}
    </div>
    <span>{label}</span>
  </li>
);

export default Dashboard;
