import React, { createContext, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config/api';

export const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const { i18n } = useTranslation();
  
  const [settings, setSettings] = useState({
    theme: 'light',
    voiceSpeed: 1,
    autoPlayAudio: true,
    dailyReminders: true,
    weeklyReports: false,
    interface_language: 'en',
    learning_language: 'hi'
  });
  const [loading, setLoading] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          
          if (data.interface_language && data.interface_language !== i18n.language) {
            i18n.changeLanguage(data.interface_language);
          }
          
          if (data.needs_language_confirmation) {
            setShowLanguageModal(true);
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, [i18n]);

  // Apply dark mode to body
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [settings.theme]);

  // Update setting value and sync with backend
  const updateSetting = async (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    if (key === 'interface_language') {
      i18n.changeLanguage(value);
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [key]: value })
      });
    } catch (err) {
      console.error('Failed to save setting:', err);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, loading, showLanguageModal, setShowLanguageModal }}>
      {children}
    </SettingsContext.Provider>
  );
};
