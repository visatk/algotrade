import { useState, useEffect } from 'react';
import './index.css';
import { api } from './api/client';
import type { TelegramUser } from './types';
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
import { Transactions } from './views/Transactions';
import { Guide } from './views/Guide';
import { Support } from './views/Support';
import { Settings } from './views/Settings';
import { BottomNav } from './components/BottomNav';

type View = 'home' | 'withdraw' | 'invest-info' | 'verification' | 'deposit' | 'deposit-rewards' | 'invest' | 'invite' | 'profile' | 'bonuses' | 'transactions' | 'guide' | 'support' | 'settings';
type NavTab = 'home' | 'trophy' | 'deposit' | 'invest' | 'invite' | 'profile';



function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [balance, setBalance] = useState('0.00');
  
  const refreshUser = async () => {
    try {
      const data = (await api.syncUser()) as { user?: TelegramUser };
      if (data && data.user) {
        setUser(data.user);
        setBalance((data.user.balance || 0).toFixed(2));
      }
    } catch (err) {
      console.error('Failed to sync user:', err);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

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
        <Home balance={balance} onNavigate={handleNavigate} user={user} refreshUser={refreshUser} />
      )}
      
      {currentView === 'withdraw' && (
        <Withdraw onBack={() => setCurrentView('home')} refreshUser={refreshUser} user={user} />
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
          refreshUser={refreshUser}
          user={user}
          onClaim={() => setCurrentView('home')}
        />
      )}

      {currentView === 'deposit' && (
        <Deposit onBack={() => setCurrentView('home')} refreshUser={refreshUser} />
      )}

      {currentView === 'deposit-rewards' && (
        <DepositRewards 
          onBack={() => setCurrentView('deposit')} 
          onDeposit={() => setCurrentView('deposit')} 
          user={user}
          refreshUser={refreshUser}
        />
      )}

      {currentView === 'invest' && (
        <Invest 
          onBack={() => setCurrentView('home')} 
          currentBalance={currentBalanceNum} 
          refreshUser={refreshUser}
        />
      )}

      {currentView === 'invite' && (
        <Invite onBack={() => setCurrentView('home')} user={user} />
      )}

      {currentView === 'profile' && (
        <Profile 
          onBack={() => setCurrentView('home')} 
          user={user} 
          onNavigate={handleNavigate}
        />
      )}
      
      {currentView === 'transactions' && (
        <Transactions onBack={() => setCurrentView('profile')} />
      )}
      
      {currentView === 'guide' && (
        <Guide onBack={() => setCurrentView('profile')} />
      )}
      
      {currentView === 'bonuses' && (
        <Bonuses onBack={() => setCurrentView('home')} user={user} refreshUser={refreshUser} />
      )}
      
      {currentView === 'support' && (
        <Support onBack={() => setCurrentView('profile')} />
      )}
      
      {currentView === 'settings' && (
        <Settings onBack={() => setCurrentView('profile')} />
      )}


      {/* Show BottomNav on main tabs */}
      {isMainTab && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      )}
    </div>
  );
}

export default App;
