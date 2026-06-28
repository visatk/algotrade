import React from 'react';

type NavTab = 'home' | 'trophy' | 'deposit' | 'invest' | 'invite' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'trophy', label: 'Trophy', icon: '🏆' },
    { id: 'deposit', label: 'Deposit', icon: '💳' },
    { id: 'invest', label: 'Invest', icon: '📈' },
    { id: 'invite', label: 'Invite', icon: '👥' },
    { id: 'profile', label: 'Profile', icon: '👤' },
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
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '12px 0 24px',
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
    fontSize: '12px',
    position: 'relative',
    padding: '8px',
    transition: 'all 0.2s',
  });

  const activeIndicatorStyle: React.CSSProperties = {
    content: '""',
    position: 'absolute',
    top: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(255, 255, 255, 0.1)',
    borderRadius: '16px',
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
    fontSize: '24px',
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

  return (
    <>
      <div style={supportIconStyle}>
        🎧
        <div style={notificationDotStyle} />
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
              <span style={{ fontSize: '20px', filter: isActive ? 'drop-shadow(0 0 5px rgba(255,255,255,0.5))' : 'none' }}>
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
