import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { authMiddleware } from './auth';
import type { Env, Variables } from './env';

// Import Routes
import authRouter from './routes/auth';
import userRouter from './routes/user';
import transactionsRouter from './routes/transactions';
import investmentsRouter from './routes/investments';
import depositRouter from './routes/deposit';
import withdrawRouter from './routes/withdraw';
import referralsRouter from './routes/referrals';
import rewardsRouter from './routes/rewards';
import tasksRouter from './routes/tasks';
import statsRouter from './routes/stats';

// ---------------------------------------------------------------------------
// App Setup
// ---------------------------------------------------------------------------
const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use('/api/*', cors({
  origin: ['https://web.telegram.org', 'https://telegram.org'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'X-Telegram-Init-Data'],
}));

// Global Error Handler
app.onError((err, c) => {
  console.error(`[Error] ${err.message}`, err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

// Not Found Handler
app.notFound((c) => {
  return c.json({ error: 'Not Found', message: `Route ${c.req.path} not found` }, 404);
});

// Authentication middleware
app.use('/api/*', authMiddleware);

// ---------------------------------------------------------------------------
// Mount Routes
// ---------------------------------------------------------------------------
app.route('/api/auth', authRouter);
app.route('/api/user', userRouter);
app.route('/api/transactions', transactionsRouter);
app.route('/api/investments', investmentsRouter);
app.route('/api/deposit', depositRouter);
app.route('/api/withdraw', withdrawRouter);
app.route('/api/referrals', referralsRouter);
app.route('/api/rewards', rewardsRouter);
app.route('/api/tasks', tasksRouter);
app.route('/api/stats', statsRouter);

export default app;
