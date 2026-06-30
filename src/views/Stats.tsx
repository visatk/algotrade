import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Header } from '../components/Header';
import { TrendingUp, Activity, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { api } from '../api/client';

type Tab = 'Live Trades' | 'Trades' | 'Investments' | 'Withdrawals';

interface Coin {
  name: string;
  price: number;
  badge: string;
  change: string;
  symbol?: string;
}

interface Trade {
  type: string;
  pair: string;
  leverage: string;
  pnl: number;
  time: string;
  isWinning: boolean;
}

interface Investment {
  id: string;
  name: string;
  amount: number;
  time: string;
}

interface Withdrawal {
  id: string;
  amount: number;
  address: string;
  time: string;
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
    const baseCoins = [
      { name: 'BTC', symbol: 'BTCUSDT', price: 59614, badge: 'LONG', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=032' },
      { name: 'ETH', symbol: 'ETHUSDT', price: 1569, badge: 'SHORT', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=032' },
      { name: 'BNB', symbol: 'BNBUSDT', price: 550.95, badge: 'SHORT', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=032' },
      { name: 'SOL', symbol: 'SOLUSDT', price: 71.41, badge: 'SHORT', icon: 'https://cryptologos.cc/logos/solana-sol-logo.svg?v=032' },
      { name: 'TON', symbol: 'TONUSDT', price: 1.55, badge: 'SHORT', icon: 'https://cryptologos.cc/logos/toncoin-ton-logo.svg?v=032' },
      { name: 'TRX', symbol: 'TRXUSDT', price: 0.3233, badge: 'LONG', icon: 'https://cryptologos.cc/logos/tron-trx-logo.svg?v=032' },
      { name: 'DOGE', symbol: 'DOGEUSDT', price: 0.0730, badge: 'SHORT', icon: 'https://cryptologos.cc/logos/dogecoin-doge-logo.svg?v=032' },
    ];
    
    // Initially set fallback prices
    setCoins(baseCoins.map(c => ({
      ...c,
      change: (Math.random() * 5 - 2.5).toFixed(2)
    })));

    // Fetch live prices from Binance
    const fetchPrices = async () => {
      try {
        const symbols = '%5B' + baseCoins.map(c => `"${c.symbol}"`).join(',') + '%5D';
        const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbols=${symbols}`);
        const data = await res.json();
        const priceMap = new Map();
        if (Array.isArray(data)) {
          data.forEach((p: any) => priceMap.set(p.symbol, parseFloat(p.price)));
        }
        
        setCoins(prev => prev.map(c => ({
          ...c,
          price: c.symbol && priceMap.has(c.symbol) ? priceMap.get(c.symbol) : c.price,
          change: (Math.random() * 5 - 2.5).toFixed(2)
        })));
      } catch (err) {
        console.error('Failed to fetch binance prices', err);
      }
    };
    
    fetchPrices();
    const priceInterval = setInterval(fetchPrices, 30000); // 30s instead of 10s

    const fetchStats = async () => {
      try {
        const data = await api.getStats();
        setProfit(data.profit);
        setLongPercent(data.longPercent);
        setTrades(data.trades);
        setInvestments(data.investments);
        setWithdrawals(data.withdrawals);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      }
    };
    
    fetchStats();
    const statsInterval = setInterval(fetchStats, 60000); // Re-sync stats every 1 minute

    // Simulate live updates for UI effect between syncs
    const updateInterval = setInterval(() => {
      setProfit(p => p + Math.random() * 2); // Slow down the drift
      setLongPercent(p => {
        const next = p + (Math.random() * 0.2 - 0.1);
        return Math.max(0, Math.min(100, next));
      });
    }, 1000);

    return () => {
      clearInterval(priceInterval);
      clearInterval(statsInterval);
      clearInterval(updateInterval);
    };
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
                {trades.map((t, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: t.type === 'Long' ? 'var(--accent-green)' : '#e74c3c' }} />
                      <div>
                        <div style={{ fontWeight: 'bold' }}>{t.pair}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{t.type} · {t.leverage}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontWeight: 'bold', color: t.isWinning ? 'var(--accent-green)' : '#e74c3c' }}>
                        {t.isWinning ? '+' : ''}{t.pnl} USDT
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{t.time}</span>
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
                      <span style={{ fontWeight: 'bold' }}>{t.name}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>invested</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>${t.amount}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{t.time}</span>
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
                      <span style={{ fontWeight: 'bold' }}>{t.address}</span>
                      <span style={{ color: 'var(--text-secondary)' }}>withdrew</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>${t.amount}</span>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>{t.time}</span>
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
