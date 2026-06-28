import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import type { AppUser } from '../types';
import { api } from '../api/client';

interface BonusesProps {
  onBack: () => void;
  user?: AppUser;
  refreshUser?: () => Promise<void>;
}

export const Bonuses: React.FC<BonusesProps> = ({ onBack, user, refreshUser }) => {
  const [showRules, setShowRules] = useState(false);
  const [opening, setOpening] = useState(false);
  const [reward, setReward] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const boxes = user?.giftBoxes || 0;

  const handleOpenBox = async () => {
    if (boxes <= 0 || opening) return;
    setOpening(true);
    setReward(null);
    setError(null);

    try {
      const res = await api.openGiftBox();
      if (refreshUser) {
        await refreshUser();
      }
      setReward(res.rewardAmount);
    } catch (err: any) {
      setError(err.message || 'Failed to open box');
    } finally {
      setOpening(false);
    }
  };

  return (
    <div style={{ paddingBottom: '120px', display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(180deg, #1a0b2e 0%, #110524 100%)' }}>
      
      {/* Custom Header for this view */}
      <div className="flex-between" style={{ padding: '16px 20px', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'transparent', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}>
          <span>✕</span> Close
        </button>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ fontSize: '20px' }}>⌄</span>
          <span style={{ fontSize: '20px' }}>⋮</span>
        </div>
      </div>

      <div style={{ padding: '0 20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
        
        <div style={{ border: '1px solid rgba(241, 196, 15, 0.5)', borderRadius: '20px', padding: '4px 16px', color: '#f1c40f', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '40px' }}>
          ● FREE BONUSES
        </div>

        {/* Chest Illustration */}
        <div style={{ position: 'relative', width: '250px', height: '250px', marginBottom: '32px' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle, rgba(241,196,15,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ 
            width: '100%', 
            height: '100%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontSize: '120px', 
            filter: 'drop-shadow(0 10px 20px rgba(241,196,15,0.4))',
            animation: opening ? 'shake 0.5s ease-in-out infinite' : 'none'
          }}>
            🧰
          </div>
          {/* Sparkles/Coins placeholder */}
          <div style={{ position: 'absolute', top: '10%', left: '10%', fontSize: '30px', animation: 'pulse 2s infinite' }}>✨</div>
          <div style={{ position: 'absolute', top: '20%', right: '15%', fontSize: '24px', animation: 'pulse 2s infinite 1s' }}>🪙</div>
          <div style={{ position: 'absolute', bottom: '30%', left: '0%', fontSize: '40px', animation: 'pulse 2s infinite 0.5s' }}>💰</div>
        </div>

        {reward !== null && (
          <div style={{ background: 'rgba(46, 204, 113, 0.2)', color: 'var(--accent-green)', padding: '16px', borderRadius: '16px', marginBottom: '24px', textAlign: 'center', animation: 'slideUp 0.3s ease-out', border: '1px solid var(--accent-green)' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>+${reward.toFixed(2)} USDT</h2>
            <p style={{ fontSize: '14px' }}>Added to your balance!</p>
          </div>
        )}

        {error && (
          <div style={{ color: '#e74c3c', marginBottom: '24px', background: 'rgba(231, 76, 60, 0.1)', padding: '12px', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <h1 style={{ fontSize: '32px', textAlign: 'center', marginBottom: '16px', lineHeight: '1.2' }}>
          Open Gift Boxes,<br/>win real rewards!
        </h1>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', textAlign: 'center', marginBottom: '40px' }}>
          You have <strong style={{ color: '#f1c40f', fontSize: '20px' }}>{boxes}</strong> gift box{boxes !== 1 ? 'es' : ''} available.
        </p>

        <button 
          onClick={handleOpenBox}
          disabled={boxes <= 0 || opening}
          style={{ 
            width: '100%', 
            padding: '16px', 
            background: boxes > 0 ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)', 
            color: boxes > 0 ? '#fff' : 'var(--text-secondary)', 
            border: 'none', 
            borderRadius: '16px', 
            fontSize: '18px', 
            fontWeight: 'bold',
            cursor: boxes > 0 && !opening ? 'pointer' : 'not-allowed',
            marginBottom: '32px',
            opacity: opening ? 0.7 : 1,
            boxShadow: boxes > 0 ? '0 10px 20px rgba(88, 101, 242, 0.4)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          {opening ? 'Opening...' : boxes > 0 ? 'Open 1 Box' : 'No boxes available'}
        </button>

        <Card variant="solid" style={{ width: '100%', textAlign: 'center', padding: '24px', marginBottom: '32px', background: 'rgba(255,255,255,0.05)' }}>
          Earn boxes from your <strong style={{ color: '#f1c40f' }}>Daily Reward</strong>, deposits and invites.
        </Card>

        <button 
          onClick={() => setShowRules(true)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <span>📄</span> Rules
        </button>
      </div>

      {/* Rules Bottom Sheet / Modal */}
      {showRules && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: '24px 24px 0 0', padding: '24px', paddingBottom: '48px', animation: 'slideUp 0.3s ease-out' }}>
            
            <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', margin: '0 auto 24px auto' }} />

            <div className="flex-between" style={{ marginBottom: '24px' }}>
              <h2 style={{ fontSize: '20px' }}>Gift Box rules</h2>
              <button onClick={() => setShowRules(false)} style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontWeight: 'bold', fontSize: '16px', marginBottom: '24px' }}>
              <span style={{ color: '#f1c40f' }}>🪙</span> Every box pays out. No empty boxes.
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>How to get boxes</h3>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', listStyle: 'none', padding: 0 }}>
                <li>• Daily Reward check-in: 1 to 5 boxes a day.</li>
                <li>• 5 boxes per deposit, 20 boxes when you deposit $100 or more.</li>
                <li>• +1 box for every friend who joins and qualifies.</li>
              </ul>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>What you can win</h3>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.6', listStyle: 'none', padding: 0 }}>
                <li>• USDT goes straight to your withdrawable balance.</li>
                <li>• +50% deposit-bonus offers stack on your +20% deposit bonus.</li>
                <li>• Rare big USDT prizes.</li>
              </ul>
            </div>

            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.5', opacity: 0.8 }}>
              Rewards credit instantly. Offers expire 7 days after you win them. One offer per deposit.
            </p>
          </div>
        </div>
      )}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-5deg); }
          50% { transform: translateX(5px) rotate(5deg); }
          75% { transform: translateX(-5px) rotate(-5deg); }
        }
      `}</style>
    </div>
  );
};
