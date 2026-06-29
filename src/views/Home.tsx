import type { AppUser } from '../types';
import { Button } from '../components/ui/Button';
import { Header } from '../components/Header';
import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { api } from '../api/client';
import { ArrowUpRight, Plus, Package } from 'lucide-react';

interface HomeProps {
  onNavigate: (view: string) => void;
  balance: string;
  user: AppUser | null;
  refreshUser?: () => Promise<void>;
}

export const Home: React.FC<HomeProps> = ({ onNavigate, balance, user, refreshUser }) => {
  const [showDailyReward, setShowDailyReward] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [timeToNextReward, setTimeToNextReward] = useState('00:00:00');
  const [canClaim, setCanClaim] = useState(false);

  useEffect(() => {
    if (user) {
      const now = Math.floor(Date.now() / 1000);
      const oneDay = 24 * 60 * 60;
      
      const updateTimer = () => {
        const currentNow = Math.floor(Date.now() / 1000);
        if (!user.lastClaimDate || (currentNow - user.lastClaimDate) >= oneDay) {
          setCanClaim(true);
          setTimeToNextReward('Ready to claim!');
        } else {
          setCanClaim(false);
          const nextClaim = user.lastClaimDate + oneDay;
          const diff = nextClaim - currentNow;
          if (diff <= 0) {
            setCanClaim(true);
            setTimeToNextReward('Ready to claim!');
          } else {
            const h = Math.floor(diff / 3600).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
            const s = (diff % 60).toString().padStart(2, '0');
            setTimeToNextReward(`${h}:${m}:${s}`);
          }
        }
      };
      
      updateTimer();
      const timerInterval = setInterval(updateTimer, 1000);
      
      if (!user.lastClaimDate || (now - user.lastClaimDate) >= oneDay) {
        setShowDailyReward(true);
      }
      
      return () => clearInterval(timerInterval);
    }
  }, [user]);

  const firstName = user?.firstName || 'Trader';
  return (
    <div style={{ paddingBottom: '100px' }}>
      
      <div style={{ padding: '20px' }}>
        {/* Header - ALGOMIND & SPIN */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ background: '#fff', borderRadius: '8px', padding: '4px' }}>
              <span style={{ color: '#000', fontWeight: 'bold', fontSize: '12px' }}>Algo</span>
            </div>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>ALGOMIND</span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '16px', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
            <span style={{ fontSize: '16px' }}>🎡</span>
            <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#f39c12' }}>SPIN</span>
          </div>
        </div>

        {/* Profile Info */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Your AI is analyzing the market</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{firstName}</div>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)', boxShadow: '0 0 8px var(--accent-green)' }} className="animate-pulse" />
          </div>
        </div>

        {/* Balance Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '4px' }}>TOTAL BALANCE</div>
          <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '12px', lineHeight: 1 }}>${balance}</div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(138, 43, 226, 0.1)', color: '#b19cd9', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(138, 43, 226, 0.3)' }}>
            🎁 $5.50 locked bonus
          </div>
        </div>

        {/* 3-Column Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
          <Card variant="solid" padding="sm" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>AVAILABLE</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>$1</div>
          </Card>
          <Card variant="solid" padding="sm" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>INVEST</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>$5</div>
          </Card>
          <Card variant="solid" padding="sm" style={{ textAlign: 'center', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '4px' }}>EARNED</div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--accent-green)' }}>$6</div>
          </Card>
        </div>

        {/* Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
          <button 
            onClick={() => onNavigate('deposit')}
            style={{ 
              background: 'linear-gradient(135deg, #2ecc71, #27ae60)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '16px', 
              padding: '16px', 
              fontSize: '16px', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <Plus size={20} /> Deposit
          </button>
          <button 
            onClick={() => onNavigate('withdraw')}
            style={{ 
              background: 'var(--bg-card-solid)', 
              color: '#fff', 
              border: '1px solid var(--border-color)', 
              borderRadius: '16px', 
              padding: '16px', 
              fontSize: '16px', 
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              cursor: 'pointer'
            }}
          >
            <ArrowUpRight size={20} color="var(--accent-purple)" /> Withdraw
          </button>
        </div>

        {/* Path to $165 */}
        <Card variant="solid" style={{ marginBottom: '16px' }}>
          <div className="flex-between" style={{ marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Your path to $165</span>
            <span style={{ fontSize: '12px', color: '#f39c12' }}>Ends Sunday</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--accent-green)', color: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✓</div>
            <div style={{ height: '2px', background: 'rgba(255,255,255,0.1)', flex: 1 }} />
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid var(--accent-blue)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>2</div>
            <div style={{ height: '2px', background: 'rgba(255,255,255,0.1)', flex: 1 }} />
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>3</div>
            <div style={{ flex: 3, fontSize: '14px', fontWeight: 600, marginLeft: '8px' }}>Step 2: Make your first deposit</div>
            <div style={{ color: 'var(--accent-blue)' }}>→</div>
          </div>
        </Card>

        {/* Bonus Banner */}
        <Card variant="green" style={{ marginBottom: '16px', cursor: 'pointer' }} onClick={() => onNavigate('deposit-rewards')}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '1px' }}>
            🎁 100% Deposit Bonus
          </div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>Hi, {firstName} 👋</h1>
          <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Double your first deposit</h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '16px' }}>Deposit $50+, we match it instantly.</p>
          <div style={{ color: '#000', fontWeight: 600, fontSize: '14px', background: '#fff', padding: '8px 16px', borderRadius: '24px', display: 'inline-block' }}>Claim bonus →</div>
        </Card>

        <Card variant="solid" style={{ marginBottom: '16px' }} onClick={() => setShowDailyReward(true)}>
          <div className="flex-between" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'var(--gradient-primary)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎁</div>
              <div>
                <div style={{ fontWeight: 'bold' }}>Daily reward</div>
                <div style={{ fontSize: '12px', color: canClaim ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                  {canClaim ? 'Claim now!' : `Next in ${timeToNextReward}`}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#f39c12', fontWeight: 'bold' }}>🔥 {user?.dailyStreak || 0}</span>
              <span style={{ color: 'var(--text-secondary)' }}>&gt;</span>
            </div>
          </div>
        </Card>
        
        {/* Gift Boxes */}
        <Card variant="solid" style={{ marginBottom: '32px' }}>
          <div className="flex-between" style={{ cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ background: 'rgba(243, 156, 18, 0.2)', color: '#f39c12', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 'bold' }}>Open your gift boxes</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  0 boxes available
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)' }}>&gt;</span>
            </div>
          </div>
        </Card>

      </div>

      {/* Daily Reward Modal Overlay */}
      {showDailyReward && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 200, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-card-solid)', width: '100%', maxWidth: 'var(--max-width)', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px', paddingBottom: '48px', border: '1px solid var(--border-color)' }}>
            <div className="flex-between" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Card style={{ 
                  background: 'linear-gradient(135deg, #1abc9c, #2ecc71)', 
                  border: 'none', 
                  marginBottom: '20px', 
                  padding: '24px',
                  cursor: 'pointer' 
                }} onClick={() => onNavigate('deposit-rewards')}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff' }}>🎁</div>
                </Card>
                <div>
                  <h2 style={{ fontSize: '20px', marginBottom: '4px' }}>Daily reward</h2>
                  <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Check in every day, your streak grows</p>
                </div>
              </div>
              <div 
                style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                onClick={() => setShowDailyReward(false)}
              >
                ✕
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
              {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                const isCurrent = day === ((user?.dailyStreak || 0) % 7) + 1;
                return (
                  <div key={day} style={{ 
                    flex: '1', minWidth: '45px', border: isCurrent ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)', 
                    borderRadius: '12px', padding: '8px 4px', textAlign: 'center', 
                    background: isCurrent ? 'rgba(65, 105, 225, 0.1)' : 'transparent'
                  }}>
                    <div style={{ fontWeight: 'bold', fontSize: '14px' }}>${day === 1 || day === 2 ? '0.5' : day === 3 || day === 4 ? '1' : day === 5 ? '1.5' : day === 6 ? '2' : '3'}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>D{day}</div>
                  </div>
                );
              })}
            </div>
            
            <Button fullWidth onClick={async () => {
              if (!canClaim) {
                setShowDailyReward(false);
                return;
              }
              if (refreshUser) {
                setClaiming(true);
                try {
                  await api.claimDailyReward();
                  await refreshUser();
                  setCanClaim(false);
                } catch (e) {
                  console.error(e);
                } finally {
                  setClaiming(true);
                }
              }
              setShowDailyReward(false);
            }} disabled={claiming}>
              {claiming ? 'Claiming...' : canClaim ? 'Claim Reward' : 'Come back tomorrow'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
