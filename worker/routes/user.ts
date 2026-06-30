import { Hono } from 'hono';
import type { Env, Variables } from '../env';
import { getDb, getUserWithMature } from '../db';

const user = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---------------------------------------------------------------------------
// GET /api/user — Get current user profile
// ---------------------------------------------------------------------------
user.get('/', async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
  const currentUser = await getUserWithMature(db, tgUser.id);
  if (!currentUser) return c.json({ error: 'User not found' }, 404);
  
  return c.json({ user: currentUser });
});

export default user;
