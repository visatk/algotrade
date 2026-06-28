import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Header } from '../components/Header';
import { api } from '../api/client';

interface DepositProps {
  onBack: () => void;
  refreshUser: () => Promise<void>;
}

export const Deposit: React.FC<DepositProps> = ({ onBack, refreshUser }) => {
  const [amount, setAmount] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeposit = async () => {
    try {
      setLoading(true);
      setError(null);
      await api.deposit(amount);
      await refreshUser();
      onBack();
    } catch (err: any) {
      setError(err.message || 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const pills = [25, 50, 100, 250, 500];

  const bonus20 = amount * 0.2;
  const bonus50 = Math.min(amount * 0.5, 250);
  const total = amount + bonus20 + bonus50;

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    outline: 'none',
  };

  const pillStyle = (selected: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '16px',
    background: selected ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
    color: selected ? '#fff' : 'var(--text-secondary)',
    border: `1px solid ${selected ? 'var(--accent-blue)' : 'var(--border-color)'}`,
    fontWeight: 'bold',
    cursor: 'pointer',
    fontSize: '14px'
  });

  return (
    <div style={{ paddingBottom: '100px' }}>
      <Header showBack onBack={onBack} />
      
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <span style={{ fontSize: '20px' }}>🧮</span>
          <h1 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Bonus Calculator</h1>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>I want to deposit</div>
          <Card variant="solid" style={{ marginBottom: '16px', padding: '16px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>$</span>
              <input 
                type="number" 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                style={inputStyle} 
              />
            </div>
          </Card>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            {pills.map((p) => (
              <button 
                key={p} 
                style={pillStyle(amount === p)}
                onClick={() => setAmount(p)}
              >
                ${p}
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Apply an offer <span style={{ opacity: 0.7 }}>(stacks with your +20% bonus)</span></div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Card variant="solid" style={{ border: '1px solid rgba(243, 156, 18, 0.5)', background: 'rgba(243, 156, 18, 0.05)' }}>
              <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: '#f39c12' }}>⚡</span>
                  <span style={{ fontWeight: 'bold' }}>Best offer · auto</span>
                </div>
                <span style={{ color: '#f39c12', fontSize: '14px', fontWeight: 'bold' }}>Applied</span>
              </div>
            </Card>

            <Card variant="solid">
              <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>🎁</span>
                  <span style={{ fontWeight: 'bold' }}>+50% deposit bonus</span>
                </div>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>cap $250</span>
              </div>
            </Card>
          </div>
        </div>

        <Card variant="solid" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="flex-between">
              <span style={{ color: 'var(--text-secondary)' }}>Deposit</span>
              <span style={{ fontWeight: 'bold' }}>${amount.toFixed(2)}</span>
            </div>
            <div className="flex-between">
              <span style={{ color: 'var(--text-secondary)' }}>+20% deposit bonus</span>
              <span style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>+${bonus20.toFixed(2)}</span>
            </div>
            <div className="flex-between">
              <span style={{ color: 'var(--text-secondary)' }}>+50% offer applied</span>
              <span style={{ fontWeight: 'bold', color: '#f39c12' }}>+${bonus50.toFixed(2)}</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-color)', margin: '4px 0' }} />
            <div className="flex-between">
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>You get</span>
              <span style={{ fontWeight: 'bold', fontSize: '24px', color: 'var(--accent-green)' }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card variant="solid" style={{ border: '1px solid rgba(243, 156, 18, 0.3)', marginBottom: '24px' }}>
          <div className="flex-between">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f39c12', fontWeight: 'bold' }}>
              <span>🎁</span>
              <span>+5 Lucky Spins</span>
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
              <span style={{ color: '#f39c12' }}>Deposit $100+</span> → 20 spins
            </span>
          </div>
        </Card>

        <Card variant="solid">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              'Copy the address or scan the QR code',
              'Send USDT on the BEP20 network',
              'Your balance updates automatically (~2 min)'
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(88, 101, 242, 0.2)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{text}</div>
              </div>
            ))}
          </div>
        </Card>

        {error && (
          <div style={{ color: '#e74c3c', fontSize: '14px', marginTop: '16px', textAlign: 'center', background: 'rgba(231, 76, 60, 0.1)', padding: '12px', borderRadius: '8px' }}>
            {error}
          </div>
        )}

        <div style={{ marginTop: '24px' }}>
          <button 
            onClick={handleDeposit}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '16px', 
              background: 'var(--accent-blue)', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '16px', 
              fontSize: '16px', 
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processing...' : 'Simulate Deposit Now'}
          </button>
        </div>
      </div>
    </div>
  );
};
