import { Hono } from 'hono';
import { eq, desc, sql } from 'drizzle-orm';
import * as schema from '../../src/db/schema';
import type { Env, Variables } from '../env';
import { getDb } from '../db';

const referrals = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---------------------------------------------------------------------------
// GET /api/referrals — Get referral network with recursive CTE
// ---------------------------------------------------------------------------
referrals.get('/', async (c) => {
  const tgUser = c.get('tgUser');
  const db = getDb(c.env);
  
  const user = await db.select().from(schema.users).where(eq(schema.users.id, tgUser.id)).get();
  const totalEarned = user ? user.totalEarned : 0;
  
  const result = await db.run(sql`
    WITH RECURSIVE ref_tree AS (
      SELECT id, 1 AS level FROM users WHERE referred_by = ${tgUser.id}
      UNION ALL
      SELECT u.id, rt.level + 1 FROM users u JOIN ref_tree rt ON u.referred_by = rt.id WHERE rt.level < 3
    )
    SELECT level, COUNT(*) AS count FROM ref_tree GROUP BY level ORDER BY level
  `);

  const levelCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  for (const row of (result.results as { level: number; count: number }[] || [])) {
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
referrals.get('/top', async (c) => {
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

export default referrals;
