export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  balance: number;
  totalDeposited: number;
  totalWithdrawn: number;
  totalEarned: number;
  dailyStreak: number;
  lastClaimDate: number | null;
  giftBoxes: number;
  verificationClaimed: boolean;
  createdAt: number;
}

export interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  status: string;
  createdAt: number;
}
