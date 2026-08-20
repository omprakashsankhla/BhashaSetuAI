import React from 'react';
import { X, Megaphone, Clock } from 'lucide-react';
import './AnnouncementsModal.css';
import { useFocusTrap } from '../hooks/useFocusTrap';

const AnnouncementsModal = ({ announcements, onClose }) => {
  const modalRef = useFocusTrap(true, onClose);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: '500px' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcements-modal-title"
        ref={modalRef}
      >
        <div className="modal-header">
          <h2 id="announcements-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Megaphone size={24} color="#3b82f6" /> 
            Announcements
          </h2>
          <button className="close-btn" onClick={onClose} aria-label="Close Announcements"><X size={24} /></button>
        </div>
        <div className="modal-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          {(!announcements || announcements.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: '#64748b' }}>
              <Megaphone size={48} color="#cbd5e1" style={{ marginBottom: '1rem' }} />
              <p>No new announcements right now.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {announcements.map((ann) => (
                <div key={ann.id} style={{
                  padding: '1rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px'
                }}>
                  <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e293b', fontSize: '1.05rem' }}>{ann.title}</h4>
                  <p style={{ margin: '0 0 0.75rem 0', color: '#475569', fontSize: '0.95rem', lineHeight: '1.5' }}>
                    {ann.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#94a3b8' }}>
                    <Clock size={12} />
                    <span>{new Date(ann.created_at).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementsModal;
