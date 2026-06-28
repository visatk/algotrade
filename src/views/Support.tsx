import React from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

interface SupportProps {
  onBack: () => void;
}

export const Support: React.FC<SupportProps> = ({ onBack }) => {
  return (
    <div className="fade-in" style={{ paddingBottom: '100px' }}>
      <Header showBack onBack={onBack} title="Help & Support" />
      
      <div style={{ padding: '0 20px', marginTop: '24px' }}>
        <Card variant="solid" style={{ marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎧</div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>We're here to help</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            Having trouble with a deposit, withdrawal, or investment plan? Reach out to our 24/7 support team.
          </p>
          <Button fullWidth onClick={() => window.open('https://t.me/algo_trade_support', '_blank')}>
            Contact Support
          </Button>
        </Card>

        <Card variant="solid" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>💬</div>
          <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Join the Community</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            Chat with other investors and stay updated on the latest AI model releases.
          </p>
          <Button variant="secondary" fullWidth onClick={() => window.open('https://t.me/algo_trade_community', '_blank')}>
            Join Community Channel
          </Button>
        </Card>
      </div>
    </div>
  );
};
