import React from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Header } from '../components/Header';

interface InvestInfoProps {
  onBack: () => void;
  onContinue: () => void;
}

export const InvestInfo: React.FC<InvestInfoProps> = ({ onBack, onContinue }) => {
  return (
    <div style={{ paddingBottom: '100px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header showBack onBack={onBack} />
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <div style={{ background: 'rgba(243, 156, 18, 0.1)', color: '#f39c12', padding: '6px 16px', borderRadius: '16px', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(243, 156, 18, 0.3)' }}>
          🎁 EXTRA $165 BONUS ON TOP
          <div style={{ display: 'flex', gap: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-green)' }} />
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f39c12' }} />
          </div>
        </div>
      </div>

      <div style={{ padding: '0 20px', flex: 1 }}>
        <Card variant="solid" padding="lg" style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
            <div style={{ background: '#fff', borderRadius: '8px', padding: '4px' }}>
              <span style={{ color: '#000', fontWeight: 'bold', fontSize: '12px' }}>Algo</span>
            </div>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>ALGOMIND</span>
          </div>

          <div style={{ background: '#13151c', borderRadius: '16px', padding: '24px', marginBottom: '32px', position: 'relative', border: '1px solid var(--border-color)' }}>
            <div style={{ position: 'absolute', top: '16px', left: '16px', display: 'flex', gap: '8px' }}>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-blue)' }} />
                AI • LIVE
              </div>
              <div style={{ background: 'rgba(46, 204, 113, 0.1)', color: 'var(--accent-green)', padding: '4px 8px', borderRadius: '12px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-green)' }} />
                24/7
              </div>
            </div>

            {/* Mock Chart */}
            <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px', marginTop: '32px', position: 'relative' }}>
              <div style={{ width: '100%', position: 'absolute', top: '50%', borderBottom: '1px dashed rgba(255,255,255,0.1)', zIndex: 0 }} />
              <div style={{ width: '15%', height: '40%', background: 'var(--accent-green)', borderRadius: '4px', zIndex: 1 }} />
              <div style={{ width: '15%', height: '30%', background: '#e74c3c', borderRadius: '4px', zIndex: 1 }} />
              <div style={{ width: '15%', height: '60%', background: 'var(--accent-green)', borderRadius: '4px', zIndex: 1 }} />
              <div style={{ width: '15%', height: '50%', background: 'var(--accent-green)', borderRadius: '4px', zIndex: 1 }} />
              <div style={{ width: '15%', height: '80%', background: 'var(--accent-green)', borderRadius: '4px', zIndex: 1 }} />
              
              {/* Trend line */}
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2 }}>
                <path d="M 10 70 L 60 75 L 110 50 L 160 55 L 210 20" fill="none" stroke="var(--accent-purple)" strokeWidth="3" />
                <circle cx="210" cy="20" r="6" fill="var(--accent-purple)" />
                <circle cx="210" cy="20" r="12" fill="rgba(138, 43, 226, 0.3)" />
              </svg>
            </div>
          </div>

          <h2 style={{ fontSize: '28px', marginBottom: '24px', lineHeight: 1.2 }}>
            Your AI trades. <span style={{ color: 'var(--accent-green)' }}>You just collect.</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left' }}>
            {[
              { icon: '✓', color: 'var(--accent-blue)', text: 'Picks the highest-edge moves 24/7' },
              { icon: '✓', color: 'var(--accent-green)', text: 'Fixed return paid in 7 days, no guessing' },
              { icon: '✓', color: '#f39c12', text: 'Auto-credited to your wallet on maturity' },
              { icon: '✓', color: 'var(--accent-purple)', text: 'Starts at just $5, zero manual trading' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: `1px solid ${item.color}`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{item.text}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ padding: '20px', background: 'var(--bg-primary)', position: 'sticky', bottom: 0 }}>
        <Button fullWidth onClick={onContinue}>
          Continue &gt;
        </Button>
      </div>
    </div>
  );
};
