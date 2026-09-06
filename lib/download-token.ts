// Jetons de téléchargement signés (HMAC) à durée de vie limitée.
// Principe : après confirmation du paiement, le serveur délivre un jeton signé.
// Le fichier n'est servi QUE contre un jeton valide et non expiré — impossible
// de deviner l'URL ou de la partager indéfiniment.
import crypto from 'crypto';
import { config } from './config';

const DEFAULT_TTL_MS = 60 * 60 * 1000; // 1 heure

export function createDownloadToken(orderId: string, ttlMs: number = DEFAULT_TTL_MS): string {
  const exp = Date.now() + ttlMs;
  const payload = `${orderId}.${exp}`;
  const sig = crypto.createHmac('sha256', config.downloadSecret).update(payload).digest('hex');
  return Buffer.from(`${payload}.${sig}`).toString('base64url');
}

export function verifyDownloadToken(token: string): { ok: boolean; orderId?: string } {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf8');
    const parts = decoded.split('.');
    if (parts.length !== 3) return { ok: false };
    const [orderId, expStr, sig] = parts;

    const payload = `${orderId}.${expStr}`;
    const expected = crypto
      .createHmac('sha256', config.downloadSecret)
      .update(payload)
      .digest('hex');

    const a = Buffer.from(sig, 'hex');
    const b = Buffer.from(expected, 'hex');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return { ok: false };

    if (Date.now() > Number(expStr)) return { ok: false };
    return { ok: true, orderId };
  } catch {
    return { ok: false };
  }
}
