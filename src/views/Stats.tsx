import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Header } from '../components/Header';
import { TrendingUp, Activity, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { faker } from '@faker-js/faker';

type Tab = 'Live Trades' | 'Trades' | 'Investments' | 'Withdrawals';

interface Coin {
  name: string;
  price: number;
  badge: string;
  change: string;
}

interface Trade {
  id: string;
  type: string;
  bot: string;
  user: string;
  amount: string;
  time: number;
}

interface Investment {
  id: string;
  user: string;
  amount: string;
  time: number;
}

interface Withdrawal {
  id: string;
  user: string;
  amount: string;
  time: number;
}

export const Stats: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Live Trades');
  const [profit, setProfit] = useState(7184127);
  const [longPercent, setLongPercent] = useState(55.49);
  
  // Fake data state
  const [coins, setCoins] = useState<Coin[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  useEffect(() => {
    // Generate static coins
    const baseCoins = [
      { name: 'BTC', price: 59614, badge: 'LONG', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=032' },
      { name: 'ETH', price: 1569, badge: 'SHORT', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=032' },
      { name: 'BNB', price: 550.95, badge: 'SHORT', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=032' },
      { name: 'SOL', price: 71.41, badge: 'SHORT', icon: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=032' },
      { name: 'TON', price: 1.55, badge: 'SHORT', icon: 'https://cryptologos.cc/logos/toncoin-ton-logo.svg?v=032' },
      { name: 'TRX', price: 0.3233, badge: 'LONG', icon: 'https://cryptologos.cc/logos/tron-trx-logo.svg?v=032' },
      { name: 'DOGE', price: 0.0730, badge: 'SHORT', icon: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=032' },
    ];
    
    setCoins(baseCoins.map(c => ({
      ...c,
      change: (Math.random() * 5 - 2.5).toFixed(2)
    })));

    // Generate initial trades
    const newTrades = Array.from({ length: 15 }).map(() => ({
      id: faker.string.uuid(),
      type: Math.random() > 0.5 ? 'LONG' : 'SHORT',
      bot: Math.random() > 0.5 ? 'Swift' : 'Wave',
      user: faker.person.firstName(),
      amount: faker.finance.amount({ min: 1, max: 50, dec: 2 }),
      time: faker.number.int({ min: 1, max: 59 })
    })).sort((a, b) => a.time - b.time);
    setTrades(newTrades);

    // Generate initial investments
    const newInvestments = Array.from({ length: 15 }).map(() => ({
      id: faker.string.uuid(),
      user: `${faker.person.firstName()} ${faker.person.lastName().charAt(0)}.`,
      amount: faker.finance.amount({ min: 50, max: 2000, dec: 2 }),
      time: faker.number.int({ min: 1, max: 59 })
    })).sort((a, b) => a.time - b.time);
    setInvestments(newInvestments);

    // Generate initial withdrawals
    const newWithdrawals = Array.from({ length: 15 }).map(() => {
      const first = faker.person.firstName();
      const masked = `${first.charAt(0)}****${first.charAt(first.length-1)} ${faker.person.lastName().charAt(0)}.`;
      return {
        id: faker.string.uuid(),
        user: masked,
        amount: faker.finance.amount({ min: 20, max: 1000, dec: 2 }),
        time: faker.number.int({ min: 1, max: 59 })
      };
    }).sort((a, b) => a.time - b.time);
    setWithdrawals(newWithdrawals);

  }, []);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setProfit(p => p + Math.floor(Math.random() * 100));
      setLongPercent(p => {
        const next = p + (Math.random() * 0.2 - 0.1);
        return Math.max(0, Math.min(100, next));
      });
      
      // Update times
      setTrades(prev => prev.map(t => ({ ...t, time: t.time + 1 })));
      setInvestments(prev => prev.map(t => ({ ...t, time: t.time + 1 })));
      setWithdrawals(prev => prev.map(t => ({ ...t, time: t.time + 1 })));
      
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const tabs: { id: Tab; icon: React.ReactNode }[] = [
    { id: 'Live Trades', icon: <Activity size={16} /> },
    { id: 'Trades', icon: <TrendingUp size={16} /> },
    { id: 'Investments', icon: <ArrowDownToLine size={16} /> },
    { id: 'Withdrawals', icon: <ArrowUpFromLine size={16} /> },
  ];

  return (
    <div style={{ paddingBottom: '100px' }}>
      <Header />
      
      <div style={{ padding: '0 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-green)', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
          <TrendingUp size={16} /> AI PROFIT - 24H
        </div>
        <div style={{ 
          fontSize: '56px', 
          fontWeight: 800, 
          marginBottom: '32px',
          background: 'linear-gradient(135deg, #fff 0%, var(--accent-blue) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 4px 32px rgba(65, 105, 225, 0.3)'
        }}>
          ${profit.toLocaleString()}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '40px' }}>
          <Card variant="glass" padding="md" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚡</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>$8.5B</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>volume 24h</div>
          </Card>
          <Card variant="glass" padding="md" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>3.1M</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>trades 24h</div>
          </Card>
          <Card variant="glass" padding="md" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>👥</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold' }}>12,630</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>investors</div>
          </Card>
          <Card variant="glass" padding="md" style={{ textAlign: 'center', border: '1px solid rgba(46, 204, 113, 0.3)', boxShadow: '0 8px 32px 0 rgba(46, 204, 113, 0.1)' }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎯</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-green)' }}>95%</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>win rate</div>
          </Card>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '12px' }}>Live report of current trading operations</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.5 }}>
            AlgoMind runs a grid-trading algorithm that opens both long and short positions with a step of about 0.1%, so the AI profits from small price moves in either direction.
          </p>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>LIVE ACTIVITY</div>
        
        <Card variant="solid" padding="none" style={{ overflow: 'hidden' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  minWidth: 'fit-content',
                  padding: '16px 12px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2px solid var(--accent-green)' : '2px solid transparent',
                  color: activeTab === tab.id ? '#fff' : 'var(--text-secondary)',
                  fontSize: '12px',
                  fontWeight: activeTab === tab.id ? 'bold' : 'normal',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer'
                }}
              >
                {tab.icon}
                {tab.id}
              </button>
            ))}
          </div>
          
          <div style={{ padding: '16px' }}>
            {activeTab === 'Live Trades' && (
              <div>
                <div style={{ display: 'flex', height: '48px', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
                  <div style={{ width: `${longPercent}%`, background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.8), rgba(96, 165, 250, 1))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold', transition: 'width 0.3s ease' }}>
                    {longPercent.toFixed(2)}%
                    <span style={{ fontSize: '10px', opacity: 0.9, letterSpacing: '1px' }}>LONG</span>
                  </div>
                  <div style={{ width: `${100 - longPercent}%`, background: 'linear-gradient(90deg, rgba(249, 115, 22, 0.8), rgba(251, 146, 60, 1))', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold', transition: 'width 0.3s ease' }}>
                    {(100 - longPercent).toFixed(2)}%
                    <span style={{ fontSize: '10px', opacity: 0.9, letterSpacing: '1px' }}>SHORT</span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {coins.map((coin, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', transition: 'transform 0.2s ease', cursor: 'default' }}
                         onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                         onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px' }}>
                          <img src={(coin as any).icon} alt={coin.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 'bold', fontSize: '16px' }}>{coin.name}</span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ color: Number(coin.change) >= 0 ? 'var(--accent-green)' : '#e74c3c' }}>
                          {Number(coin.change) > 0 ? '+' : ''}{coin.change}%
                        </span>
                        <div style={{ 
                          padding: '6px 12px', 
                          borderRadius: '16px', 
                          fontSize: '10px', 
                          fontWeight: 'bold',
                          background: coin.badge === 'LONG' ? 'linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(96, 165, 250, 0.2))' : 'linear-gradient(90deg, rgba(249, 115, 22, 0.2), rgba(251, 146, 60, 0.2))',
                          color: coin.badge === 'LONG' ? '#60a5fa' : '#fb923c'
                        }}>
                          {coin.badge}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab === 'Trades' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {trades.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.type === 'LONG' ? 'var(--accent-green)' : '#e74c3c' }} />
                      <span style={{ fontWeight: 'bold', color: t.type === 'LONG' ? 'var(--accent-green)' : '#e74c3c' }}>{t.type}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>{t.bot} · {t.user}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>${t.amount}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{t.time}s ago</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'Investments' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {investments.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }} />
                      <span style={{ fontWeight: 'bold' }}>{t.user}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>invested in</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>${t.amount}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{t.time}s ago</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'Withdrawals' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {withdrawals.map(t => (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }} />
                      <span style={{ fontWeight: 'bold' }}>{t.user}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>withdrew</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>${t.amount}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{t.time}s ago</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </Card>
      </div>
    </div>
  );
};
