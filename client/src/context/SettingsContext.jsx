import React, { createContext, useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';

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
    appLanguage: 'en'
  });
  const [loading, setLoading] = useState(true);

  // Fetch settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch('/api/settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
          if (data.appLanguage && data.appLanguage !== i18n.language) {
            i18n.changeLanguage(data.appLanguage);
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

    if (key === 'appLanguage') {
      i18n.changeLanguage(value);
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch('/api/settings', {
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
    <SettingsContext.Provider value={{ settings, updateSetting, loading }}>
      {children}
    </SettingsContext.Provider>
  );
};
