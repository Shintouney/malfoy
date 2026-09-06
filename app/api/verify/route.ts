import { NextResponse } from 'next/server';
import BigNumber from 'bignumber.js';
import { PublicKey } from '@solana/web3.js';
import { getOrder, markPaid } from '@/lib/orders';
import { checkPayment } from '@/lib/solana';
import { createDownloadToken } from '@/lib/download-token';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId') ?? '';

  const order = getOrder(orderId);
  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 });
  }

  // Déjà payée : on redélivre un jeton de téléchargement.
  if (order.status === 'paid') {
    return NextResponse.json({ paid: true, downloadToken: createDownloadToken(order.id) });
  }

  let status;
  try {
    status = await checkPayment(new PublicKey(order.reference), new BigNumber(order.amountSol));
  } catch {
    return NextResponse.json(
      { paid: false, status: 'rpc_error', error: 'Erreur réseau Solana, on réessaie.' },
      { status: 200 },
    );
  }

  if (status === 'confirmed') {
    markPaid(order.id);
    return NextResponse.json({ paid: true, downloadToken: createDownloadToken(order.id) });
  }

  return NextResponse.json({ paid: false, status });
}
