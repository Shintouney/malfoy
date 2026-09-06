import Link from 'next/link';
import { config } from '@/lib/config';

export default function HomePage() {
  const game = config.gameName;

  return (
    <div className="container">
      {/* NAV */}
      <nav className="nav">
        <div className="brand">
          <span className="logo">TV</span>
          <span>
            TEAM&nbsp;VERITAS
            <br />
            <small>STUDIO</small>
          </span>
        </div>
        <Link href="/buy" className="btn btn-primary">
          Acheter — {config.priceEur} €
        </Link>
      </nav>

      {/* HERO */}
      <header className="hero">
        <span className="badge">
          <span className="dot" /> Disponible maintenant · Paiement Solana
        </span>
        <h1>
          {game} <br />
          <span className="grad">par TEAM VERITAS</span>
        </h1>
        <p className="lead">
          {/* 👉 Remplace ce texte par le pitch de ton jeu : le concept en 1-2 phrases,
              ce qui le rend unique, l'émotion que le joueur va ressentir. */}
          Décris ton jeu ici en une phrase qui donne envie d'y jouer tout de suite.
          Le genre, l'ambiance, ce qui le rend différent.
        </p>

        <div className="cta-row">
          <Link href="/buy" className="btn btn-primary">
            Acheter le jeu
          </Link>
          <span className="price-tag">
            <span className="eur">{config.priceEur} €</span>{' '}
            <span className="muted">· payé en SOL</span>
          </span>
        </div>
      </header>

      {/* CAPTURES */}
      <section className="section">
        <div className="grid grid-3">
          <div className="shot">Capture d'écran 1 — remplace par une vraie image</div>
          <div className="shot">Capture d'écran 2</div>
          <div className="shot">Capture d'écran 3</div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section">
        <p className="kicker">Ce que tu obtiens</p>
        <h2 className="section-title">Le jeu, en un achat</h2>
        <p className="section-sub">
          Remplace ces trois blocs par les vraies caractéristiques de ton jeu.
        </p>
        <div className="grid grid-3">
          <div className="card">
            <h3>🎮 Une fonctionnalité clé</h3>
            <p>Décris un point fort : gameplay, histoire, mode multi, durée de vie…</p>
          </div>
          <div className="card">
            <h3>⚡ Un autre atout</h3>
            <p>Ce qui rend l'expérience mémorable ou rejouable.</p>
          </div>
          <div className="card">
            <h3>🔒 Accès à vie</h3>
            <p>Téléchargement immédiat après paiement. Le fichier est à toi.</p>
          </div>
        </div>
      </section>

      {/* COMMENT ACHETER */}
      <section className="section">
        <p className="kicker">Comment ça marche</p>
        <h2 className="section-title">Acheter en 3 étapes</h2>
        <p className="section-sub">
          Paiement en Solana via Solana Pay — scanne, paie, télécharge.
        </p>
        <div className="steps">
          <div className="step">
            <h3>Entre ton code</h3>
            <p>Saisis le code d'accès pour ouvrir la page de paiement.</p>
          </div>
          <div className="step">
            <h3>Paie en SOL</h3>
            <p>Scanne le QR code avec Phantom ou Solflare. Le montant est calculé au cours du jour.</p>
          </div>
          <div className="step">
            <h3>Télécharge</h3>
            <p>Dès le paiement confirmé sur la blockchain, ton lien de téléchargement apparaît.</p>
          </div>
        </div>
        <div className="cta-row">
          <Link href="/buy" className="btn btn-solana">
            Aller au paiement
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="row">
          <div>
            © {'{ANNÉE}'} TEAM VERITAS — {/* 👉 mets ici : nom légal / auto-entreprise, contact */}
            <br />
            <span className="small">
              Vendeur : «à compléter» · Contact : «email» · Le jeu est livré en
              téléchargement numérique.
            </span>
          </div>
          <div className="small">
            <Link href="/buy">Acheter</Link> · Conditions «à rédiger» · Remboursement «à définir»
          </div>
        </div>
      </footer>
    </div>
  );
}
