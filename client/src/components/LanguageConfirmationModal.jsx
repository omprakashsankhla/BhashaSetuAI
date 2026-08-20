import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../context/SettingsContext';
import { API_BASE_URL } from '../config/api';
import { useFocusTrap } from '../hooks/useFocusTrap';
import Button from './ui/Button';

const LanguageConfirmationModal = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { settings, updateSetting, showLanguageModal, setShowLanguageModal } = useSettings();

  // Initialize with fallback to current i18n language or defaults
  const [interfaceLang, setInterfaceLang] = useState(settings?.interface_language || i18n.language || 'en');
  const [learningLang, setLearningLang] = useState(settings?.learning_language || 'hi');
  const [loading, setLoading] = useState(false);

  const modalRef = useFocusTrap(true, null);

  if (!showLanguageModal) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Update the user profile with the new split languages
      await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          interface_language: interfaceLang,
          learning_language: learningLang
        })
      });

      // Clear the 'needs_language_confirmation' flag from settings JSON
      const currentSettings = typeof settings === 'string' ? JSON.parse(settings) : settings;
      const newSettings = { ...currentSettings };
      delete newSettings.needs_language_confirmation;
      
      await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newSettings,
          interface_language: interfaceLang // The settings PUT also handles this as we modified earlier
        })
      });

      // Sync localStorage 'user' object so all pages reading it directly get the new languages
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.interface_language = interfaceLang;
      storedUser.learning_language = learningLang;
      localStorage.setItem('user', JSON.stringify(storedUser));

      // Synchronize i18n
      i18n.changeLanguage(interfaceLang);
      localStorage.setItem('i18nextLng', interfaceLang);
      localStorage.removeItem('assessmentProgress');

      // Update local Context
      updateSetting('interface_language', interfaceLang);
      updateSetting('learning_language', learningLang);
      setShowLanguageModal(false);

    } catch (err) {
      console.error('Failed to confirm languages:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <div 
        style={modalStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lang-modal-title"
        ref={modalRef}
      >
        <h2 id="lang-modal-title" style={{ marginBottom: '10px' }}>Select Your Languages</h2>
        <p style={{ color: '#555', marginBottom: '20px', fontSize: '14px' }}>
          We've updated how languages work in BhashaSetu! You can now choose a separate language for the app interface and the language you want to learn.
        </p>

        <div style={inputGroup}>
          <label style={labelStyle}>App Interface Language</label>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '0', marginBottom: '8px' }}>The language used for menus, buttons, and instructions.</p>
          <select 
            value={interfaceLang}
            onChange={(e) => setInterfaceLang(e.target.value)}
            style={selectStyle}
          >
            <option value="en">English (English)</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="ur">اردو (Urdu)</option>
          </select>
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Language to Learn</label>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '0', marginBottom: '8px' }}>The language you are studying.</p>
          <select 
            value={learningLang}
            onChange={(e) => setLearningLang(e.target.value)}
            style={selectStyle}
          >
            <option value="hi">हिंदी (Hindi)</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="te">తెలుగు (Telugu)</option>
            <option value="bn">বাংলা (Bengali)</option>
            <option value="mr">मराठी (Marathi)</option>
            <option value="ur">اردو (Urdu)</option>
            <option value="en">English (English)</option>
          </select>
        </div>

        <Button 
          variant="primary"
          onClick={handleSave} 
          disabled={loading}
          style={{ width: '100%', marginTop: '10px' }}
        >
          {loading ? 'Saving...' : 'Confirm Languages'}
        </Button>
      </div>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  backdropFilter: 'blur(3px)'
};

const modalStyle = {
  backgroundColor: '#fff',
  padding: '30px',
  borderRadius: '24px',
  width: '90%',
  maxWidth: '450px',
  boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
  fontFamily: 'Inter, sans-serif'
};

const inputGroup = {
  marginBottom: '20px'
};

const labelStyle = {
  display: 'block',
  fontWeight: '600',
  marginBottom: '4px',
  color: '#333'
};

const selectStyle = {
  width: '100%',
  padding: '12px',
  borderRadius: '12px',
  border: '1px solid #e2e8f0',
  fontSize: '16px',
  backgroundColor: '#f8fafc',
  outline: 'none'
};

const buttonStyle = {
  width: '100%',
  padding: '14px',
  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
  color: 'white',
  border: 'none',
  borderRadius: '12px',
  fontSize: '16px',
  fontWeight: '700',
  cursor: 'pointer',
  marginTop: '10px',
  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.4)'
};

export default LanguageConfirmationModal;
