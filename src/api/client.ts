import WebApp from '@twa-dev/sdk';

const API_BASE = ''; // Uses relative URL, handled by Vite in dev and CF in prod

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const initData = WebApp.initData || ''; // Fallback for local testing without TG
  
  const headers = {
    'Content-Type': 'application/json',
    'X-Telegram-Init-Data': initData,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as any;
    throw new Error(errorData.error || `API request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  syncUser: () => fetchApi('/api/auth/sync', { method: 'POST' }),
  getUser: () => fetchApi('/api/user', { method: 'GET' }),
  claimDailyReward: () => fetchApi('/api/rewards/daily', { method: 'POST' }),
  startInvestment: (planId: string, amount: number, expectedReturn: number, days: number) => 
    fetchApi('/api/investments/start', {
      method: 'POST',
      body: JSON.stringify({ planId, amount, expectedReturn, days }),
    }),
  getInvestments: () => fetchApi('/api/investments', { method: 'GET' }),
  deposit: (amount: number) => fetchApi('/api/deposit', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  }),
  withdraw: (amount: number, address: string) => fetchApi('/api/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount, address }),
  }),
  getReferrals: () => fetchApi('/api/referrals', { method: 'GET' }),
  verifyTask: () => fetchApi('/api/tasks/verify', { method: 'POST' }),
};
