// Helpers Solana Pay : construction de la demande de paiement et vérification on-chain.
import {
  encodeURL,
  findReference,
  validateTransfer,
  FindReferenceError,
} from '@solana/pay';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { config } from './config';

export function getConnection(): Connection {
  return new Connection(config.rpcUrl, 'confirmed');
}

// Chaque commande a une "référence" : une clé publique unique (sans clé privée
// utile) qu'on attache à la transaction. Elle sert à retrouver LE paiement de
// CE client précis, et à rien d'autre.
export function createReference(): PublicKey {
  return Keypair.generate().publicKey;
}

export function getMerchantWallet(): PublicKey {
  return new PublicKey(config.merchantWallet);
}

// Construit l'URL "solana:..." conforme Solana Pay que le wallet du client ouvre.
export function buildPaymentUrl(params: {
  reference: PublicKey;
  amountSol: BigNumber;
  label: string;
  message: string;
}): string {
  const url = encodeURL({
    recipient: getMerchantWallet(),
    amount: params.amountSol,
    reference: params.reference,
    label: params.label,
    message: params.message,
  });
  return url.toString();
}

export type PaymentStatus = 'not_found' | 'confirmed' | 'invalid';

// Vérifie on-chain qu'un paiement correspondant à la référence ET au montant
// exact a bien été reçu par l'adresse marchand.
export async function checkPayment(
  reference: PublicKey,
  amountSol: BigNumber,
): Promise<PaymentStatus> {
  const connection = getConnection();

  let signatureInfo;
  try {
    signatureInfo = await findReference(connection, reference, { finality: 'confirmed' });
  } catch (err) {
    if (err instanceof FindReferenceError) return 'not_found';
    throw err;
  }

  try {
    await validateTransfer(
      connection,
      signatureInfo.signature,
      {
        recipient: getMerchantWallet(),
        amount: amountSol,
        reference,
      },
      { commitment: 'confirmed' },
    );
    return 'confirmed';
  } catch {
    // Une transaction référence bien la commande mais le montant/destinataire
    // ne correspond pas : on ne débloque pas.
    return 'invalid';
  }
}
