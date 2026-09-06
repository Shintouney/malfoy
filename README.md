# TEAM VERITAS — boutique du jeu (paiement Solana)

Petite app **Next.js** pour vendre **ton jeu vidéo** avec paiement en **Solana**,
proprement, via le standard **[Solana Pay](https://docs.solanapay.com/)**.

## Pourquoi c'est fait comme ça (et pas « envoie-moi des SOL »)

- Chaque commande génère une **référence unique** attachée au paiement.
- Le serveur **vérifie sur la blockchain** que *ce* client a payé le **montant exact**
  à **ton adresse** — avant de livrer quoi que ce soit.
- Le jeu est livré par un **lien de téléchargement signé, à usage unique et temporaire** ;
  le fichier reste **hors de `/public`**, donc impossible à récupérer sans payer.
- La vitrine affiche une **identité, un prix, des conditions** : c'est ce qui distingue
  une vraie boutique d'une arnaque.

## Parcours

`/` (landing) → `/buy` (code d'accès → QR Solana Pay → vérification → téléchargement).

---

## Démarrage

```bash
npm install
cp .env.local.example .env.local   # puis édite les valeurs
npm run dev                        # http://localhost:3000
```

### Variables à remplir dans `.env.local`

| Variable | Rôle |
|---|---|
| `SOLANA_NETWORK` | `devnet` pour tester, `mainnet-beta` pour de l'argent réel |
| `MERCHANT_WALLET` | ton adresse Solana qui reçoit les paiements |
| `PRICE_EUR` | prix en euros (converti en SOL au cours du moment) |
| `ACCESS_CODE` | code d'accès à la page de paiement (vide = désactivé) |
| `DOWNLOAD_SECRET` | secret de signature des liens — **génère-en un vrai** |
| `GAME_FILE_PATH` | chemin du fichier du jeu (**hors `/public`**) |
| `GAME_NAME` | nom affiché du jeu |

Générer un `DOWNLOAD_SECRET` :

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Déposer le jeu :

```bash
cp /chemin/vers/mon-jeu.zip ./protected/jeu.zip
```

---

## ⚠️ Tester d'abord sur devnet

1. `SOLANA_NETWORK=devnet` dans `.env.local`.
2. Crée un wallet de test (Phantom → réseau *Devnet*) et récupère des SOL gratuits :
   `solana airdrop 2 <ton_wallet>` ou https://faucet.solana.com.
3. Mets `MERCHANT_WALLET` = une **autre** adresse de test (le vendeur).
4. Achète depuis le wallet de test, vérifie que le téléchargement se débloque.
5. Quand tout marche : passe `SOLANA_NETWORK=mainnet-beta` et remets ta vraie adresse.

> Les RPC publics par défaut sont lents et limités. Pour la prod, prends un RPC dédié
> (Helius, QuickNode, Triton…) et renseigne `SOLANA_RPC_URL`.

---

## À faire avant d'ouvrir la vente (checklist)

- [ ] **Remplacer le stockage des commandes** (`lib/orders.ts`) par une vraie base de
      données. Actuellement c'est **en mémoire** : perdu au redémarrage, KO en serverless.
- [ ] Remplir le contenu de la vitrine (`app/page.tsx`) : nom du jeu, pitch, captures,
      caractéristiques, **identité du vendeur** et **contact**.
- [ ] Rédiger des **conditions de vente** et une **politique de remboursement** claires.
      (Rappel : un paiement crypto est irréversible côté client — sois transparent.)
- [ ] Vérifier tes **obligations légales** : vente de bien numérique = souvent **TVA**
      due dans l'UE selon le pays de l'acheteur, déclaration des revenus, etc.
      Renseigne-toi selon ta situation / ton pays.
- [ ] Idéalement, limiter chaque lien de téléchargement à **N usages** (anti-partage).

## Architecture

```
app/
  page.tsx                 vitrine (landing)
  buy/page.tsx             page dynamique : code → paiement → livraison (client)
  api/create-order         crée la commande + QR Solana Pay (vérifie le code)
  api/verify               vérifie le paiement on-chain, délivre le jeton
  api/download             sert le fichier contre un jeton valide
lib/
  config.ts                config (env)
  orders.ts                stockage commandes (à remplacer par une vraie DB)
  price.ts                 cours SOL/EUR (CoinGecko)
  solana.ts                Solana Pay : URL + vérification
  download-token.ts        jetons de téléchargement signés (HMAC)
protected/                 le fichier du jeu vit ici (jamais dans /public)
```
