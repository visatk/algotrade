import React from 'react';
import { Home, BarChart2, Wallet, TrendingUp, Users, User, Headset } from 'lucide-react';

type NavTab = 'home' | 'stats' | 'deposit' | 'invest' | 'invite' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onNavigate?: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, onNavigate }) => {
  const tabs = [
    { id: 'stats', label: 'Stats', icon: <BarChart2 size={24} /> },
    { id: 'deposit', label: 'Deposit', icon: <Wallet size={24} /> },
    { id: 'invest', label: 'Invest', icon: <TrendingUp size={24} /> },
    { id: 'invite', label: 'Invite', icon: <Users size={24} /> },
    { id: 'profile', label: 'Profile', icon: <User size={24} /> },
  ];

  const containerStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 'var(--max-width)',
    background: 'var(--bg-card-solid)',
    borderTop: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '12px 16px 24px 80px', // Extra left padding for the floating home button
    zIndex: 100,
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    color: isActive ? '#fff' : 'var(--text-secondary)',
    fontSize: '10px',
    position: 'relative',
    padding: '8px',
    transition: 'all 0.2s',
    flex: 1,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer'
  });

  const activeIndicatorStyle: React.CSSProperties = {
    content: '""',
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '12px',
    zIndex: -1,
  };

  const supportIconStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '90px',
    right: '20px',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: 'var(--gradient-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 15px rgba(138, 43, 226, 0.4)',
    color: '#fff',
    cursor: 'pointer',
    zIndex: 101,
  };

  const notificationDotStyle: React.CSSProperties = {
    position: 'absolute',
    top: '2px',
    right: '2px',
    width: '10px',
    height: '10px',
    backgroundColor: '#2ecc71',
    borderRadius: '50%',
    border: '2px solid var(--gradient-primary)'
  };

  const floatingHomeStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: '24px', // Aligned with the bottom nav
    left: 'max(20px, calc(50% - min(500px, 100vw) / 2 + 20px))', // Calculate position based on max-width
    width: '64px',
    height: '64px',
    borderRadius: '24px',
    background: 'var(--gradient-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(138, 43, 226, 0.4)',
    color: '#fff',
    cursor: 'pointer',
    zIndex: 102,
    transition: 'all 0.2s',
    border: activeTab === 'home' ? '2px solid rgba(255,255,255,0.8)' : '2px solid transparent',
  };

  return (
    <>
      <div style={supportIconStyle} onClick={() => onNavigate?.('support')}>
        <Headset size={24} />
        <div style={notificationDotStyle} />
      </div>
      
      {/* Floating Home Button */}
      <div style={floatingHomeStyle} onClick={() => onTabChange('home')}>
        <Home size={28} />
      </div>

      <div style={containerStyle}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as NavTab)}
              style={tabStyle(isActive)}
            >
              {isActive && <div style={activeIndicatorStyle} />}
              <span style={{ 
                filter: isActive ? 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' : 'none',
                opacity: isActive ? 1 : 0.7
              }}>
                {tab.icon}
              </span>
              <span style={{ fontWeight: isActive ? 600 : 400 }}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
