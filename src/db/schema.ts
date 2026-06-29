import { sqliteTable, text, integer, real, index } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey(),
  firstName: text('first_name').notNull(),
  username: text('username'),
  balance: real('balance').default(0).notNull(),
  totalDeposited: real('total_deposited').default(0).notNull(),
  totalWithdrawn: real('total_withdrawn').default(0).notNull(),
  totalEarned: real('total_earned').default(0).notNull(),
  referredBy: integer('referred_by'),
  dailyStreak: integer('daily_streak').default(0).notNull(),
  lastClaimDate: integer('last_claim_date'),
  giftBoxes: integer('gift_boxes').default(0).notNull(),
  verificationClaimed: integer('verification_claimed', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at').notNull(),
}, (table) => {
  return {
    referredByIdx: index('users_referred_by_idx').on(table.referredBy),
  };
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  type: text('type', {
    enum: [
      'deposit',
      'withdraw',
      'investment_principal',
      'investment_return',
      'referral_bonus',
      'verification_bonus',
      'daily_reward',
      'gift_box_reward',
      'deposit_milestone',
      'join_bonus'
    ]
  }).notNull(),
  amount: real('amount').notNull(),
  txid: text('txid').unique(),
  status: text('status').notNull(), // pending, completed, failed
  createdAt: integer('created_at').notNull(),
}, (table) => {
  return {
    userIdIdx: index('transactions_user_id_idx').on(table.userId),
    typeIdx: index('transactions_type_idx').on(table.type),
    statusIdx: index('transactions_status_idx').on(table.status),
  };
});

export const investments = sqliteTable('investments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  planId: text('plan_id').notNull(),
  amount: real('amount').notNull(),
  expectedReturn: real('expected_return').notNull(),
  startDate: integer('start_date').notNull(),
  endDate: integer('end_date').notNull(),
  status: text('status').notNull(), // active, completed
}, (table) => {
  return {
    userIdIdx: index('investments_user_id_idx').on(table.userId),
    statusIdx: index('investments_status_idx').on(table.status),
    compositeMatureIdx: index('investments_mature_idx').on(table.userId, table.status, table.endDate),
  };
});
