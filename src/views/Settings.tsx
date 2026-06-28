import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Card } from '../components/ui/Card';

interface SettingsProps {
  onBack: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onBack }) => {
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');

  return (
    <div className="fade-in" style={{ paddingBottom: '100px' }}>
      <Header showBack onBack={onBack} title="Settings" />
      
      <div style={{ padding: '0 20px', marginTop: '24px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 'bold', letterSpacing: '1px', marginBottom: '16px' }}>
          PREFERENCES
        </div>
        
        <Card variant="solid" padding="none">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="flex-between" style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '16px', fontWeight: '500' }}>Push Notifications</span>
              <div 
                onClick={() => setNotifications(!notifications)}
                style={{
                  width: '44px',
                  height: '24px',
                  background: notifications ? 'var(--accent-green)' : 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: '#fff',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: notifications ? '22px' : '2px',
                  transition: 'all 0.3s'
                }} />
              </div>
            </div>
            
            <div className="flex-between" style={{ padding: '16px 20px' }}>
              <span style={{ fontSize: '16px', fontWeight: '500' }}>Language</span>
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  background: 'transparent',
                  color: 'var(--accent-blue)',
                  border: 'none',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  outline: 'none',
                  cursor: 'pointer',
                  textAlign: 'right'
                }}
              >
                <option value="English" style={{ color: '#000' }}>English</option>
                <option value="Russian" style={{ color: '#000' }}>Русский</option>
                <option value="Spanish" style={{ color: '#000' }}>Español</option>
              </select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
