import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, sql } from 'drizzle-orm';
import * as schema from '../../src/db/schema';
import type { Env, Variables } from '../env';
import { getDb } from '../db';

const rewards = new Hono<{ Bindings: Env; Variables: Variables }>();

function isSameUTCDay(ts1: number, ts2: number) {
  const d1 = new Date(ts1 * 1000);
  const d2 = new Date(ts2 * 1000);
  return d1.getUTCFullYear() === d2.getUTCFullYear() && 
         d1.getUTCMonth() === d2.getUTCMonth() && 
         d1.getUTCDate() === d2.getUTCDate();
}

function isConsecutiveUTCDay(lastTs: number, currentTs: number) {
  const d1 = new Date(lastTs * 1000);
  const d2 = new Date(currentTs * 1000);
  d1.setUTCDate(d1.getUTCDate() + 1);
  return d1.getUTCFullYear() === d2.getUTCFullYear() && 
         d1.getUTCMonth() === d2.getUTCMonth() && 
         d1.getUTCDate() === d2.getUTCDate();
}

// ---------------------------------------------------------------------------
// POST /api/rewards/daily — Claim daily reward
// ---------------------------------------------------------------------------
rewards.post('/daily', async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);

  const now = Math.floor(Date.now() / 1000);
  if (user.lastClaimDate && isSameUTCDay(user.lastClaimDate, now)) {
    return c.json({ error: 'Already claimed today' }, 400);
  }

  const isNextDay = user.lastClaimDate && isConsecutiveUTCDay(user.lastClaimDate, now);
  const newStreak = isNextDay ? user.dailyStreak + 1 : 1;
  const rewardAmount = Math.min(newStreak * 0.5, 3.0);
  const rewardBoxes = Math.min(newStreak, 5);

  const batchResponse = await db.batch([
    db.update(schema.users)
      .set({
        balance: sql`${schema.users.balance} + ${rewardAmount}`,
        dailyStreak: newStreak,
        lastClaimDate: now,
        giftBoxes: sql`${schema.users.giftBoxes} + ${rewardBoxes}`
      })
      .where(eq(schema.users.id, tgUser.id))
      .returning(),
      
    db.insert(schema.transactions).values({
      userId: tgUser.id,
      type: 'daily_reward',
      amount: rewardAmount,
      status: 'completed',
      createdAt: now
    })
  ]);

  return c.json({ success: true, rewardAmount, newStreak, user: batchResponse[0][0] });
});

// ---------------------------------------------------------------------------
// POST /api/rewards/open-box
// ---------------------------------------------------------------------------
rewards.post('/open-box', async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);

  if (user.giftBoxes <= 0) {
    return c.json({ error: 'No gift boxes available' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  const rewardAmount = Math.round((Math.random() * 4.5 + 0.5) * 100) / 100;

  const updateResult = await db.update(schema.users)
    .set({ 
      balance: sql`${schema.users.balance} + ${rewardAmount}`,
      giftBoxes: sql`${schema.users.giftBoxes} - 1`
    })
    .where(and(eq(schema.users.id, tgUser.id), sql`${schema.users.giftBoxes} > 0`))
    .returning();

  if (updateResult.length === 0) {
    return c.json({ error: 'No gift boxes available or user not found' }, 400);
  }

  await db.batch([
    db.insert(schema.transactions).values({
      userId: tgUser.id,
      type: 'gift_box_reward',
      amount: rewardAmount,
      status: 'completed',
      createdAt: now
    })
  ]);

  return c.json({ success: true, rewardAmount, user: updateResult[0] });
});

// ---------------------------------------------------------------------------
// POST /api/rewards/deposit-milestone
// ---------------------------------------------------------------------------
const depositMilestoneSchema = z.object({ amount: z.number().positive() });

rewards.post('/deposit-milestone', zValidator('json', depositMilestoneSchema), async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  const { amount } = c.req.valid('json');
  
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);

  const rewardsMap: Record<number, number> = {
    50: 20, 100: 40, 250: 50, 500: 100, 1000: 200, 2500: 400, 5000: 1000
  };

  const rewardAmount = rewardsMap[amount];
  if (!rewardAmount) {
    return c.json({ error: 'Invalid milestone' }, 400);
  }

  if (user.totalDeposited < amount) {
    return c.json({ error: 'Deposit requirement not met' }, 400);
  }

  // Check if already claimed
  const existingTx = await db.select({ id: schema.transactions.id })
    .from(schema.transactions)
    .where(and(
      eq(schema.transactions.userId, tgUser.id),
      eq(schema.transactions.type, 'deposit_milestone'),
      eq(schema.transactions.amount, rewardAmount)
    ))
    .limit(1)
    .get();

  if (existingTx) {
    return c.json({ error: 'Milestone already claimed' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);

  const batchResponse = await db.batch([
    db.update(schema.users)
      .set({ balance: sql`${schema.users.balance} + ${rewardAmount}` })
      .where(eq(schema.users.id, tgUser.id))
      .returning(),
      
    db.insert(schema.transactions).values({
      userId: tgUser.id,
      type: 'deposit_milestone',
      amount: rewardAmount,
      status: 'completed',
      createdAt: now
    })
  ]);

  return c.json({ success: true, rewardAmount, user: batchResponse[0][0] });
});

// ---------------------------------------------------------------------------
// POST /api/rewards/spin
// ---------------------------------------------------------------------------
const spinSchema = z.object({ isPaid: z.boolean() });

rewards.post('/spin', zValidator('json', spinSchema), async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  const { isPaid } = c.req.valid('json');
  
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);

  const now = Math.floor(Date.now() / 1000);
  if (isPaid) {
    if (user.balance < 1) {
      return c.json({ error: 'Insufficient balance ($1.00 required)' }, 400);
    }
  } else {
    if (user.lastSpinDate && isSameUTCDay(user.lastSpinDate, now)) {
      return c.json({ error: 'Free spin only available once per day' }, 400);
    }
  }

  const rand = Math.random();
  let rewardAmount = 0;
  
  if (rand < 0.60) {
    rewardAmount = Math.random() * 0.4 + 0.1;
  } else if (rand < 0.90) {
    rewardAmount = Math.random() * 1.5 + 0.5;
  } else if (rand < 0.99) {
    rewardAmount = Math.random() * 3 + 2;
  } else {
    rewardAmount = Math.random() * 40 + 10;
  }
  
  if (isPaid) {
    rewardAmount *= 1.5;
  }
  rewardAmount = Math.round(rewardAmount * 100) / 100;

  const cost = isPaid ? 1 : 0;
  const netChange = rewardAmount - cost;

  const updateQuery = isPaid
    ? db.update(schema.users).set({ balance: sql`${schema.users.balance} + ${netChange}` }).where(and(eq(schema.users.id, tgUser.id), sql`${schema.users.balance} >= 1`)).returning()
    : db.update(schema.users).set({ balance: sql`${schema.users.balance} + ${netChange}`, lastSpinDate: now }).where(eq(schema.users.id, tgUser.id)).returning();

  const updateResult = await updateQuery;
  
  if (updateResult.length === 0) {
    return c.json({ error: 'Failed to update, possibly insufficient balance' }, 400);
  }

  await db.batch([
    db.insert(schema.transactions).values({
      userId: tgUser.id,
      type: 'spin_reward',
      amount: netChange,
      status: 'completed',
      createdAt: now
    })
  ]);

  return c.json({ success: true, rewardAmount, cost, user: updateResult[0] });
});

export default rewards;
