import React, { useEffect, useState } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/ui/Card';
import { api } from '../api/client';
import type { Transaction } from '../types';

interface TransactionsProps {
  onBack: () => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ onBack }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTxs = async () => {
      try {
        const data = (await api.getTransactions()) as { transactions: Transaction[] };
        setTransactions(data.transactions || []);
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxs();
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'deposit': return '💳';
      case 'withdraw': return '↗️';
      case 'investment_principal': return '📉';
      case 'investment_return': return '📈';
      case 'daily_reward': return '🎁';
      case 'verification_bonus': return '🎉';
      case 'referral_bonus': return '👥';
      case 'gift_box_reward': return '🎁';
      case 'deposit_milestone': return '🏆';
      default: return '🔄';
    }
  };

  const formatType = (type: string) => {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="fade-in" style={{ paddingBottom: '100px' }}>
      <Header showBack onBack={onBack} title="Transaction History" />
      
      <div style={{ padding: '0 20px', marginTop: '24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
        ) : transactions.length === 0 ? (
          <Card variant="solid">
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '24px' }}>
              No transactions yet.
            </div>
          </Card>
        ) : (
          transactions.map((tx) => (
            <Card key={tx.id} variant="solid" style={{ marginBottom: '12px' }} padding="sm">
              <div className="flex-between">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ background: 'rgba(255,255,255,0.05)', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                    {getIcon(tx.type)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 'bold' }}>{formatType(tx.type)}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {new Date(tx.createdAt * 1000).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '16px',
                  color: tx.amount > 0 ? 'var(--accent-green)' : 'var(--text-primary)'
                }}>
                  {tx.amount > 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(2)}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
