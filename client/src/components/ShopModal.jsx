import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Coins, ShieldCheck, User } from 'lucide-react';

const ShopModal = ({ stats, onClose }) => {
  const { t } = useTranslation();
  const [purchaseMsg, setPurchaseMsg] = useState('');

  const handleBuy = (item, cost) => {
    if (stats.coins >= cost) {
      setPurchaseMsg(t('shop_success', `Successfully purchased ${item}!`));
      // In a real app, call backend to deduct coins
    } else {
      setPurchaseMsg(t('shop_fail', `Not enough coins for ${item}.`));
    }
    setTimeout(() => setPurchaseMsg(''), 3000);
  };

  return (
    <div className="progress-modal-overlay">
      <div className="progress-modal-content" style={{ maxWidth: '600px', height: 'auto' }}>
        <header className="progress-header" style={{ borderBottom: 'none', paddingBottom: '1rem' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Coins size={28} fill="#eab308" color="#eab308" /> {t('shop_title', 'Virtual Shop')}
          </h1>
          <button className="close-btn" onClick={onClose}><X size={24} /></button>
        </header>

        <div className="progress-scroll-area" style={{ paddingTop: '0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fffbeb', border: '1px solid #fde68a', padding: '1rem 1.5rem', borderRadius: '16px', marginBottom: '2rem' }}>
            <span style={{ fontWeight: '600', color: '#92400e' }}>Your Balance</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.5rem', fontWeight: '800', color: '#b45309' }}>
              <Coins size={28} fill="#eab308" color="#eab308" /> {stats.coins}
            </div>
          </div>

          {purchaseMsg && (
            <div style={{ padding: '1rem', background: purchaseMsg.includes('Not enough') ? '#fee2e2' : '#dcfce7', color: purchaseMsg.includes('Not enough') ? '#dc2626' : '#166534', borderRadius: '12px', marginBottom: '1.5rem', textAlign: 'center', fontWeight: '600' }}>
              {purchaseMsg}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Streak Freeze */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '12px' }}>
                  <ShieldCheck size={32} color="#3b82f6" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b' }}>Streak Freeze</h3>
                  <p style={{ margin: '0', color: '#64748b', fontSize: '0.9rem', maxWidth: '250px' }}>Protects your streak from resetting if you miss one day of practice.</p>
                </div>
              </div>
              <button 
                onClick={() => handleBuy('Streak Freeze', 100)}
                style={{ background: '#f8fafc', border: '2px solid #e2e8f0', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <Coins size={18} fill="#eab308" color="#eab308" /> 100
              </button>
            </div>

            {/* Premium Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'white', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ background: '#faf5ff', padding: '1rem', borderRadius: '12px' }}>
                  <User size={32} color="#a855f7" />
                </div>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', color: '#1e293b' }}>Premium Avatar</h3>
                  <p style={{ margin: '0', color: '#64748b', fontSize: '0.9rem', maxWidth: '250px' }}>Unlock a cool customized avatar for your profile and leaderboard.</p>
                </div>
              </div>
              <button 
                onClick={() => handleBuy('Premium Avatar', 300)}
                style={{ background: '#f8fafc', border: '2px solid #e2e8f0', padding: '0.75rem 1.5rem', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.borderColor = '#a855f7'}
                onMouseOut={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              >
                <Coins size={18} fill="#eab308" color="#eab308" /> 300
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopModal;
