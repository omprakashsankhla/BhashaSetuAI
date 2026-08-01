import React, { useState, useEffect } from 'react';
import { Award, RefreshCw, CheckCircle, Plus, Minus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BAZAAR_ITEMS = {
  hi: [
    { name: 'टमाटर', price: 20, emoji: '🍅' },
    { name: 'आलू', price: 10, emoji: '🥔' },
    { name: 'प्याज़', price: 15, emoji: '🧅' }
  ],
  ur: [
    { name: 'ٹماٹر', price: 20, emoji: '🍅' },
    { name: 'آلو', price: 10, emoji: '🥔' },
    { name: 'پیاز', price: 15, emoji: '🧅' }
  ],
  en: [
    { name: 'tomatoes', price: 20, emoji: '🍅' },
    { name: 'potatoes', price: 10, emoji: '🥔' },
    { name: 'onions', price: 15, emoji: '🧅' }
  ]
};

const CUSTOMERS_HINDI = [
  { dialogue: 'नमस्ते! मुझे 2 किलो टमाटर और 1 किलो आलू चाहिए।', targetTomatoes: 2, targetPotatoes: 1, targetOnions: 0, bill: 50 },
  { dialogue: 'सुनिए, मुझे 1 किलो टमाटर और 2 किलो प्याज़ दे दीजिए।', targetTomatoes: 1, targetPotatoes: 0, targetOnions: 2, bill: 50 },
  { dialogue: 'भैया, मुझे 3 किलो आलू और 1 किलो प्याज़ तोल दीजिए।', targetTomatoes: 0, targetPotatoes: 3, targetOnions: 1, bill: 45 }
];

const CUSTOMERS_URDU = [
  { dialogue: 'سلام! مجھے 2 کلو ٹماٹر اور 1 کلو آلو چاہیے۔', targetTomatoes: 2, targetPotatoes: 1, targetOnions: 0, bill: 50 },
  { dialogue: 'سنیے، مجھے 1 کلو ٹماٹر اور 2 کلو پیاز دے دیجیے۔', targetTomatoes: 1, targetPotatoes: 0, targetOnions: 2, bill: 50 },
  { dialogue: 'بھیا، مجھے 3 کلو آلو اور 1 کلو پیاز تول دیجیے۔', targetTomatoes: 0, targetPotatoes: 3, targetOnions: 1, bill: 45 }
];

const CUSTOMERS_ENGLISH = [
  { dialogue: 'Hello! I need 2 kg tomatoes and 1 kg potatoes.', targetTomatoes: 2, targetPotatoes: 1, targetOnions: 0, bill: 50 },
  { dialogue: 'Excuse me, please give me 1 kg tomatoes and 2 kg onions.', targetTomatoes: 1, targetPotatoes: 0, targetOnions: 2, bill: 50 },
  { dialogue: 'Brother, please weigh 3 kg potatoes and 1 kg onions for me.', targetTomatoes: 0, targetPotatoes: 3, targetOnions: 1, bill: 45 }
];

const getItems = (lang) => BAZAAR_ITEMS[lang] || BAZAAR_ITEMS['hi'] || BAZAAR_ITEMS['en'];
const getCustomers = (lang) => {
  if (lang === 'ur') return CUSTOMERS_URDU;
  if (lang === 'hi' || lang === 'mwr' || lang === 'mr') return CUSTOMERS_HINDI;
  return CUSTOMERS_ENGLISH;
};

const ShopKeeper = ({ onGameComplete }) => {
  const { i18n } = useTranslation();

  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [customerIdx, setCustomerIdx] = useState(0);
  const [basket, setBasket] = useState({ tomatoes: 0, potatoes: 0, onions: 0 });
  const [billInput, setBillInput] = useState('');
  const [result, setResult] = useState(null); // 'correct' | 'incorrect'
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const fetchGameData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const targetLang = storedUser.preferred_language || 'hi';
      const interfaceLang = i18n.language || 'en';
      
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/activities/game-data/shopkeeper?lang=${targetLang}&interfaceLang=${interfaceLang}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.items && data.customers) {
          setItems(data.items);
          setCustomers(data.customers);
        }
      }
    } catch (e) {
      console.error('Error loading shopkeeper data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameData();
  }, []);

  const currentCustomer = customers[customerIdx];

  const updateQuantity = (itemType, delta) => {
    if (result === 'correct') return;
    setBasket(prev => ({
      ...prev,
      [itemType]: Math.max(0, prev[itemType] + delta)
    }));
  };

  const handleCheckout = () => {
    // Check quantity matching and correct total bill calculations
    const tomatoesMatched = basket.tomatoes === currentCustomer.targetTomatoes;
    const potatoesMatched = basket.potatoes === currentCustomer.targetPotatoes;
    const onionsMatched = basket.onions === currentCustomer.targetOnions;
    const billMatched = Number(billInput) === currentCustomer.bill;

    if (tomatoesMatched && potatoesMatched && onionsMatched && billMatched) {
      setResult('correct');
      setScore(s => s + 30);
    } else {
      setResult('incorrect');
      setTimeout(() => {
        setResult(null);
      }, 1500);
    }
  };

  const handleNext = () => {
    if (customerIdx < customers.length - 1) {
      setCustomerIdx(prev => prev + 1);
      setBasket({ tomatoes: 0, potatoes: 0, onions: 0 });
      setBillInput('');
      setResult(null);
    } else {
      setGameOver(true);
      if (onGameComplete) onGameComplete(score);
    }
  };

  const handleRestart = () => {
    setCustomerIdx(0);
    setBasket({ tomatoes: 0, potatoes: 0, onions: 0 });
    setBillInput('');
    setScore(0);
    setGameOver(false);
  };

  if (loading) {
    return (
      <div style={{ background: 'linear-gradient(135deg, #ffedd5, #fed7aa)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '600px', margin: '0 auto', border: '2px solid #fed7aa', boxSizing: 'border-box', textAlign: 'center', minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <p style={{ fontSize: '1.2rem', fontWeight: 800, color: '#c2410c' }}>Opening bazaar and translating customer orders...</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'linear-gradient(135deg, #ffedd5, #fed7aa)', borderRadius: '24px', padding: '2rem', width: '100%', maxWidth: '600px', margin: '0 auto', border: '2px solid #fed7aa', boxSizing: 'border-box', textAlign: 'center' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <span className="card-badge active" style={{ background: '#ea580c', color: 'white' }}>
          Customer {customerIdx + 1} / {customers.length}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#c2410c', fontWeight: 800 }}>
          <Award size={18} /> Score: {score}
        </div>
      </div>

      {gameOver ? (
        <div style={{ padding: '3rem 0' }}>
          <span style={{ fontSize: '4.5rem' }}>🏪</span>
          <h2 style={{ color: '#c2410c', fontSize: '1.8rem', margin: '1rem 0' }}>Bazaar Trade Completed!</h2>
          <p style={{ color: '#64748b', marginBottom: '2rem' }}>You successfully traded vegetables and earned {score} coins!</p>
          <button onClick={handleRestart} style={{ background: '#ea580c', color: 'white', border: 'none', padding: '0.8rem 1.8rem', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <RefreshCw size={16} /> Replay
          </button>
        </div>
      ) : (
        <div>
          {/* Customer Bubble */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', background: 'white', borderRadius: '20px', padding: '1.2rem 1.5rem', border: '1px solid #fed7aa', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ fontSize: '2.5rem', margin: 0 }}>👳🏽‍♂️</div>
            <div>
              <h5 style={{ margin: '0 0 0.2rem 0', color: '#c2410c', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>Customer says:</h5>
              <p style={{ margin: 0, fontSize: '1.15rem', color: '#1e293b', fontWeight: 800, lineHeight: 1.4 }}>
                "{currentCustomer?.dialogue}"
              </p>
            </div>
          </div>

          {/* Product pricing tags list */}
          <div style={{ background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '16px', padding: '1rem', display: 'flex', justifyContent: 'space-around', marginBottom: '1.5rem' }}>
            {items.map((item, idx) => (
              <div key={idx} style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 700 }}>
                {item.emoji} {item.name}: <span style={{ color: '#ea580c' }}>{item.price} coins/kg</span>
              </div>
            ))}
          </div>

          {/* Measuring Sandbox Scale */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '2rem' }}>
            {/* Tomato scale control */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '0.8rem', width: '120px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '2rem' }}>🍅</span>
              <h4 style={{ margin: '0.2rem 0', fontSize: '0.9rem', fontWeight: 700 }}>{items[0].name}</h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={() => updateQuantity('tomatoes', -1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={14} /></button>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{basket.tomatoes}</span>
                <button onClick={() => updateQuantity('tomatoes', 1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={14} /></button>
              </div>
            </div>

            {/* Potato scale control */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '0.8rem', width: '120px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '2rem' }}>🥔</span>
              <h4 style={{ margin: '0.2rem 0', fontSize: '0.9rem', fontWeight: 700 }}>{items[1].name}</h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={() => updateQuantity('potatoes', -1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={14} /></button>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{basket.potatoes}</span>
                <button onClick={() => updateQuantity('potatoes', 1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={14} /></button>
              </div>
            </div>

            {/* Onion scale control */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '0.8rem', width: '120px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
              <span style={{ fontSize: '2rem' }}>🧅</span>
              <h4 style={{ margin: '0.2rem 0', fontSize: '0.9rem', fontWeight: 700 }}>{items[2].name}</h4>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button onClick={() => updateQuantity('onions', -1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Minus size={14} /></button>
                <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{basket.onions}</span>
                <button onClick={() => updateQuantity('onions', 1)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><Plus size={14} /></button>
              </div>
            </div>
          </div>

          {/* Bill Calculation Prompt */}
          <div style={{ maxWidth: '320px', margin: '0 auto 2rem auto', textAlign: 'left' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#475569', marginBottom: '0.5rem' }}>Calculate Total Bill (coins):</label>
            <input 
              type="number"
              value={billInput}
              onChange={e => setBillInput(e.target.value)}
              disabled={result === 'correct'}
              placeholder="e.g. 50"
              style={{ width: '100%', padding: '0.8rem', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '1.1rem', fontWeight: 800, boxSizing: 'border-box' }}
            />
          </div>

          {/* Checkout Submit Trigger */}
          <button
            onClick={handleCheckout}
            disabled={result === 'correct'}
            style={{ background: '#ea580c', color: 'white', border: 'none', padding: '0.8rem 2.5rem', borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer' }}
          >
            Sell Vegetables
          </button>

          {/* Result banners */}
          {result && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem', background: result === 'correct' ? '#dcfce7' : '#fee2e2', border: `1px solid ${result === 'correct' ? '#bbf7d0' : '#fecaca'}`, animation: 'fadeIn 0.3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontWeight: 800, color: result === 'correct' ? '#14532d' : '#7f1d1d' }}>
                  {result === 'correct' ? '🎉 Transaction Successful! Customer paid!' : '❌ Incorrect measurements or bill! Re-verify math!'}
                </span>
              </div>
              {result === 'correct' && (
                <button onClick={handleNext} style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.5rem 1.5rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>
                  Next Customer →
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShopKeeper;
