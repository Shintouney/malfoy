import { NextResponse } from 'next/server';
import crypto from 'crypto';
import BigNumber from 'bignumber.js';
import QRCode from 'qrcode';
import { PublicKey } from '@solana/web3.js';
import { config, accessCodeRequired } from '@/lib/config';
import { getEurPerSol } from '@/lib/price';
import { createReference, buildPaymentUrl } from '@/lib/solana';
import { saveOrder } from '@/lib/orders';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const accessCode = String((body as { accessCode?: unknown }).accessCode ?? '');

  // 1) Vérifier le code d'accès (comparaison à temps constant).
  if (accessCodeRequired) {
    const a = Buffer.from(accessCode);
    const b = Buffer.from(config.accessCode);
    const ok = a.length === b.length && crypto.timingSafeEqual(a, b);
    if (!ok) {
      return NextResponse.json({ error: "Code d'accès invalide." }, { status: 401 });
    }
  }

  // 2) Valider l'adresse marchand.
  try {
    new PublicKey(config.merchantWallet);
  } catch {
    return NextResponse.json(
      { error: 'Configuration serveur invalide (MERCHANT_WALLET).' },
      { status: 500 },
    );
  }

  // 3) Cours SOL/EUR → montant en SOL (verrouillé pour cette commande).
  let eurPerSol: number;
  try {
    eurPerSol = await getEurPerSol();
  } catch {
    return NextResponse.json(
      { error: 'Impossible d’obtenir le cours SOL/EUR, réessaie dans un instant.' },
      { status: 502 },
    );
  }
  const amountSol = new BigNumber((config.priceEur / eurPerSol).toFixed(9));

  // 4) Créer la commande + la demande de paiement Solana Pay.
  const reference = createReference();
  const orderId = crypto.randomUUID();
  const solanaUrl = buildPaymentUrl({
    reference,
    amountSol,
    label: 'TEAM VERITAS',
    message: `${config.gameName} — commande ${orderId.slice(0, 8)}`,
  });
  const qrDataUrl = await QRCode.toDataURL(solanaUrl, { margin: 1, width: 320 });

  saveOrder({
    id: orderId,
    reference: reference.toBase58(),
    amountSol: amountSol.toString(),
    amountEur: config.priceEur,
    status: 'pending',
    createdAt: Date.now(),
  });

  return NextResponse.json({
    orderId,
    recipient: config.merchantWallet,
    amountSol: amountSol.toString(),
    amountEur: config.priceEur,
    eurPerSol,
    network: config.network,
    solanaUrl,
    qrDataUrl,
  });
}
