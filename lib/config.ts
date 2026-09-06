// Configuration centralisée, lue depuis les variables d'environnement.
// N'importe ce module QUE côté serveur (routes API, composants serveur).
// Ne l'importe jamais dans un composant client ("use client") : il contient des secrets.

const network = (process.env.SOLANA_NETWORK ?? 'devnet') as 'devnet' | 'mainnet-beta';

const defaultRpc =
  network === 'mainnet-beta'
    ? 'https://api.mainnet-beta.solana.com'
    : 'https://api.devnet.solana.com';

export const config = {
  network,
  rpcUrl: process.env.SOLANA_RPC_URL ?? defaultRpc,

  // Adresse marchand qui reçoit les paiements.
  merchantWallet:
    process.env.MERCHANT_WALLET ?? 'HMvrkW1sAkhVDGHCpudLbSQjvrGWE3qtyqmyVZzhDEHm',

  priceEur: Number(process.env.PRICE_EUR ?? '375'),

  // Code d'accès (vide = pas de protection).
  accessCode: process.env.ACCESS_CODE ?? '',

  // Secret de signature des liens de téléchargement.
  downloadSecret: process.env.DOWNLOAD_SECRET ?? 'dev-only-insecure-secret-change-me',

  gameFilePath: process.env.GAME_FILE_PATH ?? './protected/jeu.zip',
  gameFileName: process.env.GAME_FILE_NAME ?? 'jeu.zip',
  gameName: process.env.GAME_NAME ?? 'NOM DU JEU',
} as const;

export const accessCodeRequired = config.accessCode.length > 0;
