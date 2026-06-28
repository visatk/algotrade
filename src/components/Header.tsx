import React from 'react';

interface HeaderProps {
  onClose?: () => void;
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onClose, showBack, onBack, title }) => {
  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    position: 'sticky',
    top: 0,
    zIndex: 50,
  };

  const actionButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: 'var(--text-primary)',
    fontSize: '16px',
    fontWeight: 600,
  };

  const rightActionsStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  };

  const iconCircleStyle: React.CSSProperties = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.05)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    position: 'relative',
    color: '#fff',
  };

  const notificationBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '-2px',
    right: '-2px',
    background: '#e74c3c',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 'bold',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--bg-primary)',
  };

  return (
    <header style={headerStyle}>
      <div style={actionButtonStyle} onClick={showBack ? onBack : onClose}>
        {showBack ? (
          <>
            <span>←</span> Back
          </>
        ) : (
          <>
            <span>✕</span> Close
          </>
        )}
      </div>

      {title && (
        <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', fontSize: '18px' }}>
          {title}
        </div>
      )}

      <div style={rightActionsStyle}>
        {!showBack && (
          <div style={iconCircleStyle}>
            🔔
          </div>
        )}
        <div style={iconCircleStyle}>
          ❔
        </div>
        {!showBack && (
          <div style={iconCircleStyle}>
            ⋮
          </div>
        )}
      </div>
    </header>
  );
};
