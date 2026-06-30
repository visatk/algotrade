import { drizzle } from 'drizzle-orm/d1';
import { eq, and, lte, sql } from 'drizzle-orm';
import * as schema from '../src/db/schema';
import type { Env } from './env';

// ---------------------------------------------------------------------------
// Helper: create a typed drizzle instance
// ---------------------------------------------------------------------------
export function getDb(env: Env) {
  return drizzle(env.DB, { schema });
}

// ---------------------------------------------------------------------------
// Helper: Process Mature Investments (BUG-04 fix: SQL expressions)
// ---------------------------------------------------------------------------
export async function processMatureInvestments(db: ReturnType<typeof getDb>, userId: number) {
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
  const updates: unknown[] = [
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
  
  await db.batch(updates as unknown as Parameters<typeof db.batch>[0]);
}

// ---------------------------------------------------------------------------
// Helper: Get user with mature investment processing
// ---------------------------------------------------------------------------
export async function getUserWithMature(db: ReturnType<typeof getDb>, userId: number) {
  await processMatureInvestments(db, userId);
  return db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
}
