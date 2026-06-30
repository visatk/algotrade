import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import * as schema from '../../src/db/schema';
import type { Env, Variables } from '../env';
import { getDb, getUserWithMature } from '../db';

const auth = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---------------------------------------------------------------------------
// POST /api/auth/sync — Sync or create user
// ---------------------------------------------------------------------------
auth.post('/sync', async (c) => {
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
      
    if (insertedUser) {
      await db.insert(schema.transactions).values({
        userId: tgUser.id,
        type: 'join_bonus',
        amount: 5.00,
        status: 'completed',
        createdAt: Math.floor(Date.now() / 1000)
      });
    }

    user = insertedUser ?? await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  } else {
    // Sync updated name/username from Telegram on every launch
    if (user.firstName !== tgUser.first_name || user.username !== (tgUser.username || null)) {
      await db.update(schema.users)
        .set({ firstName: tgUser.first_name, username: tgUser.username || null })
        .where(eq(schema.users.id, tgUser.id));
      user.firstName = tgUser.first_name;
      user.username = tgUser.username || null;
    }
  }

  // Process any mature investments
  user = await getUserWithMature(db, tgUser.id);

  return c.json({ user });
});

export default auth;
