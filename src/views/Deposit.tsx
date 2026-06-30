import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Header } from '../components/Header';
import { Copy, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

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
  const [txid, setTxid] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const cryptos = [
    { id: 'USDT', badge: 'HOT', color: 'var(--accent-green)', icon: 'https://cryptologos.cc/logos/tether-usdt-logo.svg?v=032', networks: [{id:'BEP20', badge: 'BEST', color: 'var(--accent-green)'}, {id:'TRC20'}] },
    { id: 'ETH', icon: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg?v=032', networks: [{id:'ETH', badge: 'BEST', color: 'var(--accent-green)'}] },
    { id: 'BNB', icon: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg?v=032', networks: [{id:'BNB', badge: 'BEST', color: 'var(--accent-green)'}] },
    { id: 'LTC', icon: 'https://cryptologos.cc/logos/litecoin-ltc-logo.svg?v=032', networks: [{id:'LTC', badge: 'BEST', color: 'var(--accent-green)'}] }
  ];

  const currentCryptoObj = cryptos.find(c => c.id === crypto) || cryptos[0];
  const networks = currentCryptoObj.networks;

  // Handle crypto change -> automatically set default network
  const handleCryptoSelect = (cId: string) => {
    setCrypto(cId);
    const targetObj = cryptos.find(c => c.id === cId) || cryptos[0];
    setNetwork(targetObj.networks[0].id);
  };

  // Generate deterministic address based on network
  const address = React.useMemo(() => {
    if (network === 'TRC20') return 'TCkK17d4FjSDR7GqVvYpEavh2yR9w3Zp4u';
    if (network === 'LTC') return 'LeWf6wQpC3o1mXkLgP1dE2eA8uG3V7H8pP';
    if (network === 'BEP20' || network === 'BNB' || network === 'ETH') return '0xd895697F876610bDBFdf0b15112B180b953d6Ebe';
    return '0xd895697F876610bDBFdf0b15112B180b953d6Ebe';
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

  const handleDeposit = async () => {
    if (!txid || txid.length < 10) {
      setError('Please enter a valid Transaction ID / Hash');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      await api.deposit(amount, network, txid);
      setSuccess(true);
      setTxid('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Deposit verification failed');
    } finally {
      setLoading(false);
    }
  };

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

        {/* Verification Section */}
        <div style={{ marginTop: '32px', marginBottom: '32px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '12px' }}>
            VERIFY DEPOSIT
          </div>
          <Card variant="solid">
            <div style={{ marginBottom: '16px' }}>
              <input 
                type="text" 
                placeholder="Paste Transaction Hash (TXID) here" 
                value={txid}
                onChange={(e) => setTxid(e.target.value)}
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  padding: '8px 0',
                }} 
              />
            </div>
            
            {error && (
              <div style={{ color: '#e74c3c', fontSize: '14px', marginBottom: '16px', background: 'rgba(231, 76, 60, 0.1)', padding: '12px', borderRadius: '8px' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ color: 'var(--accent-green)', fontSize: '14px', marginBottom: '16px', background: 'rgba(46, 204, 113, 0.1)', padding: '12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> Deposit submitted! Your balance will update shortly.
              </div>
            )}

            <button 
              onClick={handleDeposit}
              disabled={loading || success}
              style={{ 
                width: '100%', 
                padding: '16px', 
                background: success ? 'var(--accent-green)' : 'var(--accent-blue)', 
                color: success ? '#000' : '#fff', 
                border: 'none', 
                borderRadius: '16px', 
                fontSize: '16px', 
                fontWeight: 'bold',
                cursor: (loading || success) ? 'not-allowed' : 'pointer',
                opacity: (loading || success) ? 0.7 : 1
              }}
            >
              {loading ? 'Verifying...' : success ? 'Submitted' : 'Verify Deposit'}
            </button>
          </Card>
        </div>

      </div>
    </div>
  );
};
