import React from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/ui/Card';

interface GuideProps {
  onBack: () => void;
}

export const Guide: React.FC<GuideProps> = ({ onBack }) => {
  return (
    <div className="fade-in" style={{ paddingBottom: '100px' }}>
      <Header showBack onBack={onBack} title="How it Works" />
      
      <div style={{ padding: '0 20px', marginTop: '24px' }}>
        <Card variant="solid" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--accent-blue)' }}>1. Make a Deposit</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
            Fund your account using USDT (TRC20), Litecoin, or BNB. Deposits are processed automatically within a few minutes. 
            Enjoy a 100% bonus on your first deposit!
          </p>
        </Card>

        <Card variant="solid" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--accent-green)' }}>2. Choose an AI Plan</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
            Head over to the Invest tab and select an AI-driven trading plan. Our algorithms will automatically deploy your capital to generate consistent daily returns.
          </p>
        </Card>

        <Card variant="solid" style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'var(--accent-purple)' }}>3. Withdraw Profits</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>
            Once your investment plan matures, your principal and generated returns are added to your balance. Withdrawals unlock after your first plan completes and are processed instantly.
          </p>
        </Card>
      </div>
    </div>
  );
};
