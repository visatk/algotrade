import { useState, useEffect } from 'react';
import './index.css';
import { api } from './api/client';
import type { AppUser } from './types';
import { Home } from './views/Home';
import { Withdraw } from './views/Withdraw';
import { Stats } from './views/Stats';
import { Verification } from './views/Verification';
import { Deposit } from './views/Deposit';
import { DepositRewards } from './views/DepositRewards';
import { SpinWheel } from './views/SpinWheel';
import { Invest } from './views/Invest';
import { Invite } from './views/Invite';
import { Profile } from './views/Profile';
import { Bonuses } from './views/Bonuses';
import { Transactions } from './views/Transactions';
import { Guide } from './views/Guide';
import { Support } from './views/Support';
import { Settings } from './views/Settings';
import { BottomNav } from './components/BottomNav';

type View = 'home' | 'withdraw' | 'stats' | 'verification' | 'deposit' | 'deposit-rewards' | 'invest' | 'invite' | 'profile' | 'bonuses' | 'transactions' | 'guide' | 'support' | 'settings' | 'spin-wheel';
type NavTab = 'home' | 'stats' | 'deposit' | 'invest' | 'invite' | 'profile';



function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const refreshUser = async () => {
    try {
      const data = await api.syncUser();
      if (data && data.user) {
        setUser(data.user);
      }
    } catch (err) {
      console.error('Failed to sync user:', err);
      setError('Failed to load user data. Please reload the Mini App.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const handleNavigate = (view: string) => {
    const validViews = ['home', 'withdraw', 'stats', 'verification', 'deposit', 'deposit-rewards', 'invest', 'invite', 'profile', 'bonuses', 'transactions', 'guide', 'support', 'settings', 'spin-wheel'];
    if (validViews.includes(view)) {
      setCurrentView(view as View);
    }
  };

  const handleTabChange = (tab: NavTab) => {
    setCurrentView(tab);
  };

  const isMainTab = ['home', 'deposit', 'invest', 'invite', 'profile', 'stats'].includes(currentView);
  const activeTab = isMainTab ? (currentView as NavTab) : 'home';
  
  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-dark)' }}>
        <div className="animate-pulse" style={{ color: 'var(--accent-green)', fontSize: '24px', fontWeight: 'bold' }}>ALGOMIND</div>
      </div>
    );
  }
  
  if (error || !user) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-dark)', padding: '20px', textAlign: 'center' }}>
        <div style={{ color: 'var(--text-secondary)' }}>{error || 'Failed to load user'}</div>
      </div>
    );
  }

  const balanceStr = (user.balance || 0).toFixed(2);
  const currentBalanceNum = user.balance || 0;

  return (
    <div className="fade-in" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {currentView === 'home' && (
        <Home balance={balanceStr} onNavigate={handleNavigate} user={user} refreshUser={refreshUser} />
      )}
      
      {currentView === 'withdraw' && (
        <Withdraw onBack={() => setCurrentView('home')} refreshUser={refreshUser} user={user} />
      )}
      
      {currentView === 'stats' && (
        <Stats />
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
        <Deposit onBack={() => setCurrentView('home')} onNavigate={handleNavigate} />
      )}

      {currentView === 'deposit-rewards' && (
        <DepositRewards 
          onBack={() => setCurrentView('deposit')} 
          onDeposit={() => setCurrentView('deposit')} 
          user={user || undefined}
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
        <Bonuses onBack={() => setCurrentView('home')} user={user || undefined} refreshUser={refreshUser} />
      )}
      
      {currentView === 'support' && (
        <Support onBack={() => setCurrentView('profile')} />
      )}
      
      {currentView === 'settings' && (
        <Settings onBack={() => setCurrentView('profile')} />
      )}

      {currentView === 'spin-wheel' && (
        <SpinWheel onBack={() => setCurrentView('home')} user={user} refreshUser={refreshUser} />
      )}


      {/* Show BottomNav on main tabs */}
      {isMainTab && (
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} onNavigate={handleNavigate} />
      )}
    </div>
  );
}

export default App;
