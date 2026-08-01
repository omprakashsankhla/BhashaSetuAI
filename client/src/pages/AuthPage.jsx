import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGoogleLogin } from '@react-oauth/google';
import { Bot, Eye, EyeOff, BookOpen, Mic, Brain, Check } from 'lucide-react';
import './AuthPage.css';

const AuthPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    preferred_language: i18n.language || 'hi', // default learning language to active selection
    education_level: 'No formal education',
    proficiency_level: 'Beginner',
    age: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLanguageChange = () => {
    navigate('/');
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: formData.email, password: formData.password }
        : { ...formData };

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || 'An error occurred');
        return;
      }

      // Save token and user info
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      if (data.user.role === 'Admin') {
        navigate('/admin');
      } else if (data.user.has_completed_assessment) {
        navigate('/dashboard');
      } else {
        navigate('/assessment');
      }

    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to connect to the backend server.');
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setErrorMsg('');
      try {
        const res = await fetch('http://localhost:5000/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            token: tokenResponse.access_token,
            preferred_language: i18n.language
          })
        });
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.message || 'Google Auth failed');
          return;
        }
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        if (data.user.role === 'Admin') {
          navigate('/admin');
        } else if (data.user.has_completed_assessment) {
          navigate('/dashboard');
        } else {
          navigate('/assessment');
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to connect to backend during Google login');
      }
    },
    onError: () => setErrorMsg('Google login failed or was cancelled')
  });

  return (
    <div className="auth-container">
      <div className="auth-content">
        {/* Left Blue Panel */}
        <div className="auth-left-panel">
          <div className="auth-logo-area">
            <div className="auth-icon-wrapper">
              <Bot size={32} color="#1A73E8" />
            </div>
            <h1 className="auth-title">BhashaSetu</h1>
            <p className="auth-subtitle">ONE INDIA. MANY LANGUAGES. ONE AI</p>
          </div>

          <div className="auth-greeting-box">
            <h3>{t('auth_greeting_title')}</h3>
            <p>{t('auth_greeting_1')}</p>
            <p>{t('auth_greeting_2')}</p>
            <p>{t('auth_greeting_3')}</p>
            <p>{t('auth_greeting_4')}</p>
          </div>

          <div className="auth-features-pills">
            <span className="pill"><BookOpen size={14} /> {t('auth_feature_1')}</span>
            <span className="pill"><Mic size={14} /> {t('auth_feature_2')}</span>
            <span className="pill"><Brain size={14} /> {t('auth_feature_3')}</span>
          </div>

          <div className="auth-footer-info">
            <p><Check size={16} /> {t('auth_supported')}</p>
            <p><Check size={16} /> {t('auth_built_for')}</p>
            <div className="auth-lang-indicator">
              <span>{t('auth_selected_lang')}</span>
              <span className="lang-badge">{i18n.language.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Right White Panel (Form) */}
        <div className="auth-right-panel">
          <div className="auth-top-actions">
            <button className="change-lang-btn" onClick={handleLanguageChange}>
              &larr; {t('auth_change_lang')}
            </button>
          </div>

          <div className="auth-tabs">
            <button 
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              {t('tab_register')}
            </button>
            <button 
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              {t('tab_login')}
            </button>
          </div>

          <div className="auth-form-wrapper">
            <h2>{isLogin ? t('tab_login') : t('form_title_register')}</h2>
            {!isLogin && <p className="form-subtitle">{t('form_subtitle_register')}</p>}

            <form className="auth-form" onSubmit={handleFormSubmit}>
              {errorMsg && <div style={{ color: 'red', marginBottom: '10px', fontSize: '0.85rem' }}>{errorMsg}</div>}
              
              {!isLogin && (
                <div className="form-group">
                  <label>{t('label_fullname')}</label>
                  <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder={t('placeholder_fullname')} required />
                </div>
              )}

              <div className="form-group">
                <label>{t('label_email')}</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder={t('placeholder_email')} required />
              </div>

              <div className="form-group">
                <label>{t('label_password')}</label>
                <div className="password-input-wrapper">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    placeholder="••••••••••" 
                    required 
                  />
                  <button 
                    type="button" 
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="form-row">
                  <div className="form-group half">
                    <label>{t('label_learning_language', 'Learning Language')}</label>
                    <select name="preferred_language" value={formData.preferred_language} onChange={handleInputChange}>
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
                  <div className="form-group half">
                    <label>{t('label_proficiency', 'Proficiency')}</label>
                    <select name="proficiency_level" value={formData.proficiency_level} onChange={handleInputChange}>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>
              )}
              
              {!isLogin && (
                <div className="form-row">
                  <div className="form-group half">
                    <label>{t('label_education', 'Education Level')}</label>
                    <select name="education_level" value={formData.education_level} onChange={handleInputChange}>
                      <option value="No formal education">{t('edu_none', 'No formal education')}</option>
                      <option value="Primary School">Primary School</option>
                      <option value="High School">High School</option>
                      <option value="Adult literacy class">Adult literacy class</option>
                      <option value="College/University">College/University</option>
                    </select>
                  </div>
                  <div className="form-group half">
                    <label>{t('label_age', 'Age')}</label>
                    <input type="number" name="age" value={formData.age} onChange={handleInputChange} placeholder="e.g. 25" required min="4" max="120" />
                  </div>
                </div>
              )}

              <button type="submit" className="auth-submit-btn">
                {isLogin ? t('tab_login') : t('btn_create_account')}
              </button>
            </form>

            <div className="auth-divider">
              <span>{t('or_continue_with')}</span>
            </div>

            <button type="button" className="google-btn" onClick={() => loginWithGoogle()}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {t('btn_google')}
            </button>

            <div className="auth-switch-link">
              <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); }}>
                {isLogin ? t('tab_register') : t('link_login')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
