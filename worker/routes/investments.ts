import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc, sql, and } from 'drizzle-orm';
import * as schema from '../../src/db/schema';
import type { Env, Variables } from '../env';
import { getDb } from '../db';

const investments = new Hono<{ Bindings: Env; Variables: Variables }>();

// Server-side Investment Plan Registry
const PLAN_REGISTRY: Record<string, { minAmount: number; maxAmount: number; returnPct: number; days: number }> = {
  fan:      { minAmount: 10,    maxAmount: 50,     returnPct: 25,  days: 7 },
  group:    { minAmount: 51,    maxAmount: 200,    returnPct: 40,  days: 7 },
  round16:  { minAmount: 201,   maxAmount: 500,    returnPct: 60,  days: 7 },
  quarter:  { minAmount: 501,   maxAmount: 2000,   returnPct: 80,  days: 7 },
  semi:     { minAmount: 2001,  maxAmount: 10000,  returnPct: 100, days: 7 },
  world:    { minAmount: 10001, maxAmount: 100000, returnPct: 120, days: 7 },
};

const investSchema = z.object({
  planId: z.string().min(1),
  amount: z.number().positive(),
});

investments.post('/start', zValidator('json', investSchema), async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
  const { planId, amount } = c.req.valid('json');
  
  const plan = PLAN_REGISTRY[planId];
  if (!plan) return c.json({ error: `Invalid plan: ${planId}` }, 400);
  
  if (amount < plan.minAmount || amount > plan.maxAmount) {
    return c.json({ error: `Amount must be between $${plan.minAmount} and $${plan.maxAmount} for ${planId} plan` }, 400);
  }
  
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);
  
  if (user.balance < amount) return c.json({ error: 'Insufficient balance' }, 400);

  const expectedReturn = amount * (plan.returnPct / 100);
  const now = Math.floor(Date.now() / 1000);
  const endDate = now + (plan.days * 24 * 60 * 60);

  const updateResult = await db.update(schema.users)
    .set({ balance: sql`${schema.users.balance} - ${amount}` })
    .where(and(eq(schema.users.id, tgUser.id), sql`${schema.users.balance} >= ${amount}`))
    .returning();
    
  if (updateResult.length === 0) {
    return c.json({ error: 'Insufficient balance or user not found' }, 400);
  }

  await db.batch([
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

investments.get('/', async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
  const userInvestments = await db.select()
    .from(schema.investments)
    .where(eq(schema.investments.userId, tgUser.id))
    .orderBy(desc(schema.investments.startDate))
    .all();
  return c.json({ investments: userInvestments });
});

export default investments;
