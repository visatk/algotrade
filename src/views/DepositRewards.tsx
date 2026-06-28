import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Header } from '../components/Header';
import { Button } from '../components/ui/Button';
import type { AppUser, Transaction } from '../types';
import { api } from '../api/client';

interface DepositRewardsProps {
  onBack: () => void;
  onDeposit: () => void;
  user?: AppUser;
  refreshUser?: () => Promise<void>;
}

export const DepositRewards: React.FC<DepositRewardsProps> = ({ onBack, onDeposit, user, refreshUser }) => {
  const [claimedAmounts, setClaimedAmounts] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch transactions to see which ones are already claimed
    api.getTransactions().then(res => {
      if (res.transactions) {
        const claimed = res.transactions
          .filter((tx: Transaction) => tx.type === 'deposit_milestone')
          .map((tx: Transaction) => tx.amount);
        setClaimedAmounts(claimed);
      }
    }).catch(console.error);
  }, []);

  const totalDeposited = user?.totalDeposited || 0;

  const rewards = [
    { title: 'Starter Bonus', amount: 20, reqDeposit: 50, color: 'var(--accent-green)' },
    { title: 'Boost Bonus', amount: 40, reqDeposit: 100, color: 'var(--accent-green)' },
    { title: 'Gold Bonus', amount: 50, reqDeposit: 250, color: 'var(--accent-green)' },
    { title: 'Pro Bonus', amount: 100, reqDeposit: 500, color: 'var(--accent-green)' },
    { title: 'VIP Bonus', amount: 200, reqDeposit: 1000, color: 'var(--accent-green)' },
    { title: 'Elite Bonus', amount: 400, reqDeposit: 2500, color: 'var(--accent-green)' },
    { title: 'Ultra Bonus', amount: 1000, reqDeposit: 5000, color: '#f39c12' },
  ];

  const handleClaim = async (reqDeposit: number, rewardAmount: number) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await api.claimDepositMilestone(reqDeposit);
      setClaimedAmounts([...claimedAmounts, rewardAmount]);
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to claim milestone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '120px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header showBack onBack={onBack} />
      
      <div style={{ padding: '0 20px', flex: 1 }}>
        <h1 style={{ fontSize: '24px', marginBottom: '8px' }}>Deposit Rewards</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
          Unlock bonus at each deposit milestone, claim it free
        </p>

        <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total Deposited</span>
          <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>${totalDeposited.toFixed(2)}</span>
        </div>

        {error && (
          <div style={{ color: '#e74c3c', marginBottom: '16px', background: 'rgba(231, 76, 60, 0.1)', padding: '12px', borderRadius: '8px', fontSize: '14px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {rewards.map((reward, i) => {
            const isUnlocked = totalDeposited >= reward.reqDeposit;
            const isClaimed = claimedAmounts.includes(reward.amount);
            
            return (
              <Card key={i} variant="solid" padding="md">
                <div className="flex-between">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.05)', color: reward.color, padding: '4px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: 'bold', opacity: isUnlocked ? 1 : 0.5 }}>
                      +${reward.amount}
                    </div>
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px', opacity: isUnlocked ? 1 : 0.5 }}>{reward.title}</div>
                      <div style={{ fontSize: '12px', color: isUnlocked ? 'var(--accent-green)' : 'var(--text-secondary)' }}>
                        Deposit ${reward.reqDeposit}+ to unlock
                      </div>
                    </div>
                  </div>
                  <div>
                    {!isUnlocked ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                        <span>🔒</span>
                        <span>Locked</span>
                      </div>
                    ) : isClaimed ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'bold' }}>
                        <span>✓</span>
                        <span>Claimed</span>
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleClaim(reward.reqDeposit, reward.amount)}
                        disabled={loading}
                        style={{ background: 'var(--accent-blue)', color: '#fff', border: 'none', padding: '6px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer' }}
                      >
                        Claim
                      </button>
                    )}
                  </div>
                </div>
                {/* Progress bar */}
                {!isUnlocked && (
                  <div style={{ marginTop: '12px', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--accent-blue)', width: `${Math.min((totalDeposited / reward.reqDeposit) * 100, 100)}%` }} />
                  </div>
                )}
              </Card>
            );
          })}
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
