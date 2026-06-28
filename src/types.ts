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
  verificationClaimed: boolean;
  createdAt: number;
}
