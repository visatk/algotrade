import WebApp from '@twa-dev/sdk';

const API_BASE = ''; // Uses relative URL, handled by Vite in dev and CF in prod

import { AppUser, Transaction } from '../types';

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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

  return response.json() as Promise<T>;
}

export interface SyncUserResponse { success: boolean; user: AppUser; }
export interface GetUserResponse { user: AppUser; }
export interface ClaimDailyRewardResponse { success: boolean; rewardAmount: number; newStreak: number; user: AppUser; }
export interface StartInvestmentResponse { success: boolean; expectedReturn: number; }
export interface GetInvestmentsResponse { investments: any[]; } // Todo: Investment type
export interface DepositResponse { success: boolean; user: AppUser; }
export interface WithdrawResponse { success: boolean; user: AppUser; }
export interface GetReferralsResponse { referrals: AppUser[]; l1Count: number; l2Count: number; l3Count: number; totalEarned: number; }
export interface GetTopReferrersResponse { top: any[]; }
export interface VerifyTaskResponse { success: boolean; user: AppUser; }
export interface GetTransactionsResponse { transactions: Transaction[]; }
export interface OpenGiftBoxResponse { success: boolean; rewardAmount: number; user: AppUser; }
export interface ClaimDepositMilestoneResponse { success: boolean; rewardAmount: number; user: AppUser; }
export interface SpinWheelResponse { success: boolean; rewardAmount: number; cost: number; user: AppUser; }
export interface GetStatsResponse { profit: number; longPercent: number; trades: any[]; investments: any[]; withdrawals: any[]; }

export const api = {
  syncUser: () => fetchApi<SyncUserResponse>('/api/auth/sync', { method: 'POST' }),
  getUser: () => fetchApi<GetUserResponse>('/api/user', { method: 'GET' }),
  claimDailyReward: () => fetchApi<ClaimDailyRewardResponse>('/api/rewards/daily', { method: 'POST' }),
  startInvestment: (planId: string, amount: number) => 
    fetchApi<StartInvestmentResponse>('/api/investments/start', {
      method: 'POST',
      body: JSON.stringify({ planId, amount }),
    }),
  getInvestments: () => fetchApi<GetInvestmentsResponse>('/api/investments', { method: 'GET' }),
  deposit: (amount: number, network: string, txid: string) => fetchApi<DepositResponse>('/api/deposit', {
    method: 'POST',
    body: JSON.stringify({ amount, network, txid }),
  }),
  withdraw: (amount: number, address: string) => fetchApi<WithdrawResponse>('/api/withdraw', {
    method: 'POST',
    body: JSON.stringify({ amount, address }),
  }),
  getReferrals: () => fetchApi<GetReferralsResponse>('/api/referrals', { method: 'GET' }),
  getTopReferrers: () => fetchApi<GetTopReferrersResponse>('/api/referrals/top', { method: 'GET' }),
  verifyTask: () => fetchApi<VerifyTaskResponse>('/api/tasks/verify', { method: 'POST' }),
  getTransactions: () => fetchApi<GetTransactionsResponse>('/api/transactions', { method: 'GET' }),
  openGiftBox: () => fetchApi<OpenGiftBoxResponse>('/api/rewards/open-box', { method: 'POST' }),
  claimDepositMilestone: (amount: number) => fetchApi<ClaimDepositMilestoneResponse>('/api/rewards/deposit-milestone', {
    method: 'POST',
    body: JSON.stringify({ amount }),
  }),
  spinWheel: (isPaid: boolean) => fetchApi<SpinWheelResponse>('/api/rewards/spin', {
    method: 'POST',
    body: JSON.stringify({ isPaid }),
  }),
  getStats: () => fetchApi<GetStatsResponse>('/api/stats', { method: 'GET' }),
};
