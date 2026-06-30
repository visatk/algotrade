import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, sql } from 'drizzle-orm';
import * as schema from '../../src/db/schema';
import type { Env, Variables } from '../env';
import { getDb } from '../db';

const deposit = new Hono<{ Bindings: Env; Variables: Variables }>();

// ---------------------------------------------------------------------------
// Crypto Price Helper (with Cloudflare edge caching)
// ---------------------------------------------------------------------------
export async function fetchBinancePrice(symbol: string): Promise<number> {
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
// Deposit Transaction Verification
// ---------------------------------------------------------------------------
export async function verifyDepositTx(txid: string, network: string, expectedUsd: number, env: Env): Promise<boolean> {
  try {
    if (network === 'TRC20') {
      const res = await fetch(`https://apilist.tronscanapi.com/api/transaction-info?hash=${txid}`);
      const data = (await res.json()) as { contractRet?: string; tokenTransferInfo?: { to_address: string, amount_str: string } };
      if (data.contractRet !== 'SUCCESS') return false;
      const expectedTo = env.DEPOSIT_ADDRESS_TRC20;
      for (const tr of (data.tokenTransferInfo ? [data.tokenTransferInfo] : [])) {
        if (tr && tr.to_address === expectedTo) {
          const amount = parseInt(tr.amount_str, 10) / 1e6;
          if (amount >= expectedUsd * 0.995 && amount <= expectedUsd * 1.005) return true;
        }
      }
      return false;
    }
    
    if (network === 'LTC') {
      const res = await fetch(`https://api.blockcypher.com/v1/ltc/main/txs/${txid}`);
      const data = (await res.json()) as { outputs?: { addresses?: string[], value: number }[] };
      const ltcPrice = await fetchBinancePrice('LTCUSDT');
      if (ltcPrice <= 0) return false;
      const expectedTo = env.DEPOSIT_ADDRESS_LTC;
      for (const out of (data.outputs || [])) {
        if (out.addresses && out.addresses.includes(expectedTo)) {
          const amount = out.value / 1e8;
          if (amount * ltcPrice >= expectedUsd * 0.995 && amount * ltcPrice <= expectedUsd * 1.05) return true;
        }
      }
      return false;
    }

    if (network === 'BNB' || network === 'ETH') {
      const rpc = network === 'BNB' ? 'https://bsc-dataseed.binance.org' : 'https://cloudflare-eth.com';
      const expectedTo = network === 'BNB' ? env.DEPOSIT_ADDRESS_BNB : env.DEPOSIT_ADDRESS_ETH;
      const symbol = network === 'BNB' ? 'BNBUSDT' : 'ETHUSDT';
      const price = await fetchBinancePrice(symbol);
      if (price <= 0) return false;
      
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionByHash', params: [txid] })
      });
      const data = (await res.json()) as { result?: { to?: string, value: string } };
      if (!data.result || data.result.to?.toLowerCase() !== expectedTo.toLowerCase()) return false;
      const amount = parseInt(data.result.value, 16) / 1e18;
      if (amount * price >= expectedUsd * 0.995 && amount * price <= expectedUsd * 1.05) return true;
      return false;
    }

    if (network === 'BEP20') {
      const rpc = 'https://bsc-dataseed.binance.org';
      const expectedTo = env.DEPOSIT_ADDRESS_BEP20;
      
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getTransactionReceipt', params: [txid] })
      });
      const data = (await res.json()) as { result?: { status: string, logs?: { topics: string[], data: string }[] } };
      if (!data.result || data.result.status !== '0x1') return false;
      
      const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
      const paddedTo = '0x000000000000000000000000' + expectedTo.toLowerCase().replace('0x', '');
      
      for (const log of (data.result.logs || [])) {
        if (log.topics && log.topics[0] === transferTopic && log.topics[2]?.toLowerCase() === paddedTo) {
          const amount = parseInt(log.data, 16) / 1e6;
          if (amount >= expectedUsd * 0.995 && amount <= expectedUsd * 1.005) return true;
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
// POST /api/deposit
// ---------------------------------------------------------------------------
const depositSchema = z.object({ 
  amount: z.number().positive(),
  network: z.string().min(1),
  txid: z.string().min(10)
});

deposit.post('/', zValidator('json', depositSchema), async (c) => {
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
  const isValid = await verifyDepositTx(txid, network, amount, c.env);
  if (!isValid) {
    return c.json({ error: 'Transaction verification failed. Please check the TXID and ensure it matches the requested amount to our wallet.' }, 400);
  }

  const bonus20 = amount * 0.2;
  const bonus50 = Math.min(amount * 0.5, 250);
  const totalCredited = amount + bonus20 + bonus50;
  const rewardBoxes = amount >= 100 ? 20 : 5;
  const now = Math.floor(Date.now() / 1000);

  const updates: unknown[] = [
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

  const batchResponse = await db.batch(updates as unknown as Parameters<typeof db.batch>[0]);
  return c.json({ success: true, user: batchResponse[0][0] });
});

export default deposit;
