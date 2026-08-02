import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Award, Calendar, Target, BookOpen, Clock, Loader, X, Camera, Image as ImageIcon } from 'lucide-react';
import './ProfileModal.css';
import { API_BASE_URL } from '../config/api';

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mimi',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Max'
];

const ProfileModal = ({ onClose }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    preferred_language: '',
    education_level: '',
    proficiency_level: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return navigate('/');

      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setFormData({
          name: data.name || '',
          age: data.age || '',
          preferred_language: data.preferred_language || '',
          education_level: data.education_level || '',
          proficiency_level: data.proficiency_level || ''
        });
      } else {
        setError('Failed to load profile details.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while loading profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setSuccess('Profile updated successfully!');
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          const updatedUser = { ...storedUser, ...formData };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (e) {
          console.error('Failed to sync localStorage user:', e);
        }
        fetchProfile(); // refresh data
      } else {
        setError('Failed to update profile.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePresetSelect = async (url) => {
    setSaving(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...formData, avatar: url })
      });
      if (res.ok) {
        setSuccess('Avatar updated successfully!');
        fetchProfile();
      } else {
        setError('Failed to update avatar.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while updating avatar.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError(null);
    setSuccess(null);

    const data = new FormData();
    data.append('avatar', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/api/profile/upload-avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      if (res.ok) {
        setSuccess('Avatar uploaded successfully!');
        fetchProfile();
      } else {
        const d = await res.json();
        setError(d.message || 'Failed to upload avatar.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while uploading.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="profile-modal-overlay">
        <div className="profile-modal-content loading">
          <Loader className="spinner" size={40} />
          <p>Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-modal-overlay">
      <div className="profile-modal-content">
        <header className="profile-header">
          <h1>Your Profile</h1>
          <button className="close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </header>

        <div className="profile-scroll-area">
          <div className="profile-content">
            {/* Read-Only Gamification Stats Section */}
            <section className="profile-stats-card">
              <div className="stats-header" style={{ position: 'relative' }}>
                <div className="avatar-wrapper" style={{ position: 'relative' }}>
                  {profile?.avatar && profile.avatar !== '/default-avatar.png' ? (
                    <img src={profile.avatar} alt="Avatar" className="profile-avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <User size={80} className="profile-avatar" style={{ background: '#e2e8f0', padding: '1rem', borderRadius: '50%' }} />
                  )}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{ position: 'absolute', bottom: 0, right: 0, background: '#3b82f6', color: 'white', border: 'none', borderRadius: '50%', padding: '0.4rem', cursor: 'pointer', display: 'flex' }}
                    title="Upload Avatar"
                  >
                    {uploading ? <Loader size={16} className="spinner" /> : <Camera size={16} />}
                  </button>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
                </div>
                <div className="stats-header-info">
                  <h2>{profile?.name}</h2>
                  <span className="profile-role">{profile?.role || 'Learner'}</span>
                </div>
              </div>

              {/* Preset Avatars */}
              <div style={{ marginTop: '1rem', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>Or choose a preset avatar:</p>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {PRESET_AVATARS.map((url, i) => (
                    <img 
                      key={i} 
                      src={url} 
                      alt={`Preset ${i}`} 
                      onClick={() => handlePresetSelect(url)}
                      style={{ width: 45, height: 45, borderRadius: '50%', cursor: 'pointer', border: profile?.avatar === url ? '3px solid #3b82f6' : '1px solid #cbd5e1', transition: 'transform 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                  ))}
                </div>
              </div>

              <div className="stats-grid" style={{ marginTop: '1.5rem' }}>
                <div className="stat-box">
                  <Award size={24} className="stat-icon xp-icon" />
                  <div className="stat-details">
                    <span>Total XP</span>
                    <strong>{profile?.xp || 0}</strong>
                  </div>
                </div>
                <div className="stat-box">
                  <Target size={24} className="stat-icon streak-icon" />
                  <div className="stat-details">
                    <span>Streak</span>
                    <strong>{profile?.streak || 0} Days</strong>
                  </div>
                </div>
                <div className="stat-box">
                  <Clock size={24} className="stat-icon date-icon" />
                  <div className="stat-details">
                    <span>Joined</span>
                    <strong>{new Date(profile?.created_at).toLocaleDateString()}</strong>
                  </div>
                </div>
              </div>
            </section>

            {/* Mutable Profile Details Form */}
            <section className="profile-form-card">
              <h2>Account Details</h2>
              
              {error && <div className="profile-alert error">{error}</div>}
              {success && <div className="profile-alert success">{success}</div>}

              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group readonly-group">
                  <label><Mail size={16} /> Email Address (Cannot be changed)</label>
                  <input type="email" value={profile?.email || ''} disabled />
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      placeholder="Your Name"
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label>Age</label>
                    <input 
                      type="number" 
                      name="age" 
                      value={formData.age} 
                      onChange={handleInputChange} 
                      placeholder="Your Age"
                    />
                  </div>

                   <div className="form-group">
                    <label>Learning Language</label>
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

                  <div className="form-group">
                    <label>Education Level</label>
                    <input 
                      type="text" 
                      name="education_level" 
                      value={formData.education_level} 
                      onChange={handleInputChange} 
                      placeholder="e.g. High School, Bachelor's"
                    />
                  </div>
                </div>

                <button type="submit" className="save-profile-btn" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
