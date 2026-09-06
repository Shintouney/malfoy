'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

type OrderResp = {
  orderId: string;
  recipient: string;
  amountSol: string;
  amountEur: number;
  eurPerSol: number;
  network: string;
  solanaUrl: string;
  qrDataUrl: string;
};

type Step = 'code' | 'creating' | 'awaiting' | 'paid';

export default function BuyPage() {
  const [step, setStep] = useState<Step>('code');
  const [code, setCode] = useState('');
  const [order, setOrder] = useState<OrderResp | null>(null);
  const [downloadToken, setDownloadToken] = useState('');
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  async function createOrder(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setStep('creating');
    try {
      const res = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessCode: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Une erreur est survenue.');
        setStep('code');
        return;
      }
      setOrder(data as OrderResp);
      setStep('awaiting');
    } catch {
      setError('Erreur réseau. Réessaie.');
      setStep('code');
    }
  }

  const verifyNow = useCallback(async () => {
    if (!order) return;
    setChecking(true);
    try {
      const res = await fetch(`/api/verify?orderId=${encodeURIComponent(order.orderId)}`);
      const data = await res.json();
      if (data.paid) {
        setDownloadToken(data.downloadToken);
        setStep('paid');
      }
    } catch {
      /* on réessaiera au prochain tick */
    } finally {
      setChecking(false);
    }
  }, [order]);

  // Vérification automatique du paiement toutes les 4 s.
  useEffect(() => {
    if (step !== 'awaiting') return;
    pollRef.current = setInterval(verifyNow, 4000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [step, verifyNow]);

  return (
    <div className="buy-wrap">
      <div style={{ marginBottom: 22 }}>
        <Link href="/" className="muted small">
          ← TEAM VERITAS
        </Link>
      </div>

      {/* ÉTAPE 1 — CODE D'ACCÈS */}
      {(step === 'code' || step === 'creating') && (
        <div className="panel">
          <p className="kicker">Accès</p>
          <h2 style={{ marginTop: 6 }}>Entre ton code d'accès</h2>
          <p className="muted small">
            Le code débloque la page de paiement. Il t'a été communiqué avec l'offre.
          </p>
          <form onSubmit={createOrder} className="mt-24">
            <label className="label" htmlFor="code">
              Code d'accès
            </label>
            <input
              id="code"
              className="input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="XXXXXXXX"
              autoComplete="off"
              autoFocus
              disabled={step === 'creating'}
            />
            {error && <div className="alert alert-error">{error}</div>}
            <button
              type="submit"
              className="btn btn-primary mt-16"
              style={{ width: '100%' }}
              disabled={step === 'creating' || code.trim().length === 0}
            >
              {step === 'creating' ? 'Préparation du paiement…' : 'Continuer vers le paiement'}
            </button>
          </form>
        </div>
      )}

      {/* ÉTAPE 2 — PAIEMENT */}
      {step === 'awaiting' && order && (
        <div className="panel">
          <p className="kicker">Paiement · {order.network}</p>
          <h2 style={{ marginTop: 6 }}>Paie en Solana</h2>

          <div className="pay-amount">
            <span className="sol">{formatSol(order.amountSol)} SOL</span>
            <span className="eur">≈ {order.amountEur} €</span>
          </div>
          <div className="rate">
            Cours : 1 SOL ≈ {order.eurPerSol.toFixed(2)} € · montant verrouillé pour cette commande
          </div>

          <div className="qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={order.qrDataUrl} alt="QR code de paiement Solana Pay" />
          </div>

          <p className="muted small center">
            Scanne ce QR code avec <strong>Phantom</strong>, <strong>Solflare</strong> ou tout
            wallet compatible Solana Pay. Le montant et le destinataire sont pré-remplis.
          </p>

          <p className="label mt-24">Ou envoie manuellement à l'adresse&nbsp;:</p>
          <div className="addr">{order.recipient}</div>

          <a href={order.solanaUrl} className="btn btn-solana mt-16" style={{ width: '100%' }}>
            Ouvrir dans mon wallet
          </a>

          <div className="status">
            <span className="spinner" />
            <span>En attente de la confirmation sur la blockchain…</span>
          </div>

          <button
            onClick={verifyNow}
            className="btn mt-16"
            style={{ width: '100%' }}
            disabled={checking}
          >
            {checking ? 'Vérification…' : "J'ai payé — vérifier maintenant"}
          </button>

          <div className="alert alert-net mt-16 small">
            ⚠️ Un paiement en crypto est <strong>irréversible</strong>. Vérifie le montant et
            l'adresse avant de confirmer dans ton wallet.
          </div>
        </div>
      )}

      {/* ÉTAPE 3 — LIVRAISON */}
      {step === 'paid' && (
        <div className="panel center">
          <div style={{ fontSize: 46, lineHeight: 1 }}>✅</div>
          <h2 style={{ marginTop: 12 }}>Paiement confirmé — merci !</h2>
          <p className="muted">
            Ton achat est validé sur la blockchain. Télécharge ton jeu ci-dessous.
          </p>
          <a
            href={`/api/download?token=${encodeURIComponent(downloadToken)}`}
            className="btn btn-primary mt-24"
            style={{ width: '100%' }}
          >
            ⬇️ Télécharger le jeu
          </a>
          <p className="muted small mt-16">
            Le lien est personnel et temporaire. Garde une copie du fichier une fois téléchargé.
          </p>
        </div>
      )}
    </div>
  );
}

function formatSol(s: string): string {
  const n = Number(s);
  if (!Number.isFinite(n)) return s;
  // Affiche jusqu'à 6 décimales significatives, sans zéros inutiles.
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 6 });
}
