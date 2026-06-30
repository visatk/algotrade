import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../../src/db/schema';
import type { Env, Variables } from '../env';
import { getDb } from '../db';

const transactions = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---------------------------------------------------------------------------
// GET /api/transactions — User transaction history
// ---------------------------------------------------------------------------
transactions.get('/', async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
  const txs = await db.select()
    .from(schema.transactions)
    .where(eq(schema.transactions.userId, tgUser.id))
    .orderBy(desc(schema.transactions.createdAt))
    .limit(50)
    .all();
  
  return c.json({ transactions: txs });
});

export default transactions;
