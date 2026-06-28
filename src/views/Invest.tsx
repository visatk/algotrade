import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Header } from '../components/Header';
import { Button } from '../components/ui/Button';
import { api } from '../api/client';

interface InvestProps {
  onBack: () => void;
  currentBalance: number;
  refreshUser?: () => Promise<void>;
}

export const Invest: React.FC<InvestProps> = ({ onBack, currentBalance, refreshUser }) => {
  const [amount, setAmount] = useState<number>(100);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('group');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pills = [100, 250, 500, 1000, 2500];

  const plans = [
    { id: 'fan', name: 'Fan Pass', days: 7, range: '$10–50', returnPct: 25, badge: '', icon: '⚡', iconColor: '#e67e22', bg: 'rgba(230, 126, 34, 0.1)' },
    { id: 'group', name: 'Group Stage', days: 7, range: '$51–200', returnPct: 40, badge: 'POPULAR', icon: '🌬️', iconColor: 'var(--accent-blue)', bg: 'rgba(88, 101, 242, 0.1)' },
    { id: 'round16', name: 'Round of 16', days: 7, range: '$201–500', returnPct: 60, badge: '', icon: '📈', iconColor: 'var(--accent-purple)', bg: 'rgba(138, 43, 226, 0.1)' },
    { id: 'quarter', name: 'Quarter Final', days: 7, range: '$501–2k', returnPct: 80, badge: '', icon: '🌊', iconColor: 'var(--accent-green)', bg: 'rgba(46, 204, 113, 0.1)' },
    { id: 'semi', name: 'Semi Final', days: 7, range: '$2.001k–10k', returnPct: 100, badge: '', icon: '📚', iconColor: '#9b59b6', bg: 'rgba(155, 89, 182, 0.1)' },
    { id: 'world', name: 'World Cup Final', days: 7, range: '$10k–100k', returnPct: 120, badge: 'BEST VALUE', icon: '👑', iconColor: '#f1c40f', bg: 'rgba(241, 196, 15, 0.1)' },
  ];

  const selectedPlan = plans.find(p => p.id === selectedPlanId) || plans[1];
  const returnAmount = amount * (selectedPlan.returnPct / 100);
  const totalBack = amount + returnAmount;
  
  const needsMore = amount > currentBalance;
  const deficit = amount - currentBalance;

  const handleInvest = async () => {
    if (needsMore) return;
    setLoading(true);
    setError(null);
    try {
      await api.startInvestment(selectedPlan.id, amount, returnAmount, selectedPlan.days);
      if (refreshUser) {
        await refreshUser();
      }
      onBack();
    } catch (err: any) {
      setError(err.message || 'Failed to start investment');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    outline: 'none',
  };

  function getPillStyle(selected: boolean): React.CSSProperties {
    return {
      padding: '8px 16px',
      borderRadius: '8px',
      background: selected ? 'rgba(46, 204, 113, 0.1)' : 'rgba(255,255,255,0.05)',
      color: selected ? 'var(--accent-green)' : 'var(--text-secondary)',
      border: `1px solid ${selected ? 'var(--accent-green)' : 'transparent'}`,
      fontWeight: 'bold',
      cursor: 'pointer',
      fontSize: '14px',
      minWidth: '60px'
    };
  }

  return (
    <div style={{ paddingBottom: '140px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header showBack onBack={onBack} />
      
      <div style={{ padding: '0 20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Start a Plan</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Choose amount → AI trades → you collect profit
        </p>

        {error && (
          <div style={{ background: 'rgba(231, 76, 60, 0.1)', color: '#e74c3c', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid rgba(231, 76, 60, 0.3)' }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: '32px' }}>
          <Card variant="solid" style={{ marginBottom: '16px' }}>
            <div className="flex-between" style={{ marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Investment amount</span>
              <span style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 'bold' }}>Max ${currentBalance.toFixed(2)}</span>
            </div>
            
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>$</span>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(Number(e.target.value))}
                  style={inputStyle} 
                />
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '6px 12px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>
                USDT
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {pills.map((p) => (
                <button 
                  key={p} 
                  style={getPillStyle(amount === p)}
                  onClick={() => {
                    setAmount(p);
                    if (p <= 50) setSelectedPlanId('fan');
                    else if (p <= 200) setSelectedPlanId('group');
                    else if (p <= 500) setSelectedPlanId('round16');
                    else if (p <= 2000) setSelectedPlanId('quarter');
                    else if (p <= 10000) setSelectedPlanId('semi');
                    else setSelectedPlanId('world');
                  }}
                >
                  ${p >= 1000 ? `${p/1000}k` : p}
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="flex-between" style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px' }}>Choose your plan</h2>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Bigger amount = bigger return</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id;
            return (
              <Card 
                key={plan.id} 
                variant="solid" 
                padding="md" 
                style={{ 
                  border: isSelected ? '1px solid var(--accent-blue)' : '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
                onClick={() => setSelectedPlanId(plan.id)}
              >
                <div className="flex-between">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: plan.bg, color: plan.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0, border: `1px solid ${plan.iconColor}33` }}>
                      {plan.icon}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{plan.name}</span>
                        {plan.badge && (
                          <span style={{ background: plan.badge === 'POPULAR' ? '#e67e22' : 'var(--accent-green)', color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '10px', fontWeight: 'bold' }}>
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {plan.days}d · {plan.range}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-green)' }}>{plan.returnPct}%</span>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: isSelected ? 'none' : '2px solid var(--border-color)', background: isSelected ? 'var(--accent-purple)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isSelected && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Selected Plan Details */}
        <Card variant="solid" padding="none" style={{ marginBottom: '24px', overflow: 'hidden' }}>
          <div style={{ background: 'rgba(46, 204, 113, 0.05)', padding: '24px', textAlign: 'center', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '12px', color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
              YOU'LL EARN · {selectedPlan.returnPct}% IN {selectedPlan.days} DAYS
            </div>
            <div style={{ fontSize: '40px', fontWeight: 800, color: 'var(--accent-green)', marginBottom: '8px' }}>
              +${returnAmount.toFixed(2)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              You get ${totalBack.toFixed(2)} back
            </div>
          </div>
          
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex-between">
              <span style={{ color: 'var(--text-secondary)' }}>Total return</span>
              <span style={{ color: 'var(--accent-blue)', fontWeight: 'bold' }}>{selectedPlan.returnPct}%</span>
            </div>
            <div className="flex-between">
              <span style={{ color: 'var(--text-secondary)' }}>You'll earn</span>
              <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>+${returnAmount.toFixed(2)}</span>
            </div>
            <div className="flex-between">
              <span style={{ color: 'var(--text-secondary)' }}>Unlocks in</span>
              <span style={{ fontWeight: 'bold' }}>{selectedPlan.days} days</span>
            </div>
            <div className="flex-between">
              <span style={{ color: 'var(--text-secondary)' }}>You get back</span>
              <span style={{ color: 'var(--accent-green)', fontWeight: 'bold' }}>${totalBack.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {needsMore && (
          <Card variant="solid" style={{ border: '1px solid rgba(243, 156, 18, 0.3)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(243, 156, 18, 0.1)', color: '#f39c12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
                !
              </div>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#f39c12', marginBottom: '4px' }}>Need ${deficit.toFixed(2)} more</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Current balance ${currentBalance.toFixed(2)}</div>
              </div>
            </div>
          </Card>
        )}

        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '24px' }}>
          Returns are guaranteed. Locked in for the full {selectedPlan.days}-day plan.
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 'var(--max-width)', padding: '0 20px', zIndex: 99 }}>
        <Button 
          variant={needsMore ? 'primary' : 'success'} 
          fullWidth 
          onClick={handleInvest}
          disabled={loading || needsMore}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '12px 20px', opacity: (loading || needsMore) ? 0.7 : 1, boxShadow: '0 -10px 40px rgba(11, 12, 16, 0.9)' }}
        >
          <div style={{ fontSize: '12px', color: needsMore ? '#fff' : 'rgba(0,0,0,0.6)', fontWeight: 'bold', marginBottom: '2px' }}>
            +${returnAmount.toFixed(2)} · {selectedPlan.returnPct}% in {selectedPlan.days} days
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 800 }}>
              {loading ? 'Processing...' : needsMore ? 'Insufficient Balance' : 'Start Plan'}
            </span>
            <span style={{ fontSize: '20px' }}>→</span>
          </div>
        </Button>
      </div>
    </div>
  );
};
