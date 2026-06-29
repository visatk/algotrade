import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Header } from '../components/Header';
import { Copy, QrCode } from 'lucide-react';

interface DepositProps {
  onBack: () => void;
  onNavigate?: (view: string) => void;
}

export const Deposit: React.FC<DepositProps> = ({ onBack, onNavigate }) => {
  const [amount, setAmount] = useState<number>(50);
  const [crypto, setCrypto] = useState<string>('USDT');
  const [network, setNetwork] = useState<string>('BEP20');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'Deposit' | 'Rewards 100%'>('Deposit');

  const cryptos = [
    { id: 'USDT', badge: 'HOT', color: 'var(--accent-green)', icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=032', networks: [{id:'BEP20', badge: 'BEST', color: 'var(--accent-green)'}, {id:'TRC20'}, {id:'ERC20'}] },
    { id: 'BTC', icon: 'https://cryptologos.cc/logos/bitcoin-btc-logo.svg?v=032', networks: [{id:'Bitcoin', badge: 'BEST', color: 'var(--accent-green)'}, {id:'BEP20'}] },
    { id: 'ETH', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=032', networks: [{id:'ERC20', badge: 'BEST', color: 'var(--accent-green)'}, {id:'BEP20'}, {id:'Arbitrum'}] },
    { id: 'BNB', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=032', networks: [{id:'BEP20', badge: 'BEST', color: 'var(--accent-green)'}] },
    { id: 'TRX', icon: 'https://cryptologos.cc/logos/tron-trx-logo.svg?v=032', networks: [{id:'TRC20', badge: 'BEST', color: 'var(--accent-green)'}] }
  ];

  const currentCryptoObj = cryptos.find(c => c.id === crypto) || cryptos[0];
  const networks = currentCryptoObj.networks;

  // Handle crypto change -> automatically set default network
  const handleCryptoSelect = (cId: string) => {
    setCrypto(cId);
    const targetObj = cryptos.find(c => c.id === cId) || cryptos[0];
    setNetwork(targetObj.networks[0].id);
  };

  // Generate a mock deterministic address based on network
  const address = React.useMemo(() => {
    if (network === 'TRC20') return 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
    if (network === 'Bitcoin') return 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh';
    return '0xfb6af7b581bc0fb7b09dd678fda94dfbc11e92b1';
  }, [network]);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${address}&color=0b0c10&bgcolor=ffffff`;

  const bonus20 = amount * 0.2;
  const bonus50 = Math.min(amount * 0.5, 250);
  const total = amount + bonus20 + bonus50;

  return (
    <div style={{ paddingBottom: '100px' }}>
      <Header showBack onBack={onBack} />
      
      <div style={{ padding: '0 20px' }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold', 
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #fff 0%, var(--accent-blue) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Add funds to start earning
        </h1>
        
        <div style={{ 
          display: 'inline-block', 
          background: 'rgba(46, 204, 113, 0.15)', 
          color: 'var(--accent-green)', 
          padding: '6px 16px', 
          borderRadius: '24px', 
          fontSize: '12px', 
          fontWeight: 'bold', 
          marginBottom: '24px',
          boxShadow: '0 0 12px rgba(46, 204, 113, 0.2)'
        }}>
          ✓ Auto Credit
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
          {(['Deposit', 'Rewards 100%'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => {
                if (tab === 'Rewards 100%') {
                  onNavigate?.('deposit-rewards');
                } else {
                  setActiveTab(tab);
                }
              }}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? '#000' : 'var(--text-secondary)',
                border: 'none',
                fontWeight: 'bold',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Crypto Selector */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
            WHAT ARE YOU SENDING?
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px' }}>
            {cryptos.map(c => (
              <button
                key={c.id}
                onClick={() => handleCryptoSelect(c.id)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  background: crypto === c.id ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                  color: crypto === c.id ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${crypto === c.id ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {c.icon && <img src={c.icon} alt={c.id} style={{ width: '20px', height: '20px' }} />}
                {c.id}
                {c.badge && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: c.color,
                    color: '#000',
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}>
                    {c.badge}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Network Selector */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
            NETWORK
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {networks.map(n => (
              <button
                key={n.id}
                onClick={() => setNetwork(n.id)}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  background: network === n.id ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                  color: network === n.id ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${network === n.id ? 'var(--accent-blue)' : 'var(--border-color)'}`,
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  position: 'relative',
                  flex: 1
                }}
              >
                {n.id}
                {n.badge && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    right: '-8px',
                    background: n.color,
                    color: '#000',
                    fontSize: '9px',
                    padding: '2px 6px',
                    borderRadius: '8px',
                    fontWeight: 'bold'
                  }}>
                    {n.badge}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Address Card */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
            YOUR {crypto} ADDRESS ({network})
          </div>
          <Card variant="glass" padding="md" style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }} onClick={handleCopy}>
            <div style={{ background: '#fff', padding: '6px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <img src={qrUrl} alt="QR Code" style={{ width: '80px', height: '80px', borderRadius: '8px' }} />
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '14px', wordBreak: 'break-all', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
                {address}
              </div>
              <div style={{ color: copied ? 'var(--accent-green)' : 'var(--accent-blue)', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Copy size={16} /> {copied ? 'Copied!' : 'Copy Address'}
              </div>
            </div>
          </Card>
        </div>

        {/* Bonus Calculator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '20px' }}>🧮</span>
          <h2 style={{ fontSize: '16px', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, fontWeight: 'bold' }}>BONUS CALCULATOR</h2>
        </div>

        <Card variant="glass" padding="md" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
            <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>$</span>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '28px',
                fontWeight: 'bold',
                outline: 'none',
                fontFamily: 'var(--font-display)'
              }} 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>+20% deposit bonus</span>
              <span style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>+${bonus20.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-secondary)' }}>+50% offer applied</span>
              <span style={{ fontWeight: 'bold', color: '#f39c12' }}>+${bonus50.toFixed(2)}</span>
            </div>
            <div style={{ borderTop: '1px dashed var(--border-color)', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', fontSize: '18px' }}>You get</span>
              <span style={{ fontWeight: 'bold', fontSize: '28px', color: 'var(--accent-green)' }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        <Card variant="glass" padding="md">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              'Copy the address or scan the QR code',
              `Send ${crypto} on the ${network} network`,
              'Your balance updates automatically (~2 min)'
            ].map((text, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(88, 101, 242, 0.2)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 'bold', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{text}</div>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
};
