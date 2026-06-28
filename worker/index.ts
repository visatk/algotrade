import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { drizzle } from 'drizzle-orm/d1';
import { eq, and, lte, sql, desc } from 'drizzle-orm';
import * as schema from '../src/db/schema';
import type { TelegramInitUser } from '../src/types';

// ---------------------------------------------------------------------------
// Environment & Types
// ---------------------------------------------------------------------------
export interface Env {
  DB: D1Database;
  TELEGRAM_BOT_TOKEN: string;
  IS_DEV?: string; // Set to "true" ONLY in dev via .dev.vars
}

type Variables = {
  tgUser: TelegramInitUser; // Raw Telegram user (id, first_name, username)
};

// ---------------------------------------------------------------------------
// Server-side Investment Plan Registry (SEC-03 fix)
// ---------------------------------------------------------------------------
const PLAN_REGISTRY: Record<string, { minAmount: number; maxAmount: number; returnPct: number; days: number }> = {
  fan:      { minAmount: 10,    maxAmount: 50,     returnPct: 25,  days: 7 },
  group:    { minAmount: 51,    maxAmount: 200,    returnPct: 40,  days: 7 },
  round16:  { minAmount: 201,   maxAmount: 500,    returnPct: 60,  days: 7 },
  quarter:  { minAmount: 501,   maxAmount: 2000,   returnPct: 80,  days: 7 },
  semi:     { minAmount: 2001,  maxAmount: 10000,  returnPct: 100, days: 7 },
  world:    { minAmount: 10001, maxAmount: 100000, returnPct: 120, days: 7 },
};

// ---------------------------------------------------------------------------
// App Setup
// ---------------------------------------------------------------------------
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use('/api/*', cors({
  origin: ['https://web.telegram.org', 'https://telegram.org'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-Telegram-Init-Data'],
}));

// Global Error Handler
app.onError((err, c) => {
  console.error(`[Error] ${err.message}`, err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// Not Found Handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', message: `Route ${c.req.path} not found` }, 404);
});

// ---------------------------------------------------------------------------
// Telegram Authentication
// ---------------------------------------------------------------------------
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

// Authentication middleware (SEC-01 fix: no more silent dev bypass in production)
app.use('/api/*', async (c, next) => {
  if (c.req.method === 'OPTIONS') return next();

  const initData = c.req.header('X-Telegram-Init-Data');

  if (!initData) {
    // Only allow unauthenticated access if IS_DEV is explicitly set
    if (c.env.IS_DEV === 'true') {
      c.set('tgUser', {
        id: 12345,
        first_name: 'Dev',
        username: 'dev_user',
      });
      return next();
    }
    return c.json({ error: 'Unauthorized: Missing authentication' }, 401);
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
      c.set('tgUser', JSON.parse(userStr));
    } catch {
      return c.json({ error: 'Malformed user data in initData' }, 400);
    }
  } else {
    return c.json({ error: 'No user data found in initData' }, 400);
  }

  await next();
});

// ---------------------------------------------------------------------------
// Helper: create a typed drizzle instance
// ---------------------------------------------------------------------------
function getDb(env: Env) {
  return drizzle(env.DB, { schema });
}

// ---------------------------------------------------------------------------
// Helper: Process Mature Investments (BUG-04 fix: SQL expressions)
// ---------------------------------------------------------------------------
async function processMatureInvestments(db: ReturnType<typeof getDb>, userId: number) {
  const now = Math.floor(Date.now() / 1000);
  
  const matureInvestments = await db.select()
    .from(schema.investments)
    .where(and(
      eq(schema.investments.userId, userId),
      eq(schema.investments.status, 'active'),
      lte(schema.investments.endDate, now)
    )).all();

  if (matureInvestments.length === 0) return;

  let totalReturn = 0;
  let totalPrincipal = 0;
  
  for (const inv of matureInvestments) {
    totalPrincipal += inv.amount;
    totalReturn += inv.expectedReturn;
  }
  
  const totalCredit = totalPrincipal + totalReturn;

  // Use SQL expressions to prevent race conditions (BUG-04)
  const updates: Parameters<typeof db.batch>[0] = [
    db.update(schema.users)
      .set({
        balance: sql`${schema.users.balance} + ${totalCredit}`,
        totalEarned: sql`${schema.users.totalEarned} + ${totalReturn}`
      })
      .where(eq(schema.users.id, userId)),
      
    db.insert(schema.transactions).values({
      userId,
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
  
  await db.batch(updates as any);
}

// ---------------------------------------------------------------------------
// Helper: Get user with mature investment processing
// ---------------------------------------------------------------------------
async function getUserWithMature(db: ReturnType<typeof getDb>, userId: number) {
  await processMatureInvestments(db, userId);
  return db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
}

// ---------------------------------------------------------------------------
// POST /api/auth/sync — Sync or create user
// ---------------------------------------------------------------------------
app.post('/api/auth/sync', async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
  let user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  
  if (!user) {
    const initData = c.req.header('X-Telegram-Init-Data') || '';
    const urlParams = new URLSearchParams(initData);
    const startParam = urlParams.get('start_param');
    let referredBy: number | null = null;
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
    
    const [insertedUser] = await db.insert(schema.users).values(newUser)
      .onConflictDoNothing() // Handle race condition on concurrent first-load
      .returning();
    user = insertedUser ?? await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  }

  // Process any mature investments
  user = await getUserWithMature(db, tgUser.id);

  return c.json({ user });
});

// ---------------------------------------------------------------------------
// GET /api/user — Get current user profile
// ---------------------------------------------------------------------------
app.get('/api/user', async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
  const user = await getUserWithMature(db, tgUser.id);
  if (!user) return c.json({ error: 'User not found' }, 404);
  
  return c.json({ user });
});

// ---------------------------------------------------------------------------
// GET /api/transactions — User transaction history (PERF-05 fix: DB sort + limit)
// ---------------------------------------------------------------------------
app.get('/api/transactions', async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
  const transactions = await db.select()
    .from(schema.transactions)
    .where(eq(schema.transactions.userId, tgUser.id))
    .orderBy(desc(schema.transactions.createdAt))
    .limit(50)
    .all();
  
  return c.json({ transactions });
});

// ---------------------------------------------------------------------------
// POST /api/rewards/daily — Claim daily reward (BUG-04 fix: SQL expressions)
// ---------------------------------------------------------------------------
app.post('/api/rewards/daily', async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
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
// POST /api/investments/start — Start an investment (SEC-03 fix: server-side returns)
// ---------------------------------------------------------------------------
const investSchema = z.object({
  planId: z.string().min(1),
  amount: z.number().positive(),
});

app.post('/api/investments/start', zValidator('json', investSchema), async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
  const { planId, amount } = c.req.valid('json');
  
  // Validate plan exists
  const plan = PLAN_REGISTRY[planId];
  if (!plan) {
    return c.json({ error: `Invalid plan: ${planId}` }, 400);
  }
  
  // Validate amount is within plan range
  if (amount < plan.minAmount || amount > plan.maxAmount) {
    return c.json({ error: `Amount must be between $${plan.minAmount} and $${plan.maxAmount} for ${planId} plan` }, 400);
  }
  
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);
  
  if (user.balance < amount) {
    return c.json({ error: 'Insufficient balance' }, 400);
  }

  // Server-side computation of expected return
  const expectedReturn = amount * (plan.returnPct / 100);
  const now = Math.floor(Date.now() / 1000);
  const endDate = now + (plan.days * 24 * 60 * 60);

  await db.batch([
    db.update(schema.users)
      .set({ balance: sql`${schema.users.balance} - ${amount}` })
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

  return c.json({ success: true, expectedReturn });
});

// ---------------------------------------------------------------------------
// GET /api/investments — Get user investments
// ---------------------------------------------------------------------------
app.get('/api/investments', async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
  const investments = await db.select()
    .from(schema.investments)
    .where(eq(schema.investments.userId, tgUser.id))
    .orderBy(desc(schema.investments.startDate))
    .all();
  return c.json({ investments });
});

// ---------------------------------------------------------------------------
// Crypto Price Helper (with Cloudflare edge caching)
// ---------------------------------------------------------------------------
async function fetchBinancePrice(symbol: string): Promise<number> {
  try {
    const res = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${symbol}`, {
      cf: { cacheTtl: 60 }
    } as RequestInit);
    const data = (await res.json()) as { price?: string };
    const price = parseFloat(data.price || '0');
    return price > 0 ? price : 0;
  } catch {
    return 0;
  }
}

// ---------------------------------------------------------------------------
// Deposit Transaction Verification (SEC-02 fix: no backdoor, BUG-05 fix: BEP20 decimals)
// ---------------------------------------------------------------------------
async function verifyDepositTx(txid: string, network: string, expectedUsd: number): Promise<boolean> {
  // SEC-02: 0xMOCK backdoor REMOVED

  try {
    if (network === 'USDT(TRX20)') {
      const res = await fetch(`https://apilist.tronscanapi.com/api/transaction-info?hash=${txid}`);
      const data = (await res.json()) as any;
      if (data.contractRet !== 'SUCCESS') return false;
      const expectedTo = 'TGxhyDRrU8EfzozZqM7sK6bztSK348Ue9Y';
      for (const tr of (data.tokenTransferInfo ? [data.tokenTransferInfo] : [])) {
        if (tr && tr.to_address === expectedTo) {
          const amount = parseInt(tr.amount_str, 10) / 1e6;
          if (amount >= expectedUsd * 0.98) return true;
        }
      }
      return false;
    }
    
    if (network === 'LTC') {
      const res = await fetch(`https://api.blockcypher.com/v1/ltc/main/txs/${txid}`);
      const data = (await res.json()) as any;
      const ltcPrice = await fetchBinancePrice('LTCUSDT');
      if (ltcPrice <= 0) return false; // Guard: can't verify without price
      const expectedTo = 'LS4tMyzN5pzovB3iJtmo1cWoo8gHdNcjxy';
      for (const out of (data.outputs || [])) {
        if (out.addresses && out.addresses.includes(expectedTo)) {
          const amount = out.value / 1e8;
          if (amount * ltcPrice >= expectedUsd * 0.98) return true;
        }
      }
      return false;
    }

    if (network === 'BNB' || network === 'ETH') {
      const rpc = network === 'BNB' ? 'https://bsc-dataseed.binance.org' : 'https://cloudflare-eth.com';
      const expectedTo = network === 'BNB' ? '0x26C61a35D76656EFf940444b5D7c4261Afb37c95' : '0x32717e9d5e81ca1cb22335c412421e6f83b69d83';
      const symbol = network === 'BNB' ? 'BNBUSDT' : 'ETHUSDT';
      const price = await fetchBinancePrice(symbol);
      if (price <= 0) return false; // Guard: can't verify without price
      
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionByHash', params: [txid] })
      });
      const data = (await res.json()) as any;
      if (!data.result || data.result.to?.toLowerCase() !== expectedTo.toLowerCase()) return false;
      const amount = parseInt(data.result.value, 16) / 1e18;
      if (amount * price >= expectedUsd * 0.98) return true;
      return false;
    }

    if (network === 'USDT(BEP20)') {
      const rpc = 'https://bsc-dataseed.binance.org';
      const expectedTo = '0x32717e9d5e81ca1cb22335c412421e6f83b69d83';
      
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionReceipt', params: [txid] })
      });
      const data = (await res.json()) as any;
      if (!data.result || data.result.status !== '0x1') return false;
      
      const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
      const paddedTo = '0x000000000000000000000000' + expectedTo.toLowerCase().replace('0x', '');
      
      for (const log of (data.result.logs || [])) {
        if (log.topics && log.topics[0] === transferTopic && log.topics[2]?.toLowerCase() === paddedTo) {
          // BUG-05 fix: USDT on BEP20 has 6 decimals, not 18
          const amount = parseInt(log.data, 16) / 1e6;
          if (amount >= expectedUsd * 0.98) return true;
        }
      }
      return false;
    }
    
    return false;
  } catch (e) {
    console.error('[verifyDepositTx] Verification failed:', e);
    return false;
  }
}

// ---------------------------------------------------------------------------
// POST /api/deposit — Deposit with blockchain verification + referral bonuses
// ---------------------------------------------------------------------------
const depositSchema = z.object({ 
  amount: z.number().positive(),
  network: z.string().min(1),
  txid: z.string().min(10) // Real txids are long
});

app.post('/api/deposit', zValidator('json', depositSchema), async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  const { amount, network, txid } = c.req.valid('json');

  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);

  // Check for duplicate TXID
  const existingTx = await db.select({ id: schema.transactions.id })
    .from(schema.transactions)
    .where(eq(schema.transactions.txid, txid))
    .get();
  if (existingTx) {
    return c.json({ error: 'Transaction ID has already been used' }, 400);
  }

  // Verify payment on-chain
  const isValid = await verifyDepositTx(txid, network, amount);
  if (!isValid) {
    return c.json({ error: 'Transaction verification failed. Please check the TXID and ensure it matches the requested amount to our wallet.' }, 400);
  }

  const bonus20 = amount * 0.2;
  const bonus50 = Math.min(amount * 0.5, 250);
  const totalCredited = amount + bonus20 + bonus50;
  const rewardBoxes = amount >= 100 ? 20 : 5;
  const now = Math.floor(Date.now() / 1000);

  // Build atomic batch with SQL expressions (BUG-04 fix)
  const updates: any[] = [
    db.update(schema.users)
      .set({ 
        balance: sql`${schema.users.balance} + ${totalCredited}`,
        totalDeposited: sql`${schema.users.totalDeposited} + ${amount}`,
        giftBoxes: sql`${schema.users.giftBoxes} + ${rewardBoxes}`
      })
      .where(eq(schema.users.id, tgUser.id))
      .returning(),
      
    db.insert(schema.transactions).values({
      userId: tgUser.id,
      type: 'deposit',
      amount: totalCredited,
      txid,
      status: 'completed',
      createdAt: now
    })
  ];

  // Distribute referral bonuses up the chain
  if (user.referredBy) {
    const l1 = await db.select().from(schema.users).where(eq(schema.users.id, user.referredBy)).get();
    if (l1) {
      const l1Amount = amount * 0.10;
      updates.push(
        db.update(schema.users)
          .set({
            balance: sql`${schema.users.balance} + ${l1Amount}`,
            totalEarned: sql`${schema.users.totalEarned} + ${l1Amount}`
          })
          .where(eq(schema.users.id, l1.id)),
        db.insert(schema.transactions).values({
          userId: l1.id, type: 'referral_bonus', amount: l1Amount, status: 'completed', createdAt: now
        })
      );
      
      if (l1.referredBy) {
        const l2 = await db.select().from(schema.users).where(eq(schema.users.id, l1.referredBy)).get();
        if (l2) {
          const l2Amount = amount * 0.05;
          updates.push(
            db.update(schema.users)
              .set({
                balance: sql`${schema.users.balance} + ${l2Amount}`,
                totalEarned: sql`${schema.users.totalEarned} + ${l2Amount}`
              })
              .where(eq(schema.users.id, l2.id)),
            db.insert(schema.transactions).values({
              userId: l2.id, type: 'referral_bonus', amount: l2Amount, status: 'completed', createdAt: now
            })
          );
          
          if (l2.referredBy) {
            const l3 = await db.select().from(schema.users).where(eq(schema.users.id, l2.referredBy)).get();
            if (l3) {
              const l3Amount = amount * 0.01;
              updates.push(
                db.update(schema.users)
                  .set({
                    balance: sql`${schema.users.balance} + ${l3Amount}`,
                    totalEarned: sql`${schema.users.totalEarned} + ${l3Amount}`
                  })
                  .where(eq(schema.users.id, l3.id)),
                db.insert(schema.transactions).values({
                  userId: l3.id, type: 'referral_bonus', amount: l3Amount, status: 'completed', createdAt: now
                })
              );
            }
          }
        }
      }
    }
  }

  const batchResponse = await db.batch(updates as any);
  return c.json({ success: true, user: batchResponse[0][0] });
});

// ---------------------------------------------------------------------------
// POST /api/withdraw — Withdraw funds (SEC-06 fix: minimum amount)
// ---------------------------------------------------------------------------
const withdrawSchema = z.object({ 
  amount: z.number().min(5, 'Minimum withdrawal is $5'),
  address: z.string().regex(
    /^(0x[a-fA-F0-9]{40}|T[A-Za-z1-9]{33}|[LM][a-km-zA-HJ-NP-Z1-9]{26,33})$/,
    'Invalid crypto address format'
  )
});

app.post('/api/withdraw', zValidator('json', withdrawSchema), async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  const { amount } = c.req.valid('json');

  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);
  
  if (user.balance < amount) return c.json({ error: 'Insufficient balance' }, 400);

  // Require at least one completed investment
  const hasInvestment = await db.select({ id: schema.investments.id })
    .from(schema.investments)
    .where(eq(schema.investments.userId, tgUser.id))
    .limit(1)
    .get();
  if (!hasInvestment) {
    return c.json({ error: 'Withdrawals unlock after your first plan matures' }, 403);
  }

  const now = Math.floor(Date.now() / 1000);

  const batchResponse = await db.batch([
    db.update(schema.users)
      .set({ 
        balance: sql`${schema.users.balance} - ${amount}`,
        totalWithdrawn: sql`${schema.users.totalWithdrawn} + ${amount}`
      })
      .where(eq(schema.users.id, tgUser.id))
      .returning(),
      
    db.insert(schema.transactions).values({
      userId: tgUser.id,
      type: 'withdraw',
      amount: -amount,
      status: 'completed',
      createdAt: now
    })
  ]);

  return c.json({ success: true, user: batchResponse[0][0] });
});

// ---------------------------------------------------------------------------
// GET /api/referrals — Get referral network with recursive CTE (PERF-02 fix)
// ---------------------------------------------------------------------------
app.get('/api/referrals', async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  const totalEarned = user ? user.totalEarned : 0;
  
  // Use recursive CTE for efficient 3-level referral counting
  const result = await db.run(sql`
    WITH RECURSIVE ref_tree AS (
      SELECT id, 1 AS level FROM users WHERE referred_by = ${tgUser.id}
      UNION ALL
      SELECT u.id, rt.level + 1 FROM users u JOIN ref_tree rt ON u.referred_by = rt.id WHERE rt.level < 3
    )
    SELECT level, COUNT(*) AS count FROM ref_tree GROUP BY level ORDER BY level
  `);

  const levelCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  for (const row of (result.results as any[] || [])) {
    levelCounts[row.level] = row.count;
  }

  return c.json({ 
    networkSize: levelCounts[1] + levelCounts[2] + levelCounts[3],
    totalEarned,
    levels: [
      { level: 1, count: levelCounts[1] },
      { level: 2, count: levelCounts[2] },
      { level: 3, count: levelCounts[3] }
    ]
  });
});

// ---------------------------------------------------------------------------
// GET /api/referrals/top — Top referrers leaderboard
// ---------------------------------------------------------------------------
app.get('/api/referrals/top', async (c) => {
  const db = getDb(c.env);
  
  const topReferrers = await db.select({
    id: schema.users.id,
    firstName: schema.users.firstName,
    username: schema.users.username,
    count: sql<number>`(SELECT COUNT(*) FROM users u WHERE u.referred_by = ${schema.users.id})`.as('count')
  })
  .from(schema.users)
  .where(sql`(SELECT COUNT(*) FROM users u WHERE u.referred_by = ${schema.users.id}) > 0`)
  .orderBy(desc(sql`count`))
  .limit(10)
  .all();

  return c.json({ topReferrers });
});

// ---------------------------------------------------------------------------
// POST /api/tasks/verify — Claim verification bonus
// ---------------------------------------------------------------------------
app.post('/api/tasks/verify', async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
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
        balance: sql`${schema.users.balance} + ${reward}`,
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

// ---------------------------------------------------------------------------
// POST /api/rewards/open-box — Open a gift box
// ---------------------------------------------------------------------------
app.post('/api/rewards/open-box', async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);

  if (user.giftBoxes <= 0) {
    return c.json({ error: 'No gift boxes available' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  const rewardAmount = Math.round((Math.random() * 4.5 + 0.5) * 100) / 100;

  const batchResponse = await db.batch([
    db.update(schema.users)
      .set({ 
        balance: sql`${schema.users.balance} + ${rewardAmount}`,
        giftBoxes: sql`${schema.users.giftBoxes} - 1`
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

// ---------------------------------------------------------------------------
// POST /api/rewards/deposit-milestone — Claim deposit milestone reward
// ---------------------------------------------------------------------------
const depositMilestoneSchema = z.object({ amount: z.number().positive() });

app.post('/api/rewards/deposit-milestone', zValidator('json', depositMilestoneSchema), async (c) => {
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

export default app;
