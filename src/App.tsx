import { useState, useEffect } from 'react';
import './index.css';
import WebApp from '@twa-dev/sdk';
import { Home } from './views/Home';
import { Withdraw } from './views/Withdraw';
import { InvestInfo } from './views/InvestInfo';
import { Verification } from './views/Verification';
import { Deposit } from './views/Deposit';
import { DepositRewards } from './views/DepositRewards';
import { Invest } from './views/Invest';
import { Invite } from './views/Invite';
import { Profile } from './views/Profile';
import { Bonuses } from './views/Bonuses';
import { BottomNav } from './components/BottomNav';

type View = 'home' | 'withdraw' | 'invest-info' | 'verification' | 'deposit' | 'deposit-rewards' | 'invest' | 'invite' | 'profile' | 'bonuses';
type NavTab = 'home' | 'trophy' | 'deposit' | 'invest' | 'invite' | 'profile';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [user, setUser] = useState<TelegramUser | null>(null);
  
  useEffect(() => {
    // Attempt to get user from Telegram Mini App SDK
    if (WebApp.initDataUnsafe && WebApp.initDataUnsafe.user) {
      setUser(WebApp.initDataUnsafe.user as TelegramUser);
    } else {
      // Fallback for local development outside of Telegram
      setUser({
        id: 0,
        first_name: 'Guest',
        username: 'guest_user',
      });
    }
  }, []);

  // Mock data
  const [balance, setBalance] = useState('5.00');
  const currentBalanceNum = parseFloat(balance);

  const handleNavigate = (view: string) => {
    setCurrentView(view as View);
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    if (tab === 'home') setCurrentView('home');
    if (tab === 'trophy') setCurrentView('bonuses');
    if (tab === 'deposit') setCurrentView('deposit');
    if (tab === 'invest') setCurrentView('invest');
    if (tab === 'invite') setCurrentView('invite');
    if (tab === 'profile') setCurrentView('profile');
  };

  const isMainTab = ['home', 'deposit', 'invest', 'invite', 'profile'].includes(currentView);

  return (
    <div className="fade-in" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {currentView === 'home' && (
        <Home balance={balance} onNavigate={handleNavigate} user={user} />
      )}
      
      {currentView === 'withdraw' && (
        <Withdraw onBack={() => setCurrentView('home')} />
      )}
      
      {currentView === 'invest-info' && (
        <InvestInfo 
          onBack={() => setCurrentView('home')} 
          onContinue={() => setCurrentView('verification')}
        />
      )}
      
      {currentView === 'verification' && (
        <Verification 
          onClose={() => setCurrentView('home')}
          onClaim={() => {
            setBalance('170.00');
            setCurrentView('home');
          }}
        />
      )}

      {currentView === 'deposit' && (
        <Deposit onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'deposit-rewards' && (
        <DepositRewards 
          onBack={() => setCurrentView('deposit')} 
          onDeposit={() => setCurrentView('deposit')} 
        />
      )}

      {currentView === 'invest' && (
        <Invest 
          onBack={() => setCurrentView('home')} 
          currentBalance={currentBalanceNum} 
        />
      )}

      {currentView === 'invite' && (
        <Invite onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'profile' && (
        <Profile onBack={() => setCurrentView('home')} user={user} />
      )}

      {currentView === 'bonuses' && (
        <Bonuses onBack={() => {
          setActiveTab('home');
          setCurrentView('home');
        }} />
      )}

      {/* Show BottomNav on main tabs */}
      {isMainTab && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}

export default App;
