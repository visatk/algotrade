import React from 'react';
import { Card } from '../components/ui/Card';
import { Header } from '../components/Header';

interface WithdrawProps {
  onBack: () => void;
}

export const Withdraw: React.FC<WithdrawProps> = ({ onBack }) => {
  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    outline: 'none',
    padding: '8px 0',
  };

  const addressInputStyle: React.CSSProperties = {
    ...inputStyle,
    fontSize: '16px',
    fontWeight: 'normal',
    color: 'var(--text-secondary)'
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      <Header showBack onBack={onBack} />
      
      <div style={{ padding: '0 20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '8px' }}>Withdraw</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Cash out to your wallet</p>
        
        <Card variant="solid" padding="lg" style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Available to withdraw</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold' }}>$0.64</div>
        </Card>

        <Card variant="solid" style={{ border: '1px solid rgba(243, 156, 18, 0.3)', marginBottom: '32px' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(243, 156, 18, 0.1)', color: '#f39c12', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              🔒
            </div>
            <div>
              <h3 style={{ color: '#f39c12', fontSize: '16px', marginBottom: '8px' }}>Withdrawals unlock after your first plan matures</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>Start a plan today, let it run its 7-day cycle, and your full balance becomes withdrawable any time after.</p>
              <button style={{ background: '#f39c12', color: '#000', padding: '8px 16px', borderRadius: '24px', fontWeight: 'bold', fontSize: '14px' }}>
                Start a plan
              </button>
            </div>
          </div>
        </Card>

        <div style={{ marginBottom: '24px' }}>
          <div className="flex-between" style={{ marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount</span>
            <span style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 'bold' }}>Max</span>
          </div>
          <Card variant="solid">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>$</span>
              <input type="text" placeholder="0.00" style={inputStyle} />
            </div>
          </Card>
        </div>

        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Wallet Address (BEP20)</div>
          <Card variant="solid">
            <input type="text" placeholder="0x..." style={addressInputStyle} />
          </Card>
        </div>
      </div>
    </div>
  );
};
