import { Hono } from 'hono';
import { eq, desc, sql } from 'drizzle-orm';
import * as schema from '../../src/db/schema';
import type { Env, Variables } from '../env';
import { getDb } from '../db';

const stats = new Hono<{ Bindings: Env; Variables: Variables }>();

stats.get('/', async (c) => {
  const db = getDb(c.env);
  const now = Date.now();

  const totalDepositsObj = await db.select({ total: sql<number>`SUM(amount)` })
    .from(schema.transactions)
    .where(eq(schema.transactions.type, 'deposit'))
    .get();
  
  const totalWithdrawnObj = await db.select({ total: sql<number>`SUM(amount)` })
    .from(schema.transactions)
    .where(eq(schema.transactions.type, 'withdraw'))
    .get();

  const profit = (totalDepositsObj?.total || 0) + Math.abs(totalWithdrawnObj?.total || 0);
  const longPercent = 55.49 + (Math.random() * 2 - 1); // Float around 55.49%

  const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'AVAX/USDT'];

  const trades = Array.from({ length: 15 }).map((_, i) => {
    const isLong = Math.random() > 0.5;
    const isWinning = Math.random() > 0.3; // 70% win rate
    const pnl = (Math.random() * 50 + 5) * (isWinning ? 1 : -1);
    const timeOffset = Math.floor(Math.random() * 60) * 1000 * 60; // Up to 60 mins ago
    
    return {
      type: isLong ? 'Long' : 'Short',
      pair: pairs[Math.floor(Math.random() * pairs.length)],
      leverage: `${Math.floor(Math.random() * 40) + 10}x`,
      pnl: Math.round(pnl * 100) / 100,
      time: new Date(now - timeOffset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isWinning
    };
  });

  const recentInvestments = await db.select({
    id: schema.investments.id,
    userId: schema.investments.userId,
    amount: schema.investments.amount,
    startDate: schema.investments.startDate
  })
  .from(schema.investments)
  .orderBy(desc(schema.investments.startDate))
  .limit(10)
  .all();

  const investments = recentInvestments.map(inv => ({
    id: `inv-${inv.id}`,
    name: `User${inv.userId}`,
    amount: inv.amount,
    time: new Date(inv.startDate * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }));

  const recentWithdrawals = await db.select({
    id: schema.transactions.id,
    amount: schema.transactions.amount,
    createdAt: schema.transactions.createdAt,
    txid: schema.transactions.txid
  })
  .from(schema.transactions)
  .where(eq(schema.transactions.type, 'withdraw'))
  .orderBy(desc(schema.transactions.createdAt))
  .limit(10)
  .all();

  const withdrawals = recentWithdrawals.map(wd => {
    let address = '0x...';
    if (wd.txid) {
      const parts = wd.txid.split('::');
      if (parts.length > 0 && parts[0].length > 10) {
        address = parts[0].slice(0, 6) + '...' + parts[0].slice(-4);
      }
    }
    return {
      id: `wd-${wd.id}`,
      amount: Math.abs(wd.amount),
      address,
      time: new Date(wd.createdAt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  });

  return c.json({
    profit,
    longPercent,
    trades,
    investments,
    withdrawals
  });
});

export default stats;
