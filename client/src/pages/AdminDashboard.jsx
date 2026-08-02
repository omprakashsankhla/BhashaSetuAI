import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search, Play, Activity, Settings, LogOut, MessageSquare, ChevronRight, CheckCircle, BookOpen, Award, BarChart2, Filter, Trash2, Edit3, Plus, X, User, Calendar, Book, Megaphone, Gamepad2, Download, Save, Bell, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Target, Zap, Trophy, AlertTriangle, BrainCircuit, Lightbulb, Menu } from 'lucide-react';
import './AdminDashboard.css';
import { API_BASE_URL } from '../config/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Data States
  const [analytics, setAnalytics] = useState(null);
  const [students, setStudents] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({});

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 50;

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [languageFilter, setLanguageFilter] = useState('all');

  // Modal States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [showLessonModal, setShowLessonModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonFormData, setLessonFormData] = useState({ title: '', level: 'Beginner', content_data: {} });

  const [newAnnouncement, setNewAnnouncement] = useState({ title: '', message: '', target_user_id: '' });

  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [newStudentFormData, setNewStudentFormData] = useState({
    name: '', email: '', password: '', age: '', preferred_language: 'en', education_level: '', proficiency_level: 'Beginner'
  });

  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: null, id: null });
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignLesson, setAssignLesson] = useState(null);
  const [lessonStudents, setLessonStudents] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  const fetchData = async (silent = false, page = currentPage) => {
    if (!silent) setLoading(true);
    try {
      const headers = getHeaders();
      const [analyticsRes, studentsRes, lessonsRes, logsRes, annRes, setRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/analytics`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/students?page=${page}&limit=${limit}`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/lessons`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/activity-logs`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/announcements`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/settings`, { headers })
      ]);

      if (!analyticsRes.ok) throw new Error('Unauthorized');

      setAnalytics(await analyticsRes.json());
      const studentsData = await studentsRes.json();
      setStudents(studentsData.students);
      if (studentsData.pagination) {
        setCurrentPage(studentsData.pagination.page);
        setTotalPages(studentsData.pagination.totalPages);
      }
      setLessons((await lessonsRes.json()).lessons);
      setActivityLogs((await logsRes.json()).logs);
      setAnnouncements((await annRes.json()).announcements);
      setPlatformSettings((await setRes.json()).settings);
    } catch (err) {
      console.error(err);
      navigate('/register');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/register');
  };

  // --- Student Actions ---
  const handleViewStudent = async (studentId) => {
    setShowStudentModal(true);
    setLoadingDetails(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/students/${studentId}/details`, { headers: getHeaders() });
      const data = await res.json();
      setStudentDetails(data);
    } catch (err) {
      console.error("Failed to fetch student details");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDeleteStudent = (studentId) => {
    setDeleteConfirm({ isOpen: true, type: 'student', id: studentId });
  };

  const executeDelete = async () => {
    if (!deleteConfirm.id) return;
    const { type, id } = deleteConfirm;
    
    try {
      if (type === 'student') {
        const res = await fetch(`${API_BASE_URL}/api/admin/students/${id}`, { method: 'DELETE', headers: getHeaders() });
        if (res.ok) {
          setStudents(prev => prev.filter(s => s.user_id != id));
          fetchData(true);
        } else if (res.status === 401 || res.status === 403) {
          handleLogout();
        } else {
          const errData = await res.json();
          alert(`Error deleting student: ${errData.message}`);
        }
      } else if (type === 'lesson') {
        const res = await fetch(`${API_BASE_URL}/api/admin/lessons/${id}`, { method: 'DELETE', headers: getHeaders() });
        if (res.ok) {
          setLessons(prev => prev.filter(l => l.lesson_id != id));
          fetchData(true);
        } else if (res.status === 401 || res.status === 403) {
          handleLogout();
        } else {
          const errData = await res.json();
          alert(`Error deleting lesson: ${errData.message}`);
        }
      }
    } catch (err) {
      console.error(`Failed to delete ${type}`, err);
      alert(`Network error: failed to delete ${type}.`);
    } finally {
      setDeleteConfirm({ isOpen: false, type: null, id: null });
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/students`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newStudentFormData)
      });
      if (res.ok) {
        setShowAddStudentModal(false);
        setNewStudentFormData({ name: '', email: '', password: '', age: '', preferred_language: 'en', education_level: '', proficiency_level: 'Beginner' });
        fetchData(true); // Refresh list silently
      } else {
        const data = await res.json();
        alert(data.message || 'Error adding student');
      }
    } catch (err) {
      console.error("Failed to add student");
      alert('Network error adding student');
    }
  };

  const handleExportCSV = () => {
    const header = ['User ID', 'Name', 'Email', 'Language Preference', 'Lessons Completed', 'Avg Score', 'Joined Date'];
    const rows = filteredStudents.map(s => [
      s.user_id, s.name, s.email, s.preferred_language, s.lessons_completed || 0, s.avg_score || 0, new Date(s.created_at).toLocaleDateString()
    ]);
    
    const csvContent = [
      header.join(','),
      ...rows.map(e => e.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'students_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Lesson Actions ---
  const handleOpenLessonModal = (lesson = null) => {
    if (lesson) {
      setEditingLesson(lesson);
      setLessonFormData({ title: lesson.title, level: lesson.level, content_data: lesson.content_data || {} });
    } else {
      setEditingLesson(null);
      setLessonFormData({ title: '', level: 'Beginner', content_data: {} });
    }
    setShowLessonModal(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    try {
      const url = editingLesson 
        ? `${API_BASE_URL}/api/admin/lessons/${editingLesson.lesson_id}`
        : `${API_BASE_URL}/api/admin/lessons`;
      
      const res = await fetch(url, {
        method: editingLesson ? 'PUT' : 'POST',
        headers: getHeaders(),
        body: JSON.stringify(lessonFormData)
      });
      if (res.ok) {
        setShowLessonModal(false);
        fetchData(true); 
      }
    } catch (err) {
      console.error("Failed to save lesson");
    }
  };

  const handleReorderLesson = async (level, currentIndex, direction) => {
    const levelLessons = [...lessons.filter(l => l.level === level)];
    
    if (direction === 'left' && currentIndex > 0) {
      const temp = levelLessons[currentIndex];
      levelLessons[currentIndex] = levelLessons[currentIndex - 1];
      levelLessons[currentIndex - 1] = temp;
    } else if (direction === 'right' && currentIndex < levelLessons.length - 1) {
      const temp = levelLessons[currentIndex];
      levelLessons[currentIndex] = levelLessons[currentIndex + 1];
      levelLessons[currentIndex + 1] = temp;
    } else {
      return;
    }

    const updates = levelLessons.map((l, index) => ({
      lesson_id: l.lesson_id,
      display_order: index
    }));

    try {
      await fetch(`${API_BASE_URL}/api/admin/lessons/action/reorder`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ updates })
      });
      fetchData(true); // Sync silently
    } catch (err) {
      console.error("Failed to reorder lessons", err);
    }
  };

  const handleDeleteLesson = (lessonId) => {
    setDeleteConfirm({ isOpen: true, type: 'lesson', id: lessonId });
  };

  const handleOpenAssignModal = async (lesson) => {
    setAssignLesson(lesson);
    setShowAssignModal(true);
    setLessonStudents([]); 
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/lessons/${lesson.lesson_id}/completion`, { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        setLessonStudents(data.students);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignLesson = async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/lessons/${assignLesson.lesson_id}/assign`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ user_id: userId })
      });
      if (res.ok) {
        setLessonStudents(prev => prev.map(s => s.user_id === userId ? { ...s, completion_status: 'Assigned' } : s));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Announcements Actions ---
  const handleSendAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/announcements`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          title: newAnnouncement.title,
          message: newAnnouncement.message,
          target_user_id: newAnnouncement.target_user_id === '' ? null : parseInt(newAnnouncement.target_user_id, 10)
        })
      });
      if (res.ok) {
        setNewAnnouncement({ title: '', message: '', target_user_id: '' });
        fetchData(true); 
        alert('Announcement sent successfully!');
      }
    } catch (err) {
      console.error("Failed to send announcement", err);
      alert('Error sending announcement.');
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        setAnnouncements(announcements.filter(a => a.id !== id));
      } else {
        alert('Failed to delete announcement.');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting announcement.');
    }
  };

  // --- Curriculum Actions ---
  const handleToggleSetting = (key) => {
    setPlatformSettings(prev => ({
      ...prev,
      [key]: prev[key] === 'true' ? 'false' : 'true'
    }));
  };

  const handleSaveSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ settings: platformSettings })
      });
      if (res.ok) {
        alert('Settings saved successfully!');
      }
    } catch (err) {
      console.error("Failed to save settings");
    }
  };

  // --- Render Helpers ---
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLang = languageFilter === 'all' || s.preferred_language === languageFilter;
    return matchesSearch && matchesLang;
  });

  const getLanguageColor = (index) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
    return colors[index % colors.length];
  };

  if (loading) return <div className="loading-admin"><div className="spinner"></div><h2>Loading Premium Dashboard...</h2></div>;

  return (
    <div className="admin-layout">
      <div className={`admin-sidebar-backdrop ${sidebarOpen ? 'active' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar-open' : ''}`}>
        <div className="admin-sidebar-logo">
          <h2>BhashaSetu <span className="highlight">Pro</span></h2>
        </div>
        
        <nav className="admin-nav">
          <button className={`admin-nav-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => { setActiveTab('overview'); setSidebarOpen(false); }}>
            <BarChart2 size={20} /> <span>Overview</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => { setActiveTab('students'); setSidebarOpen(false); }}>
            <Users size={20} /> <span>Students</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'lessons' ? 'active' : ''}`} onClick={() => { setActiveTab('lessons'); setSidebarOpen(false); }}>
            <BookOpen size={20} /> <span>Curriculum</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'games' ? 'active' : ''}`} onClick={() => { setActiveTab('games'); setSidebarOpen(false); }}>
            <Gamepad2 size={20} /> <span>Games</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'broadcast' ? 'active' : ''}`} onClick={() => { setActiveTab('broadcast'); setSidebarOpen(false); }}>
            <Megaphone size={20} /> <span>Broadcast</span>
          </button>
          <button className={`admin-nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setSidebarOpen(false); }}>
            <Settings size={20} /> <span>Settings</span>
          </button>
          
          <button className="admin-nav-item logout" onClick={handleLogout}>
            <LogOut size={20} /> <span>Logout</span>
          </button>
        </nav>
      </aside>

      {/* Main Workspace */}
      <div className="admin-workspace">
        <header className="admin-header">
          <button className="admin-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          <div className="admin-profile">
            <div className="admin-profile-text">
              <span className="admin-name">God Admin</span>
              <span className="admin-role">Superuser</span>
            </div>
            <div className="admin-avatar">
              <img src="https://ui-avatars.com/api/?name=God+Admin&background=0D8ABC&color=fff" alt="Admin" />
            </div>
          </div>
        </header>

        <main className="admin-main-content fade-in">
          {/* TAB: OVERVIEW */}
          {activeTab === 'overview' && analytics && (
            <div className="tab-overview">
              <div className="admin-metrics-row">
                <div className="admin-metric-card" style={{'--card-color': '#3b82f6'}}>
                  <div className="metric-icon"><Users size={28} /></div>
                  <div className="metric-data">
                    <p className="metric-title">Total Students</p>
                    <h3 className="metric-value">{analytics.totalStudents}</h3>
                  </div>
                </div>
                <div className="admin-metric-card" style={{'--card-color': '#8b5cf6'}}>
                  <div className="metric-icon"><Activity size={28} /></div>
                  <div className="metric-data">
                    <p className="metric-title">Active Today (DAU)</p>
                    <h3 className="metric-value">{analytics.dau}</h3>
                  </div>
                </div>
                <div className="admin-metric-card" style={{'--card-color': '#10b981'}}>
                  <div className="metric-icon"><Target size={28} /></div>
                  <div className="metric-data">
                    <p className="metric-title">Goal Completion</p>
                    <h3 className="metric-value">{analytics.goalCompletionRate}%</h3>
                  </div>
                </div>
                <div className="admin-metric-card" style={{'--card-color': '#f59e0b'}}>
                  <div className="metric-icon"><Zap size={28} /></div>
                  <div className="metric-data">
                    <p className="metric-title">Total Platform XP</p>
                    <h3 className="metric-value">{analytics.totalXP}</h3>
                  </div>
                </div>
                <div className="admin-metric-card" style={{'--card-color': '#ec4899'}}>
                  <div className="metric-icon"><Award size={28} /></div>
                  <div className="metric-data">
                    <p className="metric-title">Avg. Score</p>
                    <h3 className="metric-value">{analytics.avgScore}%</h3>
                  </div>
                </div>
              </div>

              <div className="admin-chart-card global-ai-card" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)', border: '1px solid #bfdbfe' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#3b82f6', padding: '0.5rem', borderRadius: '8px', color: 'white' }}>
                    <BrainCircuit size={24} />
                  </div>
                  <h3 style={{ margin: 0, color: '#1e3a8a' }}>Global AI Insights</h3>
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.5rem', color: '#1e40af', lineHeight: '1.8' }}>
                  {analytics.globalInsights?.map((insight, idx) => (
                    <li key={idx}><strong>Observation:</strong> {insight}</li>
                  ))}
                </ul>
              </div>

              <div className="overview-layout-grid">
                <div className="charts-section">
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                    <div className="admin-chart-card">
                      <h3><Trophy size={18} style={{ display: 'inline', marginRight: '8px', color: '#eab308' }} /> Top Performers</h3>
                      <div className="top-performers-list">
                        {analytics.topPerformers?.length > 0 ? analytics.topPerformers.map((user, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <span style={{ fontWeight: 'bold', color: '#64748b' }}>#{idx + 1}</span>
                              {user.avatar ? (
                                <img src={user.avatar} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                              ) : (
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={16} color="#94a3b8" /></div>
                              )}
                              <span style={{ fontWeight: '600' }}>{user.name}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.85rem' }}>
                              <span style={{ color: '#eab308', fontWeight: 'bold' }}>{user.xp} XP</span>
                              <span style={{ color: '#f97316', fontWeight: 'bold' }}>🔥 {user.streak}</span>
                            </div>
                          </div>
                        )) : <p className="no-data">No active students.</p>}
                      </div>
                    </div>

                    <div className="admin-chart-card">
                      <h3><AlertTriangle size={18} style={{ display: 'inline', marginRight: '8px', color: '#ef4444' }} /> Curriculum Bottlenecks</h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>Skills with the lowest average scores across the platform.</p>
                      <div className="bottlenecks-list">
                        {analytics.mostDifficultLessons?.length > 0 ? analytics.mostDifficultLessons.map((lesson, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#fef2f2', borderRadius: '8px', marginBottom: '0.5rem', border: '1px solid #fecaca' }}>
                            <span style={{ fontWeight: '600', color: '#991b1b' }}>{lesson.title}</span>
                            <span style={{ fontWeight: 'bold', color: '#dc2626' }}>Avg Score: {parseFloat(lesson.avg_score).toFixed(1)}%</span>
                          </div>
                        )) : <p className="no-data">Not enough data.</p>}
                      </div>
                    </div>
                  </div>

                  <div className="admin-chart-card">
                    <h3>Language Distribution</h3>
                    <div className="bar-chart-vertical">
                      {analytics.languageDistribution.length > 0 ? analytics.languageDistribution.map((item, idx) => {
                        const max = Math.max(...analytics.languageDistribution.map(d => d.count));
                        const height = `${(item.count / max) * 100}%`;
                        return (
                          <div key={idx} className="bar-col">
                            <div className="bar-fill" style={{height, backgroundColor: getLanguageColor(idx)}} title={`${item.language}: ${item.count}`}></div>
                            <span className="bar-label">{item.language}</span>
                          </div>
                        );
                      }) : <p className="no-data">No data available</p>}
                    </div>
                  </div>

                  <div className="admin-chart-card">
                    <h3>Average Skill Proficiency</h3>
                    <div className="bar-chart-horizontal">
                      {analytics.averageSkills.length > 0 ? analytics.averageSkills.map((item, idx) => {
                        const width = `${parseFloat(item.avgScore)}%`;
                        return (
                          <div key={idx} className="bar-row">
                            <span className="bar-row-label">{item.skill}</span>
                            <div className="bar-row-track">
                              <div className="bar-row-fill" style={{width, backgroundColor: '#8b5cf6'}}>
                                <span className="bar-row-value">{parseFloat(item.avgScore).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      }) : <p className="no-data">No data available</p>}
                    </div>
                  </div>
                </div>

                <div className="activity-feed-section">
                  <div className="admin-chart-card activity-feed-card">
                    <div className="activity-header">
                      <h3>Live Activity Feed</h3>
                      <Activity size={18} className="pulse-icon" />
                    </div>
                    <ul className="activity-list">
                      {activityLogs.length > 0 ? activityLogs.map((log, idx) => (
                        <li key={idx} className="activity-item">
                          <div className={`activity-icon ${log.type}`}>
                            {log.type === 'user_joined' ? <User size={14} /> : <BookOpen size={14} />}
                          </div>
                          <div className="activity-content">
                            <p>
                              <strong>{log.user_name}</strong> 
                              {log.type === 'user_joined' ? ' joined the platform.' : ` completed ${log.detail}.`}
                            </p>
                            <span className="activity-time">{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </li>
                      )) : <p className="no-data">No recent activities.</p>}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STUDENTS */}
          {activeTab === 'students' && (
            <div className="tab-students">
              <div className="table-controls">
                <div className="search-box">
                  <Search size={18} />
                  <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="filter-box">
                  <Filter size={18} />
                  <select value={languageFilter} onChange={(e) => setLanguageFilter(e.target.value)}>
                    <option value="all">All Languages</option>
                    {[...new Set(students.map(s => s.preferred_language))].map(lang => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                  <div className="ml-auto" style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn-secondary" onClick={handleExportCSV}>
                      <Download size={16} /> Export CSV
                    </button>
                    <button className="btn-primary" onClick={() => setShowAddStudentModal(true)}>
                      <Plus size={16} /> Add Student
                    </button>
                  </div>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Language</th>
                      <th>Completed</th>
                      <th>Avg Score</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? filteredStudents.map(student => (
                      <tr key={student.user_id}>
                        <td>
                          <div className="td-user">
                            <div className="td-avatar">{student.name.charAt(0)}</div>
                            <div className="td-info">
                              <strong>{student.name}</strong>
                              <span>{student.email}</span>
                            </div>
                          </div>
                        </td>
                        <td><span className="status-pill">{student.preferred_language}</span></td>
                        <td>{student.lessons_completed || 0}</td>
                        <td>
                          <div className="score-indicator">
                            <div className="score-dot" style={{background: student.avg_score > 80 ? '#10b981' : student.avg_score > 50 ? '#f59e0b' : '#ef4444'}}></div>
                            {student.avg_score ? parseFloat(student.avg_score).toFixed(1) + '%' : 'N/A'}
                          </div>
                        </td>
                        <td>{new Date(student.created_at).toLocaleDateString()}</td>
                        <td>
                          <div className="action-buttons">
                            <button className="btn-icon" onClick={() => handleViewStudent(student.user_id)} title="View Details"><Activity size={18} /></button>
                            <button className="btn-icon danger" onClick={() => handleDeleteStudent(student.user_id)} title="Delete Student"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    )) : <tr><td colSpan="6" className="text-center">No students found matching your criteria.</td></tr>}
                  </tbody>
                </table>
              </div>
              {totalPages > 1 && (
                <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => fetchData(true, currentPage - 1)}
                    className="btn-secondary"
                  >
                    Previous
                  </button>
                  <span style={{ fontWeight: '500' }}>Page {currentPage} of {totalPages}</span>
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => fetchData(true, currentPage + 1)}
                    className="btn-secondary"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB: LESSONS */}
          {activeTab === 'lessons' && (
            <div className="tab-lessons">
              <div className="section-header">
                <h2>Curriculum Modules</h2>
                <button className="btn-primary" onClick={() => handleOpenLessonModal()}>
                  <Plus size={18} /> Add New Lesson
                </button>
              </div>

              {['Beginner', 'Intermediate', 'Advanced'].map(level => {
                const levelLessons = lessons.filter(l => l.level === level);
                if (levelLessons.length === 0) return null;
                
                return (
                  <div key={level} style={{ marginBottom: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`level-badge ${level.toLowerCase()}`}>{level}</span> Track
                    </h3>
                    
                    {[
                      { name: 'Unit 1', range: [0, 7] },
                      { name: 'Unit 2', range: [7, 14] },
                      { name: 'Unit 3', range: [14, 21] },
                      { name: 'Unit 4', range: [21, 100] }
                    ].map((unit) => {
                      const unitLessons = levelLessons.slice(unit.range[0], unit.range[1]);
                      if (unitLessons.length === 0) return null;
                      
                      return (
                        <div key={unit.name} style={{ marginBottom: '1.5rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                          <h4 style={{ margin: '0 0 1rem 0', color: '#475569' }}>{unit.name}</h4>
                          <div className="lessons-grid">
                            {unitLessons.map((lesson, localIdx) => {
                              const globalIdx = unit.range[0] + localIdx;
                              return (
                                <div className="lesson-card" key={lesson.lesson_id}>
                                  <div className="lesson-card-header">
                                    <span style={{ fontSize: '0.8rem', color: '#6b7280', fontWeight: '500' }}>#{globalIdx + 1}</span>
                                    <div className="lesson-actions">
                                      <button onClick={() => handleReorderLesson(level, globalIdx, 'left')} title="Move Earlier" disabled={globalIdx === 0}><ArrowLeft size={16} /></button>
                                      <button onClick={() => handleReorderLesson(level, globalIdx, 'right')} title="Move Later" disabled={globalIdx === levelLessons.length - 1}><ArrowRight size={16} /></button>
                                      <button onClick={() => handleOpenAssignModal(lesson)} title="Track & Assign" style={{ color: '#8b5cf6' }}><BookOpen size={16} /></button>
                                      <button onClick={() => handleDeleteLesson(lesson.lesson_id)} className="text-danger" title="Delete"><Trash2 size={16} /></button>
                                    </div>
                                  </div>
                                  <h3>{lesson.title}</h3>
                                  <div className="lesson-stats">
                                    <Users size={16} /> <span>{lesson.completions || 0} Completions</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                );
              })}
              
              {lessons.length === 0 && <div className="no-data-card">No lessons available. Create one to get started!</div>}
            </div>
          )}

          {/* TAB: GAMES */}
          {activeTab === 'games' && (
            <div className="tab-games">
              <div className="section-header">
                <h2>Gamification & Activities Config</h2>
              </div>
              <div className="settings-card">
                <div className="settings-options">
                  <div className="setting-row">
                    <div>
                      <strong>Global Point Multiplier</strong>
                      <p className="setting-desc">Multiply all XP gained from games (FruitCatcher, SoundMatcher).</p>
                    </div>
                    <select className="form-select-sm">
                      <option>1x (Default)</option>
                      <option>1.5x</option>
                      <option>2x (Double XP Event)</option>
                    </select>
                  </div>
                  <div className="setting-row">
                    <div>
                      <strong>FruitCatcher Drop Speed Base</strong>
                      <p className="setting-desc">Base speed of falling objects in milliseconds.</p>
                    </div>
                    <input type="number" defaultValue="2000" className="form-input-sm" />
                  </div>
                  <div className="setting-row">
                    <div>
                      <strong>Enable Weekend Quests</strong>
                      <p className="setting-desc">Automatically push special weekend challenges to students.</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" defaultChecked />
                      <span className="slider round"></span>
                    </label>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <button className="btn-primary" onClick={() => alert('Game settings saved successfully!')}><Save size={16} /> Save Game Configs</button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BROADCAST */}
          {activeTab === 'broadcast' && (
            <div className="tab-broadcast">
              <div className="broadcast-layout-grid">
                <div className="broadcast-compose">
                  <div className="settings-card">
                    <h2><Megaphone size={24} style={{color: '#3b82f6', verticalAlign: 'middle', marginRight: '8px'}}/> Compose Broadcast</h2>
                    <p>Send an announcement to all students across the platform.</p>
                    <form onSubmit={handleSendAnnouncement} className="modal-form" style={{padding: 0, marginTop: '1.5rem'}}>
                      <div className="form-group">
                        <label>Target Audience</label>
                        <select value={newAnnouncement.target_user_id} onChange={e => setNewAnnouncement({...newAnnouncement, target_user_id: e.target.value})} style={{ marginBottom: '1rem', width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                          <option value="">All Users (Global)</option>
                          {students.map(student => (
                            <option key={student.user_id} value={student.user_id}>
                              {student.name} ({student.email})
                            </option>
                          ))}
                        </select>

                        <label>Announcement Title</label>
                        <input required type="text" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} placeholder="e.g., Weekly Maintenance Scheduled" />
                      </div>
                      <div className="form-group">
                        <label>Message Content</label>
                        <textarea required rows="4" value={newAnnouncement.message} onChange={e => setNewAnnouncement({...newAnnouncement, message: e.target.value})} placeholder="Enter the announcement details here..."></textarea>
                      </div>
                      <div className="text-right">
                        <button type="submit" className="btn-primary"><Bell size={16}/> Send Broadcast</button>
                      </div>
                    </form>
                  </div>
                </div>
                
                <div className="broadcast-history">
                  <div className="admin-chart-card">
                    <h3>Recent Announcements</h3>
                    <div className="announcement-list">
                      {announcements.length > 0 ? announcements.map(ann => (
                        <div className="announcement-item" key={ann.id} style={{ position: 'relative' }}>
                          <button 
                            onClick={() => handleDeleteAnnouncement(ann.id)}
                            className="btn-icon danger" 
                            style={{ position: 'absolute', top: '1rem', right: '1rem' }}
                            title="Delete Announcement"
                          >
                            <Trash2 size={16} />
                          </button>
                          <h4>{ann.title}</h4>
                          <span style={{ display: 'inline-block', background: ann.target_user_name ? '#bfdbfe' : '#fef08a', color: ann.target_user_name ? '#1e40af' : '#854d0e', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                            For: {ann.target_user_name ? ann.target_user_name : 'All Users'}
                          </span>
                          <p>{ann.message}</p>
                          <span className="ann-date">{new Date(ann.created_at).toLocaleString()}</span>
                        </div>
                      )) : <p className="no-data">No announcements sent yet.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="tab-settings">
              <div className="settings-card">
                <h2>Platform Settings</h2>
                <p>Advanced configuration and simulation options will be available here.</p>
                <div className="settings-options">
                  <div className="setting-row">
                    <div>
                      <strong>Maintenance Mode</strong>
                      <p className="setting-desc">Blocks student access during updates.</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={platformSettings.maintenance_mode === 'true'} onChange={() => handleToggleSetting('maintenance_mode')} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="setting-row">
                    <div>
                      <strong>Enable Global Leaderboard</strong>
                      <p className="setting-desc">Show competitive rankings to students.</p>
                    </div>
                    <label className="switch">
                      <input type="checkbox" checked={platformSettings.enable_leaderboard === 'true'} onChange={() => handleToggleSetting('enable_leaderboard')} />
                      <span className="slider round"></span>
                    </label>
                  </div>
                  <div className="setting-row">
                    <div>
                      <strong>AI Strictness Level</strong>
                      <p className="setting-desc">How rigorously AI feedback evaluates pronunciation & writing.</p>
                    </div>
                    <select 
                      className="form-select-sm" 
                      value={platformSettings.ai_strictness || 'medium'}
                      onChange={(e) => setPlatformSettings(prev => ({...prev, ai_strictness: e.target.value}))}
                    >
                      <option value="low">Lenient (Beginner Friendly)</option>
                      <option value="medium">Medium (Standard)</option>
                      <option value="high">Strict (Advanced)</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 text-right">
                  <button className="btn-primary" onClick={handleSaveSettings}><Save size={16} /> Save All Settings</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* STUDENT DETAILS MODAL */}
      {showStudentModal && (
        <div className="modal-overlay" onClick={() => setShowStudentModal(false)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Student Profile</h2>
              <button className="close-btn" onClick={() => setShowStudentModal(false)}><X size={24} /></button>
            </div>
            <div className="modal-body">
              {loadingDetails ? <div className="spinner"></div> : studentDetails && (
                <div className="student-details-grid">
                  <div className="detail-card profile-info">
                    <div className="profile-avatar-large">{studentDetails.profile.name.charAt(0)}</div>
                    <h3>{studentDetails.profile.name}</h3>
                    <p>{studentDetails.profile.email}</p>
                    <div className="profile-tags">
                      <span className="tag">{studentDetails.profile.preferred_language}</span>
                      <span className="tag">{studentDetails.profile.proficiency_level}</span>
                    </div>
                    <p className="joined-date"><Calendar size={14}/> Joined {new Date(studentDetails.profile.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="detail-card skills-info">
                    <h3>Skill Breakdown</h3>
                    <div className="skills-bars">
                      {studentDetails.skillsProgress.length > 0 ? studentDetails.skillsProgress.map((skill, idx) => (
                        <div className="skill-bar-row" key={idx}>
                          <span className="skill-name">{skill.skill}</span>
                          <div className="skill-track">
                            <div className="skill-fill" style={{width: `${skill.avgScore}%`, backgroundColor: '#3b82f6'}}></div>
                          </div>
                          <span className="skill-val">{parseFloat(skill.avgScore).toFixed(0)}%</span>
                        </div>
                      )) : <p>No assessment data yet.</p>}
                    </div>
                  </div>

                  <div className="detail-card history-info">
                    <h3>Completed Lessons</h3>
                    <ul className="history-list">
                      {studentDetails.completedLessons.length > 0 ? studentDetails.completedLessons.map(lesson => (
                        <li key={lesson.lesson_id}>
                          <Book size={16} /> <span>{lesson.title}</span>
                          <span className="date">{new Date(lesson.last_accessed).toLocaleDateString()}</span>
                        </li>
                      )) : <p>No completed lessons.</p>}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {showAddStudentModal && (
        <div className="modal-overlay" onClick={() => setShowAddStudentModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Student</h2>
              <button className="close-btn" onClick={() => setShowAddStudentModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAddStudent} className="modal-form">
              <div className="form-group">
                <label>Name</label>
                <input required type="text" value={newStudentFormData.name} onChange={e => setNewStudentFormData({...newStudentFormData, name: e.target.value})} placeholder="Full Name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input required type="email" value={newStudentFormData.email} onChange={e => setNewStudentFormData({...newStudentFormData, email: e.target.value})} placeholder="Email Address" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input required type="password" value={newStudentFormData.password} onChange={e => setNewStudentFormData({...newStudentFormData, password: e.target.value})} placeholder="Temporary Password" />
              </div>
              <div className="form-group">
                <label>Preferred Language</label>
                <select value={newStudentFormData.preferred_language} onChange={e => setNewStudentFormData({...newStudentFormData, preferred_language: e.target.value})}>
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mwr">Marwadi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="bn">Bengali</option>
                  <option value="mr">Marathi</option>
                  <option value="ur">Urdu</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddStudentModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Add Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirm.isOpen && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm({ isOpen: false, type: null, id: null })}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h2>Confirm Deletion</h2>
              <button className="close-btn" onClick={() => setDeleteConfirm({ isOpen: false, type: null, id: null })}><X size={24} /></button>
            </div>
            <div className="modal-body" style={{ padding: '1rem', textAlign: 'center' }}>
              <Trash2 size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                Are you sure you want to delete this {deleteConfirm.type}?
              </p>
              <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                This action is permanent and cannot be undone. All associated data will be lost.
              </p>
              <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: '1rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setDeleteConfirm({ isOpen: false, type: null, id: null })}>Cancel</button>
                <button type="button" className="btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }} onClick={executeDelete}>Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assign / Track Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Track & Assign: {assignLesson?.title}</h2>
              <button className="close-btn" onClick={() => setShowAssignModal(false)}><X size={24} /></button>
            </div>
            <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {lessonStudents.length === 0 ? <p>Loading students...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  {lessonStudents.map(student => (
                    <div key={student.user_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <div>
                        <strong style={{ display: 'block', color: '#1e293b' }}>{student.name}</strong>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{student.email}</span>
                      </div>
                      <div>
                        {student.completion_status === 'Completed' && <span className="status-pill active" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><CheckCircle size={14}/> Completed</span>}
                        {student.completion_status === 'Assigned' && <span className="status-pill" style={{ background: '#fef08a', color: '#854d0e', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><BookOpen size={14} /> Assigned</span>}
                        {student.completion_status === 'In Progress' && <span className="status-pill" style={{ background: '#bfdbfe', color: '#1e40af', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Activity size={14}/> In Progress</span>}
                        {student.completion_status === 'Not Started' && (
                          <button 
                            className="btn-primary" 
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                            onClick={() => handleAssignLesson(student.user_id)}
                          >
                            Assign Lesson
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LESSON MODAL */}
      {showLessonModal && (
        <div className="modal-overlay" onClick={() => setShowLessonModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingLesson ? 'Edit Lesson' : 'Create New Lesson'}</h2>
              <button className="close-btn" onClick={() => setShowLessonModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveLesson} className="modal-form">
              <div className="form-group">
                <label>Lesson Title</label>
                <input required type="text" value={lessonFormData.title} onChange={e => setLessonFormData({...lessonFormData, title: e.target.value})} placeholder="e.g., Basic Greetings" />
              </div>
              <div className="form-group">
                <label>Difficulty Level</label>
                <select value={lessonFormData.level} onChange={e => setLessonFormData({...lessonFormData, level: e.target.value})}>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
              <div className="form-group">
                <label>Content (JSON format for templates)</label>
                <textarea 
                  rows="5" 
                  value={typeof lessonFormData.content_data === 'string' ? lessonFormData.content_data : JSON.stringify(lessonFormData.content_data, null, 2)}
                  onChange={e => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setLessonFormData({...lessonFormData, content_data: parsed});
                    } catch (err) {
                      setLessonFormData({...lessonFormData, content_data: e.target.value});
                    }
                  }}
                  placeholder='{"intro": "Hello means Namaste"}'
                ></textarea>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowLessonModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editingLesson ? 'Save Changes' : 'Create Lesson'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;
