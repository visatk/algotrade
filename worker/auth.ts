import type { Context, Next } from 'hono';
import type { Env, Variables } from './env';

function bufferEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a[i] ^ b[i];
  }
  return result === 0;
}

function hexToUint8Array(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return arr;
}

export async function verifyTelegramWebAppData(telegramInitData: string, botToken: string): Promise<boolean> {
  const urlParams = new URLSearchParams(telegramInitData);
  const hash = urlParams.get('hash');
  const authDateStr = urlParams.get('auth_date');
  
  if (!hash || !authDateStr) return false;
  
  const authDate = parseInt(authDateStr, 10);
  const now = Math.floor(Date.now() / 1000);
  // Prevent replay attacks: Reject if initData is older than 5 minutes (300 seconds)
  if (now - authDate > 300) return false;
  
  urlParams.delete('hash');
  
  const keys = Array.from(urlParams.keys()).sort();
  const dataCheckString = keys.map(key => `${key}=${urlParams.get(key)}`).join('\n');
  
  const encoder = new TextEncoder();
  const secretKey = await crypto.subtle.importKey(
    'raw',
    encoder.encode('WebAppData'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const hmacKeyBuffer = await crypto.subtle.sign('HMAC', secretKey, encoder.encode(botToken));
  
  const finalKey = await crypto.subtle.importKey(
    'raw',
    hmacKeyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const calculatedHashBuffer = await crypto.subtle.sign('HMAC', finalKey, encoder.encode(dataCheckString));
  
  const calculatedHashArray = new Uint8Array(calculatedHashBuffer);
  const providedHashArray = hexToUint8Array(hash);
  
  return bufferEqual(calculatedHashArray, providedHashArray);
}

export const authMiddleware = async (c: Context<{ Bindings: Env; Variables: Variables }>, next: Next) => {
  if (c.req.method === 'OPTIONS') return next();

  const initData = c.req.header('X-Telegram-Init-Data');

  if (!initData) {
    // Only allow unauthenticated access if IS_DEV is explicitly set
    if (c.env.IS_DEV === 'true') {
      c.set('tgUser', {
        id: 12345,
        first_name: 'Dev',
        username: 'dev_user',
      });
      return next();
    }
    return c.json({ error: 'Unauthorized: Missing authentication' }, 401);
  }

  if (!c.env.TELEGRAM_BOT_TOKEN) {
    return c.json({ error: 'Server misconfiguration: missing BOT_TOKEN' }, 500);
  }

  const isValid = await verifyTelegramWebAppData(initData, c.env.TELEGRAM_BOT_TOKEN);
  if (!isValid) {
    return c.json({ error: 'Unauthorized: Invalid Telegram Init Data' }, 401);
  }

  const urlParams = new URLSearchParams(initData);
  const userStr = urlParams.get('user');
  if (userStr) {
    try {
      c.set('tgUser', JSON.parse(userStr));
    } catch {
      return c.json({ error: 'Malformed user data in initData' }, 400);
    }
  } else {
    return c.json({ error: 'No user data found in initData' }, 400);
  }

  await next();
};
