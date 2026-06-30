import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { Header } from '../components/Header';
import { api } from '../api/client';
import type { AppUser } from '../types';

interface SpinWheelProps {
  onBack: () => void;
  user: AppUser | null;
  refreshUser: () => Promise<void>;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({ onBack, user, refreshUser }) => {
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState<{ amount: number; cost: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [canFreeSpin, setCanFreeSpin] = useState(false);
  const [timeToNextSpin, setTimeToNextSpin] = useState('');

  useEffect(() => {
    if (user) {
      const updateTimer = () => {
        const now = Math.floor(Date.now() / 1000);
        const oneDay = 24 * 60 * 60;
        if (!user.lastSpinDate || (now - user.lastSpinDate) >= oneDay) {
          setCanFreeSpin(true);
          setTimeToNextSpin('Available now!');
        } else {
          setCanFreeSpin(false);
          const nextSpin = user.lastSpinDate + oneDay;
          const diff = nextSpin - now;
          if (diff <= 0) {
            setCanFreeSpin(true);
            setTimeToNextSpin('Available now!');
          } else {
            const h = Math.floor(diff / 3600).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
            const s = (diff % 60).toString().padStart(2, '0');
            setTimeToNextSpin(`${h}h ${m}m ${s}s`);
          }
        }
      };
      
      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleSpin = async (isPaid: boolean) => {
    if (spinning) return;
    
    if (isPaid && (user?.balance || 0) < 1) {
      setError('Insufficient balance for a paid spin ($1.00 required).');
      return;
    }

    setSpinning(true);
    setReward(null);
    setError(null);

    // Initial spin animation without stopping
    const initialSpinRotations = 10; 
    setRotation(prev => prev + initialSpinRotations * 360);

    try {
      const res = await api.spinWheel(isPaid);
      
      const finalRotations = 3 * 360; 
      const stopAngle = Math.floor(Math.random() * 360);
      
      setTimeout(async () => {
        setRotation(prev => prev + finalRotations + stopAngle);
        setTimeout(async () => {
          setReward({ amount: res.rewardAmount, cost: res.cost });
          await refreshUser();
          setSpinning(false);
        }, 2000); 
      }, 1000);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to spin');
      setSpinning(false);
    }
  };

  const segments = [
    { label: 'JACKPOT', color: '#f39c12' },
    { label: 'SMALL', color: '#3498db' },
    { label: 'MEDIUM', color: '#9b59b6' },
    { label: 'SMALL', color: '#e74c3c' },
    { label: 'BIG', color: '#2ecc71' },
    { label: 'SMALL', color: '#e67e22' },
  ];

  return (
    <div style={{ paddingBottom: '120px', display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'linear-gradient(180deg, #1a0b2e 0%, #110524 100%)' }}>
      <Header showBack onBack={onBack} title="Spin & Win" />

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ border: '1px solid rgba(241, 196, 15, 0.5)', borderRadius: '20px', padding: '4px 16px', color: '#f1c40f', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '32px', marginTop: '16px' }}>
          ● DAILY PRIZES
        </div>

        <h1 style={{ fontSize: '28px', textAlign: 'center', marginBottom: '16px', lineHeight: '1.2' }}>
          Spin the wheel for<br/>Real USDT Rewards
        </h1>

        <div style={{ position: 'relative', width: '280px', height: '280px', marginBottom: '40px', marginTop: '20px' }}>
          <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '15px solid transparent', borderRight: '15px solid transparent', borderTop: '30px solid #fff', zIndex: 10, filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.5))' }} />
          
          <div style={{
            width: '100%', height: '100%', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.2)',
            background: 'conic-gradient(#f39c12 0 60deg, #3498db 60deg 120deg, #9b59b6 120deg 180deg, #e74c3c 180deg 240deg, #2ecc71 240deg 300deg, #e67e22 300deg 360deg)',
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? 'transform 3s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)',
            boxShadow: '0 0 40px rgba(241, 196, 15, 0.2), inset 0 0 20px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {segments.map((s, i) => {
              const rot = i * 60 + 30;
              return (
                <div key={i} style={{
                  position: 'absolute', top: '0', left: '50%', transform: `translateX(-50%) rotate(${rot}deg)`, transformOrigin: '50% 140px',
                  height: '140px', display: 'flex', alignItems: 'flex-start', paddingTop: '20px', fontWeight: 'bold', color: 'rgba(255,255,255,0.9)', fontSize: '14px', textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>
                  {s.label}
                </div>
              )
            })}
            
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '40px', height: '40px', borderRadius: '50%', background: '#110524', border: '4px solid #fff', zIndex: 5, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>
              ✦
            </div>
          </div>
        </div>

        {reward && (
          <div style={{ background: 'rgba(46, 204, 113, 0.2)', color: 'var(--accent-green)', padding: '16px', borderRadius: '16px', marginBottom: '24px', textAlign: 'center', animation: 'slideUp 0.3s ease-out', border: '1px solid var(--accent-green)', width: '100%' }}>
            <h2 style={{ fontSize: '24px', marginBottom: '4px' }}>+${reward.amount.toFixed(2)} USDT</h2>
            <p style={{ fontSize: '14px' }}>
              {reward.cost > 0 ? `Cost $${reward.cost.toFixed(2)}. Net: $${(reward.amount - reward.cost).toFixed(2)}` : 'Added to your balance!'}
            </p>
          </div>
        )}

        {error && (
          <div style={{ color: '#e74c3c', marginBottom: '24px', background: 'rgba(231, 76, 60, 0.1)', padding: '12px', borderRadius: '8px', width: '100%', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', width: '100%' }}>
          <Button 
            variant="outline"
            disabled={!canFreeSpin || spinning} 
            onClick={() => handleSpin(false)}
            style={{ display: 'flex', flexDirection: 'column', padding: '12px', borderColor: canFreeSpin ? 'var(--accent-green)' : 'var(--border-color)', color: canFreeSpin ? 'var(--accent-green)' : 'var(--text-secondary)' }}
          >
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Free Spin</span>
            <span style={{ fontSize: '10px', marginTop: '4px', opacity: 0.8 }}>{timeToNextSpin}</span>
          </Button>

          <Button 
            disabled={spinning || (user?.balance || 0) < 1}
            onClick={() => handleSpin(true)}
            style={{ background: 'linear-gradient(135deg, #f39c12, #e67e22)', display: 'flex', flexDirection: 'column', padding: '12px' }}
          >
            <span style={{ fontSize: '16px', fontWeight: 'bold' }}>Paid Spin</span>
            <span style={{ fontSize: '10px', marginTop: '4px', opacity: 0.9 }}>Cost: $1.00 (1.5x Multiplier)</span>
          </Button>
        </div>

      </div>
    </div>
  );
};
