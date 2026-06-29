/** Raw user data from Telegram WebApp initData (snake_case, as Telegram sends it) */
export interface TelegramInitUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

/** Application user from our D1 database (camelCase, as Drizzle maps it) */
export interface AppUser {
  id: number;
  firstName: string;
  username: string | null;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEarned: number;
  referredBy: number | null;
  dailyStreak: number;
  lastClaimDate: number | null;
  giftBoxes: number;
  verificationClaimed: boolean;
  createdAt: number;
}

export type TransactionType =
  | 'deposit'
  | 'withdraw'
  | 'investment_principal'
  | 'investment_return'
  | 'daily_reward'
  | 'verification_bonus'
  | 'referral_bonus'
  | 'gift_box_reward'
  | 'deposit_milestone'
  | 'join_bonus';

export interface Transaction {
  id: number;
  userId: number;
  type: TransactionType;
  amount: number;
  txid: string | null;
  status: 'pending' | 'completed' | 'failed';
  createdAt: number;
}
