import { Hono } from 'hono';
import { eq, sql, and } from 'drizzle-orm';
import * as schema from '../../src/db/schema';
import type { Env, Variables } from '../env';
import { getDb } from '../db';

const tasks = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---------------------------------------------------------------------------
// POST /api/tasks/verify — Claim verification bonus
// ---------------------------------------------------------------------------
tasks.post('/verify', async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  if (!user) return c.json({ error: 'User not found' }, 404);

  if (user.verificationClaimed) {
    return c.json({ error: 'Already claimed' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  const reward = 165.0;

  const updateResult = await db.update(schema.users)
    .set({ 
      balance: sql`${schema.users.balance} + ${reward}`,
      verificationClaimed: true
    })
    .where(and(eq(schema.users.id, tgUser.id), eq(schema.users.verificationClaimed, false)))
    .returning();

  if (updateResult.length === 0) {
    return c.json({ error: 'Already claimed or user not found' }, 400);
  }

  await db.batch([
    db.insert(schema.transactions).values({
      userId: tgUser.id,
      type: 'verification_bonus',
      amount: reward,
      status: 'completed',
      createdAt: now
    })
  ]);

  return c.json({ success: true, user: updateResult[0] });
});

export default tasks;
