import React from 'react';
import { Card } from '../components/ui/Card';
import { Header } from '../components/Header';
import type { AppUser } from '../types';

interface ProfileProps {
  onBack: () => void;
  user: AppUser | null;
  onNavigate: (view: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ onBack, user, onNavigate }) => {
  const displayName = user?.firstName || 'Guest';
  const displayUsername = user?.username ? `@${user.username}` : '';
  const joinDate = user?.createdAt ? new Date(user.createdAt * 1000).toLocaleDateString() : 'today';

  return (
    <div style={{ paddingBottom: '120px', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header showBack onBack={onBack} />
      
      <div style={{ padding: '0 20px', flex: 1 }}>
        {/* User Info Card */}
        <Card variant="solid" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-secondary)', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)' }}>
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #2c3e50, #3498db)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>
                  👤
                </div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{displayName}</div>
              {displayUsername && <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '4px' }}>{displayUsername}</div>}
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>Member since {joinDate}</div>
            </div>
          </div>
        </Card>

        {/* Balance Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '32px' }}>
          <Card variant="solid">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>
              <span>💼</span> AVAILABLE
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>${(user?.balance || 0).toFixed(2)}</div>
          </Card>
          
          <Card variant="solid">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>
              <span>📈</span> EARNED
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-green)' }}>${(user?.totalEarned || 0).toFixed(2)}</div>
          </Card>

          <Card variant="solid">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-purple)', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>
              <span>↗️</span> WITHDRAWN
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--accent-purple)' }}>${(user?.totalWithdrawn || 0).toFixed(2)}</div>
          </Card>

          <Card variant="solid">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-blue)', marginBottom: '8px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px' }}>
              <span>🛡️</span> DEPOSITED
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold' }}>${(user?.totalDeposited || 0).toFixed(2)}</div>
          </Card>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '16px' }}>
          ACCOUNT
        </div>

        <Card variant="solid" padding="none">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { icon: '🕒', label: 'Transaction History', view: 'transactions' },
              { icon: '❓', label: 'Guide', view: 'guide' },
              { icon: '🎧', label: 'Help & Support', view: 'support' },
              { icon: '⚙️', label: 'Settings', view: 'settings' },
            ].map((item, index, arr) => (
              <div 
                key={index} 
                onClick={() => onNavigate(item.view)}
                className="flex-between" 
                style={{ 
                  padding: '16px 20px', 
                  borderBottom: index < arr.length - 1 ? '1px solid var(--border-color)' : 'none',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '18px', color: 'var(--text-secondary)', width: '24px', textAlign: 'center' }}>{item.icon}</span>
                  <span style={{ fontSize: '16px', fontWeight: '500' }}>{item.label}</span>
                </div>
                <span style={{ color: 'var(--text-secondary)' }}>›</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
