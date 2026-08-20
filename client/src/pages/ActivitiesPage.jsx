import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, BookOpen, Target, Gamepad2, Edit3, Award, Medal, BarChart2, User, Settings, LogOut, Bot, Mic, BookText, Layers, BrainCircuit, Activity, Compass, ShieldAlert, Eye, UserCheck, Menu, X } from 'lucide-react';
import ProfileModal from '../components/ProfileModal';
import SettingsModal from '../components/SettingsModal';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import LeaderboardModal from '../components/LeaderboardModal';
import TutorModal from '../components/TutorModal';
import ProgressModal from '../components/ProgressModal';
import './Dashboard.css';
import './ActivitiesPage.css';
import { API_BASE_URL } from '../config/api';

const ActivitiesPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showTutor, setShowTutor] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [data, setData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [activeTab, setActiveTab] = useState(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return user.proficiency_level || 'Beginner';
      } catch (e) {
        return 'Beginner';
      }
    }
    return 'Beginner';
  });

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

  const allActivities = [
    // Beginner
    {
      id: 'flashcards',
      title: t('act_flashcards_title', 'Vocabulary Flashcards'),
      description: t('act_flashcards_desc', 'Memorize words using our smart spaced-repetition swipe cards.'),
      icon: <Layers size={32} color="white" />,
      color: '#8b5cf6', // purple
      route: '/activities/flashcards',
      level: 'Beginner'
    },
    {
      id: 'phonics',
      title: t('act_phonics_title', 'Phonics & Pronunciation'),
      description: t('act_phonics_desc', 'Basic sounds and simple everyday words.'),
      icon: <Mic size={32} color="white" />,
      color: '#f43f5e', // rose
      route: '/activities/pronunciation',
      level: 'Beginner'
    },
    {
      id: 'stories-basic',
      title: t('act_stories_basic_title', 'Interactive Stories (Basic)'),
      description: t('act_stories_basic_desc', 'Short, simple stories with click-to-translate words.'),
      icon: <BookText size={32} color="white" />,
      color: '#3b82f6', // blue
      route: '/activities/stories?level=Beginner',
      level: 'Beginner'
    },
    {
      id: 'picture-match',
      title: t('act_picture_match_title', 'Picture Dictionary Match'),
      description: t('act_picture_match_desc', 'A drag-and-drop game matching basic words to everyday images.'),
      icon: <Gamepad2 size={32} color="white" />,
      color: '#10b981', // green
      route: '/activities/picture-match',
      level: 'Beginner'
    },
    {
      id: 'object-finder',
      title: t('act_object_finder_title', 'Spot the Object'),
      description: t('act_object_finder_desc', 'Locate and tag items in a dynamic domestic scene in the selected language.'),
      icon: <Eye size={32} color="white" />,
      color: '#06b6d4', // cyan
      route: '/activities/object-finder',
      level: 'Beginner',
      isNew: true
    },
    {
      id: 'gender-match',
      title: t('act_gender_match_title', 'Noun Classifier'),
      description: t('act_gender_match_desc', 'Sort inanimate nouns into Masculine and Feminine chests.'),
      icon: <Layers size={32} color="white" />,
      color: '#ec4899', // pink
      route: '/activities/gender-match',
      level: 'Beginner',
      isNew: true
    },
    
    // Intermediate
    {
      id: 'scenarios',
      title: t('act_scenarios_title', 'Real-World Scenarios'),
      description: t('act_scenarios_desc', 'Practice reading bus signs, bank slips, and medicine labels.'),
      icon: <Activity size={32} color="white" />,
      color: '#f59e0b', // amber
      route: '/activities/scenarios',
      level: 'Intermediate'
    },
    {
      id: 'stories-conv',
      title: t('act_stories_conv_title', 'Interactive Stories (Conversational)'),
      description: t('act_stories_conv_desc', 'Dialogue-heavy situational stories.'),
      icon: <BookText size={32} color="white" />,
      color: '#06b6d4', // cyan
      route: '/activities/stories?level=Intermediate',
      level: 'Intermediate'
    },
    {
      id: 'conversation-sim',
      title: t('act_conversation_sim_title', 'Conversation Simulator'),
      description: t('act_conversation_sim_desc', 'Roleplay with the AI tutor (ordering food, asking for directions).'),
      icon: <Bot size={32} color="white" />,
      color: '#8b5cf6', // purple
      route: '/activities/conversation-sim',
      level: 'Intermediate'
    },
    {
      id: 'audio-comp',
      title: t('act_audio_comp_title', 'Audio Comprehension'),
      description: t('act_audio_comp_desc', 'Listen to an everyday audio clip and answer questions.'),
      icon: <Mic size={32} color="white" />,
      color: '#f97316', // orange
      route: '/activities/audio-comp',
      level: 'Intermediate'
    },
    {
      id: 'directions-compass',
      title: t('act_directions_compass_title', 'Directions Compass'),
      description: t('act_directions_compass_desc', 'Steer a delivery vehicle to coordinates on a city map using auditory route alerts.'),
      icon: <Compass size={32} color="white" />,
      color: '#6366f1', // indigo
      route: '/activities/directions-compass',
      level: 'Intermediate',
      isNew: true
    },
    {
      id: 'scam-detector',
      title: t('act_scam_detector_title', 'Scam Alert Officer'),
      description: t('act_scam_detector_desc', 'Scan phone messages, lottery warnings, and bank OTP claims for security scams.'),
      icon: <ShieldAlert size={32} color="white" />,
      color: '#ef4444', // red
      route: '/activities/scam-detector',
      level: 'Intermediate',
      isNew: true
    },

    // Advanced
    {
      id: 'pronunciation-adv',
      title: t('act_pronunciation_adv_title', 'Pronunciation Lab (Advanced)'),
      description: t('act_pronunciation_adv_desc', 'Complex sentences, professional vocabulary, and tongue twisters.'),
      icon: <Mic size={32} color="white" />,
      color: '#ec4899', // pink
      route: '/activities/pronunciation-adv',
      level: 'Advanced'
    },
    {
      id: 'weak-skills',
      title: t('act_weak_skills_title', 'Practice Weak Skills'),
      description: t('act_weak_skills_desc', 'AI-generated challenging scenarios targeting your specific weak points.'),
      icon: <BrainCircuit size={32} color="white" />,
      color: '#10b981', // green
      route: '/activities/weak-skills',
      level: 'Advanced'
    },
    {
      id: 'speech-prep',
      title: t('act_speech_prep_title', 'Speech & Debate Prep'),
      description: t('act_speech_prep_desc', 'Record a 1-minute speech on a given topic and receive detailed AI feedback.'),
      icon: <Target size={32} color="white" />,
      color: '#ef4444', // red
      route: '/activities/speech-prep',
      level: 'Advanced'
    },
    {
      id: 'article-translation',
      title: t('act_article_translation_title', 'Article Translation'),
      description: t('act_article_translation_desc', 'Read a short news snippet or professional email and summarize/translate the meaning.'),
      icon: <Edit3 size={32} color="white" />,
      color: '#6366f1', // indigo
      route: '/activities/article-translation',
      level: 'Advanced'
    },
    {
      id: 'mock-interview',
      title: t('act_mock_interview_title', 'Career Mock Interviewer'),
      description: t('act_mock_interview_desc', 'Practice spoken job interviews (Receptionist, Sales, Clerk) with live AI feedback coaching.'),
      icon: <UserCheck size={32} color="white" />,
      color: '#8b5cf6', // purple
      route: '/activities/mock-interview',
      level: 'Advanced',
      isNew: true
    },
    {
      id: 'grammar-editor',
      title: t('act_grammar_editor_title', 'Editorial Board'),
      description: t('act_grammar_editor_desc', 'Rewrite news articles and formal letters to correct grammatical typos and register styles.'),
      icon: <Edit3 size={32} color="white" />,
      color: '#f59e0b', // amber
      route: '/activities/grammar-editor',
      level: 'Advanced',
      isNew: true
    }
  ];

  const filteredActivities = allActivities.filter(a => a.level === activeTab);


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
          <button className="nav-item" onClick={() => { navigate('/learn'); setSidebarOpen(false); }}><BookOpen size={20} /> <span>{t('dash_nav_learn', 'Learn')}</span></button>
          <button className="nav-item active" onClick={() => setSidebarOpen(false)}><Target size={20} /> <span>{t('dash_nav_activities', 'Activities')}</span></button>
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

      <div className="dashboard-workspace activities-workspace">
        
        {/* Top Header */}
        <header className="dashboard-header activities-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Target size={28} color="#0d9488" /> {t('act_title', 'Learning Activities')}
            </h1>
          </div>
        </header>

        {/* Level Tabs */}
        <div className="activity-tabs" style={{ display: 'flex', gap: '1rem', padding: '0 2.5rem', marginBottom: '2rem' }}>
          {['Beginner', 'Intermediate', 'Advanced'].map(level => (
            <Button
              variant="primary"
              key={level}
              className={`activity-tab track-btn track-btn-${level.toLowerCase()} ${activeTab === level ? 'active' : ''}`}
              onClick={() => setActiveTab(level)}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '1rem',
                flex: '0 1 auto'
              }}
            >
              {t(`act_${level.toLowerCase()}`, level)}
            </Button>
          ))}
        </div>

        <main className="activities-container" style={{ paddingTop: 0 }}>
          <div className="activities-grid">
            {filteredActivities.map((activity) => (
              <div 
                key={activity.id} 
                className="activity-card"
                onClick={() => navigate(activity.route)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(activity.route);
                  }
                }}
                style={{ position: 'relative' }}
              >
                {activity.isNew && (
                  <Badge variant="primary" style={{ position: 'absolute', top: '-10px', right: '-10px', boxShadow: 'var(--shadow-sm)' }}>
                    {t('act_new', 'NEW')}
                  </Badge>
                )}
                <div className="activity-icon-wrapper" style={{ backgroundColor: activity.color }}>
                  {activity.icon}
                </div>
                <div className="activity-content" style={{ flex: 1 }}>
                  <h3>{activity.title}</h3>
                  <p>{activity.description}</p>
                </div>
                <div style={{ marginTop: 'auto', paddingTop: '1.2rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'flex-end' }}>
                   <Button variant="ghost" size="sm" iconRight={<Target size={16} />} tabIndex={-1} aria-hidden="true" style={{ color: activity.color }}>
                     Start Activity
                   </Button>
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
    </div>
  );
};

export default ActivitiesPage;
