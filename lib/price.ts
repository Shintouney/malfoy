// Récupère le cours SOL→EUR pour convertir un prix en euros en montant de SOL.
// Source : API publique CoinGecko (gratuite, sans clé). Mise en cache 60 s.
//
// En production, pense à :
//  - utiliser une clé API / un plan payant si le volume augmente,
//  - "verrouiller" le cours au moment de la commande (déjà le cas : on stocke
//    le montant en SOL dans la commande, il ne bouge plus ensuite).

let cache: { eurPerSol: number; ts: number } | null = null;
const TTL_MS = 60_000;

export async function getEurPerSol(): Promise<number> {
  const now = Date.now();
  if (cache && now - cache.ts < TTL_MS) return cache.eurPerSol;

  const res = await fetch(
    'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=eur',
    { cache: 'no-store' },
  );
  if (!res.ok) throw new Error(`price feed HTTP ${res.status}`);

  const data = (await res.json()) as { solana?: { eur?: number } };
  const eurPerSol = data?.solana?.eur;
  if (!eurPerSol || !Number.isFinite(eurPerSol) || eurPerSol <= 0) {
    throw new Error('price feed: valeur invalide');
  }

  cache = { eurPerSol, ts: now };
  return eurPerSol;
}
