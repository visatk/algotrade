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
    const errorData = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(errorData.error || `API request failed: ${response.status}`);
  }

  return response.json();
}

export const api = {
  syncUser: () => fetchApi('/api/auth/sync', { method: 'POST' }),
  getUser: () => fetchApi('/api/user', { method: 'GET' }),
  claimDailyReward: () => fetchApi('/api/rewards/daily', { method: 'POST' }),
  startInvestment: (planId: string, amount: number) => 
    fetchApi('/api/investments/start', {
      method: 'POST',
      body: JSON.stringify({ planId, amount }),
    }),
  getInvestments: () => fetchApi('/api/investments', { method: 'GET' }),
  deposit: (amount: number, network: string, txid: string) => fetchApi('/api/deposit', {
    method: 'POST',
    body: JSON.stringify({ amount, network, txid }),
  }),
  withdraw: (amount: number, address: string) => fetchApi('/api/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount, address }),
  }),
  getReferrals: () => fetchApi('/api/referrals', { method: 'GET' }),
  getTopReferrers: () => fetchApi('/api/referrals/top', { method: 'GET' }),
  verifyTask: () => fetchApi('/api/tasks/verify', { method: 'POST' }),
  getTransactions: () => fetchApi('/api/transactions', { method: 'GET' }),
  openGiftBox: () => fetchApi('/api/rewards/open-box', { method: 'POST' }),
  claimDepositMilestone: (amount: number) => fetchApi('/api/rewards/deposit-milestone', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  }),
};
