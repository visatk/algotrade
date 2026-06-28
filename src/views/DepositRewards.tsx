import React from 'react';
import { Card } from '../components/ui/Card';
import { Header } from '../components/Header';
import { Button } from '../components/ui/Button';

interface DepositRewardsProps {
  onBack: () => void;
  onDeposit: () => void;
}

export const DepositRewards: React.FC<DepositRewardsProps> = ({ onBack, onDeposit }) => {
  const rewards = [
    { title: 'Starter Bonus', amount: '+$20', req: 'Deposit $50+ to unlock', color: 'var(--accent-green)' },
    { title: 'Boost Bonus', amount: '+$40', req: 'Deposit $100+ to unlock', color: 'var(--accent-green)' },
    { title: 'Gold Bonus', amount: '+$50', req: 'Deposit $250+ to unlock', color: 'var(--accent-green)' },
    { title: 'Pro Bonus', amount: '+$100', req: 'Deposit $500+ to unlock', color: 'var(--accent-green)' },
    { title: 'VIP Bonus', amount: '+$200', req: 'Deposit $1k+ to unlock', color: 'var(--accent-green)' },
    { title: 'Elite Bonus', amount: '+$400', req: 'Deposit $2.5k+ to unlock', color: 'var(--accent-green)' },
    { title: 'Ultra Bonus', amount: '+$1k', req: 'Deposit $5k+ to unlock', color: '#f39c12' },
  ];

  return (
    <div style={{ paddingBottom: '120px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header showBack onBack={onBack} />
      
      <div style={{ padding: '0 20px', flex: 1 }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Deposit Rewards</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
          Unlock bonus at each deposit milestone, claim it free
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rewards.map((reward, i) => (
            <Card key={i} variant="solid" padding="md">
              <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', color: reward.color, padding: '4px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: 'bold' }}>
                    {reward.amount}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{reward.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{reward.req}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                  <span>🔒</span>
                  <span>Locked</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div style={{ position: 'fixed', bottom: '80px', left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: 'var(--max-width)', padding: '0 20px', zIndex: 99 }}>
        <Button variant="success" fullWidth onClick={onDeposit} style={{ display: 'flex', gap: '8px', boxShadow: '0 -10px 40px rgba(11, 12, 16, 0.9)' }}>
          <span>⚡</span> Deposit to unlock more
        </Button>
      </div>
    </div>
  );
};
