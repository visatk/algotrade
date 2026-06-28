import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, lte } from 'drizzle-orm';
import * as schema from '../src/db/schema';
import type { TelegramUser } from '../src/types';

export interface Env {
  DB: D1Database;
  TELEGRAM_BOT_TOKEN: string;
}

type Variables = {
  user: TelegramUser;
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use('/api/*', cors());

// Global Error Handler
app.onError((err, c) => {
  console.error(`[Error] ${err.message}`, err);
  return c.json({ error: 'Internal Server Error', message: err.message }, 500);
});

// Not Found Handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', message: `Route ${c.req.path} not found` }, 404);
});

// Telegram authentication utility
async function verifyTelegramWebAppData(telegramInitData: string, botToken: string): Promise<boolean> {
  const urlParams = new URLSearchParams(telegramInitData);
  const hash = urlParams.get('hash');
  if (!hash) return false;
  
  urlParams.delete('hash');
  
  const keys = Array.from(urlParams.keys()).sort();
  const dataCheckString = keys.map(key => `${key}=${urlParams.get(key)}`).join('\n');
  
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const hmacKeyBuffer = await crypto.subtle.sign('HMAC', secretKey, encoder.encode(botToken));
  
  const finalKey = await crypto.subtle.importKey(
    'raw',
    hmacKeyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const calculatedHashBuffer = await crypto.subtle.sign('HMAC', finalKey, encoder.encode(dataCheckString));
  
  const calculatedHashArray = Array.from(new Uint8Array(calculatedHashBuffer));
  const calculatedHashHex = calculatedHashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  return calculatedHashHex === hash;
}

// Authentication middleware
app.use('/api/*', async (c, next) => {
  if (c.req.method === 'OPTIONS') return next();

  const initData = c.req.header('X-Telegram-Init-Data');
  if (!initData) {
    c.set('user', { 
      id: 12345, 
      first_name: 'Dev', 
      username: 'dev_user',
      balance: 0,
      dailyStreak: 0,
      lastClaimDate: null,
      totalDeposited: 0,
      totalWithdrawn: 0,
      totalEarned: 0,
      verificationClaimed: false,
      createdAt: Math.floor(Date.now() / 1000)
    } as TelegramUser);
    return next();
  }

  if (!c.env.TELEGRAM_BOT_TOKEN) {
    return c.json({ error: 'Server misconfiguration: missing BOT_TOKEN' }, 500);
  }

  const isValid = await verifyTelegramWebAppData(initData, c.env.TELEGRAM_BOT_TOKEN);
  if (!isValid) {
    return c.json({ error: 'Unauthorized: Invalid Telegram Init Data' }, 401);
  }

  const urlParams = new URLSearchParams(initData);
  const userStr = urlParams.get('user');
  if (userStr) {
    try {
      c.set('user', JSON.parse(userStr));
    } catch (e) {
      return c.json({ error: 'Malformed user data in initData' }, 400);
    }
  } else {
    return c.json({ error: 'No user data found in initData' }, 400);
  }

  await next();
});

async function processMatureInvestments(db: any, user: any) {
  const now = Math.floor(Date.now() / 1000);
  
  const matureInvestments = await db.select()
    .from(schema.investments)
    .where(and(
      eq(schema.investments.userId, user.id),
      eq(schema.investments.status, 'active'),
      lte(schema.investments.endDate, now)
    )).all();

  if (matureInvestments.length === 0) return user;

  let totalReturn = 0;
  let totalPrincipal = 0;
  
  for (const inv of matureInvestments) {
    totalPrincipal += inv.amount;
    totalReturn += inv.expectedReturn;
  }
  
  const totalCredit = totalPrincipal + totalReturn;
  
  const updates: any[] = [
    db.update(schema.users)
      .set({ 
        balance: user.balance + totalCredit,
        totalEarned: user.totalEarned + totalReturn
      })
      .where(eq(schema.users.id, user.id))
      .returning(),
      
    db.insert(schema.transactions).values({
      userId: user.id,
      type: 'investment_return',
      amount: totalCredit,
      status: 'completed',
      createdAt: now
    })
  ];

  for (const inv of matureInvestments) {
    updates.push(
      db.update(schema.investments)
        .set({ status: 'completed' })
        .where(eq(schema.investments.id, inv.id))
    );
  }
  
  const batchRes = await db.batch(updates);
  return batchRes[0][0]; // the updated user
}

// Sync User Endpoint
app.post('/api/auth/sync', async (c) => {
  const tgUser = c.get('user');
  const db = drizzle(c.env.DB);
  
  let user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  
  if (!user) {
    const initData = c.req.header('X-Telegram-Init-Data') || '';
    const urlParams = new URLSearchParams(initData);
    const startParam = urlParams.get('start_param');
    let referredBy = null;
    if (startParam) {
      const parsed = parseInt(startParam, 10);
      if (!isNaN(parsed) && parsed !== tgUser.id) {
        referredBy = parsed;
      }
    }

    const newUser = {
      id: tgUser.id,
      firstName: tgUser.first_name,
      username: tgUser.username || null,
      balance: 5.00,
      referredBy,
      createdAt: Math.floor(Date.now() / 1000),
    };
    
    // Use RETURNING to fetch the inserted record in one round-trip
    const [insertedUser] = await db.insert(schema.users).values(newUser).returning();
    user = insertedUser;
  }

  user = await processMatureInvestments(db, user);

  return c.json({ user });
});

// Get User Profile
app.get('/api/user', async (c) => {
  const tgUser = c.get('user');
  const db = drizzle(c.env.DB);
  let user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  
  if (!user) return c.json({ error: 'User not found' }, 404);
  
  user = await processMatureInvestments(db, user);
  
  return c.json({ user });
});

// Get Transactions
app.get('/api/transactions', async (c) => {
  const tgUser = c.get('user');
  const db = drizzle(c.env.DB);
  
  const transactions = await db.select()
    .from(schema.transactions)
    .where(eq(schema.transactions.userId, tgUser.id))
    .all();
    
  transactions.sort((a, b) => b.createdAt - a.createdAt);
  
  return c.json({ transactions });
});

// Claim Daily Reward
app.post('/api/rewards/daily', async (c) => {
  const tgUser = c.get('user');
  const db = drizzle(c.env.DB);
  
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);

  const now = Math.floor(Date.now() / 1000);
  const oneDay = 24 * 60 * 60;
  
  if (user.lastClaimDate && (now - user.lastClaimDate) < oneDay) {
    return c.json({ error: 'Already claimed today' }, 400);
  }

  const isNextDay = user.lastClaimDate && (now - user.lastClaimDate) < (oneDay * 2);
  const newStreak = isNextDay ? user.dailyStreak + 1 : 1;
  const rewardAmount = Math.min(newStreak * 0.5, 3.0);
  const rewardBoxes = Math.min(newStreak, 5);

  // Use Batched Statements for Atomicity
  const batchResponse = await db.batch([
    db.update(schema.users)
      .set({
        balance: user.balance + rewardAmount,
        dailyStreak: newStreak,
        lastClaimDate: now,
        giftBoxes: user.giftBoxes + rewardBoxes
      })
      .where(eq(schema.users.id, tgUser.id))
      .returning(),
      
    db.insert(schema.transactions).values({
      userId: tgUser.id,
      type: 'daily_reward',
      amount: rewardAmount,
      status: 'completed',
      createdAt: now
    }).returning()
  ]);

  return c.json({ success: true, rewardAmount, newStreak, user: batchResponse[0][0] });
});

// Start Investment Plan Validation Schema
const investSchema = z.object({
  planId: z.string().min(1),
  amount: z.number().positive(),
  expectedReturn: z.number().positive(),
  days: z.number().int().positive()
});

// Start Investment Plan
app.post('/api/investments/start', zValidator('json', investSchema), async (c) => {
  const tgUser = c.get('user');
  const db = drizzle(c.env.DB);
  
  const { planId, amount, expectedReturn, days } = c.req.valid('json');
  
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);
  
  if (user.balance < amount) {
    return c.json({ error: 'Insufficient balance' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  const endDate = now + (days * 24 * 60 * 60);

  // Batch transaction
  await db.batch([
    db.update(schema.users)
      .set({ balance: user.balance - amount })
      .where(eq(schema.users.id, tgUser.id)),
      
    db.insert(schema.transactions).values({
      userId: tgUser.id,
      type: 'investment_principal',
      amount: -amount,
      status: 'completed',
      createdAt: now
    }),
    
    db.insert(schema.investments).values({
      userId: tgUser.id,
      planId,
      amount,
      expectedReturn,
      startDate: now,
      endDate,
      status: 'active'
    })
  ]);

  return c.json({ success: true });
});

// Get Investments
app.get('/api/investments', async (c) => {
  const tgUser = c.get('user');
  const db = drizzle(c.env.DB);
  
  const activeInvestments = await db.select().from(schema.investments).where(eq(schema.investments.userId, tgUser.id)).all();
  return c.json({ investments: activeInvestments });
});

// Deposit Simulation
const depositSchema = z.object({ amount: z.number().positive() });
app.post('/api/deposit', zValidator('json', depositSchema), async (c) => {
  const tgUser = c.get('user');
  const db = drizzle(c.env.DB);
  const { amount } = c.req.valid('json');

  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);

  const bonus20 = amount * 0.2;
  const bonus50 = Math.min(amount * 0.5, 250);
  const totalCredited = amount + bonus20 + bonus50;
  const rewardBoxes = amount >= 100 ? 20 : 5;
  const now = Math.floor(Date.now() / 1000);

  const batchResponse = await db.batch([
    db.update(schema.users)
      .set({ 
        balance: user.balance + totalCredited,
        totalDeposited: user.totalDeposited + amount,
        giftBoxes: user.giftBoxes + rewardBoxes
      })
      .where(eq(schema.users.id, tgUser.id))
      .returning(),
      
    db.insert(schema.transactions).values({
      userId: tgUser.id,
      type: 'deposit',
      amount: totalCredited,
      status: 'completed',
      createdAt: now
    })
  ]);

  return c.json({ success: true, user: batchResponse[0][0] });
});

// Withdraw Simulation
const withdrawSchema = z.object({ 
  amount: z.number().positive(),
  address: z.string().regex(/^(0x[a-fA-F0-9]{40}|T[A-Za-z1-9]{33}|[LM][a-km-zA-HJ-NP-Z1-9]{26,33})$/, 'Invalid crypto address format')
});
app.post('/api/withdraw', zValidator('json', withdrawSchema), async (c) => {
  const tgUser = c.get('user');
  const db = drizzle(c.env.DB);
  const { amount } = c.req.valid('json');

  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);
  
  if (user.balance < amount) return c.json({ error: 'Insufficient balance' }, 400);

  // Check if they have at least one investment
  const userInvestments = await db.select().from(schema.investments).where(eq(schema.investments.userId, tgUser.id)).limit(1).all();
  if (userInvestments.length === 0) {
    return c.json({ error: 'Withdrawals unlock after your first plan matures' }, 403);
  }

  const now = Math.floor(Date.now() / 1000);

  const batchResponse = await db.batch([
    db.update(schema.users)
      .set({ 
        balance: user.balance - amount,
        totalWithdrawn: user.totalWithdrawn + amount
      })
      .where(eq(schema.users.id, tgUser.id))
      .returning(),
      
    db.insert(schema.transactions).values({
      userId: tgUser.id,
      type: 'withdraw',
      amount: -amount,
      status: 'completed', // Simulate instant completion
      createdAt: now
    })
  ]);

  return c.json({ success: true, user: batchResponse[0][0] });
});

// Get Referrals
app.get('/api/referrals', async (c) => {
  const tgUser = c.get('user');
  const db = drizzle(c.env.DB);
  
  const referrals = await db.select().from(schema.users).where(eq(schema.users.referredBy, tgUser.id)).all();
  
  // Calculate total earned dynamically from referrals
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  const totalEarned = user ? user.totalEarned : 0;

  return c.json({ 
    networkSize: referrals.length,
    totalEarned,
    levels: [
      { level: 1, count: referrals.length },
      { level: 2, count: 0 },
      { level: 3, count: 0 }
    ]
  });
});

// Verification Task Claim
app.post('/api/tasks/verify', async (c) => {
  const tgUser = c.get('user');
  const db = drizzle(c.env.DB);
  
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);

  if (user.verificationClaimed) {
    return c.json({ error: 'Already claimed' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  const reward = 165.0;

  const batchResponse = await db.batch([
    db.update(schema.users)
      .set({ 
        balance: user.balance + reward,
        verificationClaimed: true
      })
      .where(eq(schema.users.id, tgUser.id))
      .returning(),
      
    db.insert(schema.transactions).values({
      userId: tgUser.id,
      type: 'verification_bonus',
      amount: reward,
      status: 'completed',
      createdAt: now
    })
  ]);

  return c.json({ success: true, user: batchResponse[0][0] });
});

// Open Gift Box
app.post('/api/rewards/open-box', async (c) => {
  const tgUser = c.get('user');
  const db = drizzle(c.env.DB);
  
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);

  if (user.giftBoxes <= 0) {
    return c.json({ error: 'No gift boxes available' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  // Random reward between $0.50 and $5.00
  const rewardAmount = Math.round((Math.random() * 4.5 + 0.5) * 100) / 100;

  const batchResponse = await db.batch([
    db.update(schema.users)
      .set({ 
        balance: user.balance + rewardAmount,
        giftBoxes: user.giftBoxes - 1
      })
      .where(eq(schema.users.id, tgUser.id))
      .returning(),
      
    db.insert(schema.transactions).values({
      userId: tgUser.id,
      type: 'gift_box_reward',
      amount: rewardAmount,
      status: 'completed',
      createdAt: now
    })
  ]);

  return c.json({ success: true, rewardAmount, user: batchResponse[0][0] });
});

// Claim Deposit Milestone
const depositMilestoneSchema = z.object({ amount: z.number().positive() });
app.post('/api/rewards/deposit-milestone', zValidator('json', depositMilestoneSchema), async (c) => {
  const tgUser = c.get('user');
  const db = drizzle(c.env.DB);
  const { amount } = c.req.valid('json');
  
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);

  // Rewards mapping
  const rewardsMap: Record<number, number> = {
    50: 20,
    100: 40,
    250: 50,
    500: 100,
    1000: 200,
    2500: 400,
    5000: 1000
  };

  const requiredDeposit = amount;
  const rewardAmount = rewardsMap[requiredDeposit];

  if (!rewardAmount) {
    return c.json({ error: 'Invalid milestone' }, 400);
  }

  if (user.totalDeposited < requiredDeposit) {
    return c.json({ error: 'Deposit requirement not met' }, 400);
  }

  // Check if already claimed this exact reward amount for this milestone
  // To keep it simple, we just check if they have a deposit_milestone transaction of this reward amount
  const existingTx = await db.select()
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
      .set({ balance: user.balance + rewardAmount })
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

export default app;
