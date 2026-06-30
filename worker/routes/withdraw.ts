import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, sql, and } from 'drizzle-orm';
import * as schema from '../../src/db/schema';
import type { Env, Variables } from '../env';
import { getDb } from '../db';

const withdraw = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---------------------------------------------------------------------------
// POST /api/withdraw — Withdraw funds
// ---------------------------------------------------------------------------
const withdrawSchema = z.object({ 
  amount: z.number().min(5, 'Minimum withdrawal is $5'),
  address: z.string().regex(
    /^(0x[a-fA-F0-9]{40}|T[A-Za-z1-9]{33}|[LM][a-km-zA-HJ-NP-Z1-9]{26,33})$/,
    'Invalid crypto address format'
  )
});

withdraw.post('/', zValidator('json', withdrawSchema), async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  const { amount, address } = c.req.valid('json');

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

  const updateResult = await db.update(schema.users)
    .set({ 
      balance: sql`${schema.users.balance} - ${amount}`,
      totalWithdrawn: sql`${schema.users.totalWithdrawn} + ${amount}`
    })
    .where(and(eq(schema.users.id, tgUser.id), sql`${schema.users.balance} >= ${amount}`))
    .returning();

  if (updateResult.length === 0) {
    return c.json({ error: 'Insufficient balance or user not found' }, 400);
  }

  const batchResponse = await db.batch([
    db.insert(schema.transactions).values({
      userId: tgUser.id,
      type: 'withdraw',
      amount: -amount,
      txid: `${address}::${now}`, // Store address here since we don't have an address col, append now to bypass unique constraint
      status: 'pending', // Admins will process this manually
      createdAt: now
    }).returning()
  ]);

  return c.json({ success: true, user: updateResult[0] });
});

export default withdraw;
