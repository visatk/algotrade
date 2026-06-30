import type { TelegramInitUser } from '../src/types';

export interface Env {
  DB: D1Database;
  TELEGRAM_BOT_TOKEN: string;
  IS_DEV?: string; // Set to "true" ONLY in dev via .dev.vars
  DEPOSIT_ADDRESS_TRC20: string;
  DEPOSIT_ADDRESS_BEP20: string;
  DEPOSIT_ADDRESS_LTC: string;
  DEPOSIT_ADDRESS_BNB: string;
  DEPOSIT_ADDRESS_ETH: string;
}

export type Variables = {
  tgUser: TelegramInitUser; // Raw Telegram user (id, first_name, username)
};
