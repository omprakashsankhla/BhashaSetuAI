import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Globe, Moon, Sun, Volume2, Bell, Shield, Key, Trash2 } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { API_BASE_URL } from '../config/api';
import './SettingsModal.css';

const SettingsModal = ({ onClose }) => {
  const { t, i18n } = useTranslation();
  const { settings, updateSetting, loading } = useSettings();

  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [passMsg, setPassMsg] = useState('');
  
  if (loading) return null;

  const handleLanguageChange = (e) => {
    const val = e.target.value;
    updateSetting('appLanguage', val);
    i18n.changeLanguage(val);
    localStorage.setItem('i18nextLng', val);
  };

  const handleThemeToggle = () => {
    updateSetting('theme', settings.theme === 'light' ? 'dark' : 'light');
  };

  const handlePasswordChange = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/settings/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(passwordData)
      });
      const data = await res.json();
      setPassMsg(data.message);
      if (res.ok) setPasswordData({ oldPassword: '', newPassword: '' });
    } catch (err) {
      setPassMsg('Error changing password');
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to permanently delete your account? This action cannot be undone.")) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/settings/account`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          localStorage.removeItem('token');
          window.location.href = '/';
        }
      } catch (err) {
        console.error("Error deleting account", err);
      }
    }
  };

  const handlePushSubscription = async (enable) => {
    updateSetting('dailyReminders', enable);
    if (!enable) return;

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      alert("Push notifications are not supported by this browser.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        updateSetting('dailyReminders', false);
        alert("Permission not granted for notifications");
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      
      const token = localStorage.getItem('token');
      const vapidRes = await fetch(`${API_BASE_URL}/api/settings/push/vapidPublicKey`);
      const { publicKey } = await vapidRes.json();
      
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      await fetch(`${API_BASE_URL}/api/settings/push/subscribe`, {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      alert("Daily Reminders enabled! You'll receive a test notification shortly if triggered by admin.");
    } catch (e) {
      console.error("Failed to subscribe to push notifications:", e);
      updateSetting('dailyReminders', false);
    }
  };

  return (
    <div className="settings-modal-overlay">
      <div className="settings-modal-content">
        <header className="settings-header">
          <h1>Settings</h1>
          <button className="close-btn" onClick={onClose} aria-label="Close Settings">
            <X size={24} />
          </button>
        </header>

        <div className="settings-scroll-area">
          <div className="settings-grid">
            
            {/* Application Preferences */}
            <section className="settings-section">
              <h2 className="section-title"><Globe size={20} /> Application Preferences</h2>
              <div className="settings-card">
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Interface Language</h3>
                    <p>Change the language of the application text.</p>
                  </div>
                  <select className="setting-dropdown" value={settings.appLanguage || i18n.language} onChange={handleLanguageChange}>
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
                <hr className="divider" />
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Color Theme</h3>
                    <p>Switch between Light and Dark mode.</p>
                  </div>
                  <button className="theme-toggle-btn" onClick={handleThemeToggle}>
                    {settings.theme === 'light' ? <><Moon size={18}/> Dark Mode</> : <><Sun size={18}/> Light Mode</>}
                  </button>
                </div>
              </div>
            </section>

            {/* Audio & Voice Settings */}
            <section className="settings-section">
              <h2 className="section-title"><Volume2 size={20} /> Audio & Voice Settings</h2>
              <div className="settings-card">
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>AI Voice Speed</h3>
                    <p>Adjust how fast the AI Tutor speaks to you.</p>
                  </div>
                  <div className="slider-container">
                    <span className="slider-label">Slow</span>
                    <input 
                      type="range" 
                      min="0.5" max="1.5" step="0.1" 
                      value={settings.voiceSpeed ?? 1} 
                      onChange={(e) => updateSetting('voiceSpeed', parseFloat(e.target.value))} 
                      className="setting-slider"
                    />
                    <span className="slider-label">Fast</span>
                  </div>
                </div>
                <hr className="divider" />

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Auto-Play Audio</h3>
                    <p>Automatically read out the AI's responses.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.autoPlayAudio ?? true} onChange={(e) => updateSetting('autoPlayAudio', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </section>

            {/* Notifications */}
            <section className="settings-section">
              <h2 className="section-title"><Bell size={20} /> Notifications</h2>
              <div className="settings-card">
                
                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Daily Reminders</h3>
                    <p>Receive a daily push notification to maintain your learning streak.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.dailyReminders ?? true} onChange={(e) => handlePushSubscription(e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                <hr className="divider" />

                <div className="setting-item">
                  <div className="setting-info">
                    <h3>Weekly Progress Reports</h3>
                    <p>Receive a weekly email summarizing your learning progress.</p>
                  </div>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={settings.weeklyReports ?? false} onChange={(e) => updateSetting('weeklyReports', e.target.checked)} />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </section>

            {/* Account & Privacy */}
            <section className="settings-section">
              <h2 className="section-title"><Shield size={20} /> Account & Privacy</h2>
              <div className="settings-card">
                
                <div className="setting-item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div className="setting-info">
                    <h3>Change Password</h3>
                    <p>Update the password used to log into your account.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <input type="password" placeholder="Old Password" value={passwordData.oldPassword} onChange={e => setPasswordData({...passwordData, oldPassword: e.target.value})} className="setting-dropdown" />
                    <input type="password" placeholder="New Password" value={passwordData.newPassword} onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} className="setting-dropdown" />
                    <button className="action-btn secondary" onClick={handlePasswordChange}><Key size={16}/> Update</button>
                  </div>
                  {passMsg && <p style={{ color: '#ef4444', marginTop: '0.5rem', fontSize: '0.9rem' }}>{passMsg}</p>}
                </div>
                <hr className="divider" />

                <div className="setting-item">
                  <div className="setting-info">
                    <h3 className="danger-text">Delete Account</h3>
                    <p>Permanently delete your account and all learning data.</p>
                  </div>
                  <button className="action-btn danger" onClick={handleDeleteAccount}><Trash2 size={16}/> Delete Account</button>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
