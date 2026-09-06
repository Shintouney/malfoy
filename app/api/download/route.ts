import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { verifyDownloadToken } from '@/lib/download-token';
import { getOrder } from '@/lib/orders';
import { config } from '@/lib/config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get('token') ?? '';

  // 1) Le jeton doit être valide et non expiré.
  const { ok, orderId } = verifyDownloadToken(token);
  if (!ok || !orderId) {
    return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 403 });
  }

  // 2) La commande doit exister et être payée.
  const order = getOrder(orderId);
  if (!order || order.status !== 'paid') {
    return NextResponse.json({ error: 'Paiement non confirmé.' }, { status: 403 });
  }

  // 3) Servir le fichier (stocké hors de /public).
  if (!config.gameFilePath) {
    return NextResponse.json(
      { error: 'Fichier du jeu non configuré (GAME_FILE_PATH).' },
      { status: 500 },
    );
  }

  let data: Buffer;
  try {
    data = await fs.readFile(path.resolve(process.cwd(), config.gameFilePath));
  } catch {
    return NextResponse.json(
      { error: 'Fichier du jeu introuvable côté serveur.' },
      { status: 500 },
    );
  }

  return new NextResponse(new Uint8Array(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${config.gameFileName}"`,
      'Content-Length': String(data.length),
      'Cache-Control': 'no-store',
    },
  });
}
