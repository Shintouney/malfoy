// Stockage des commandes.
//
// ⚠️ IMPORTANT : ceci est un stockage EN MÉMOIRE, pour le développement.
// Il est remis à zéro à chaque redémarrage du serveur et ne fonctionne pas
// sur un hébergement "serverless" multi-instances (Vercel, etc.).
// Pour la production, remplace ces fonctions par une vraie base de données
// (Postgres, SQLite, Redis, Upstash...). L'interface ci-dessous est volontairement
// minimale pour rendre ce remplacement simple.

export type OrderStatus = 'pending' | 'paid';

export type Order = {
  id: string;
  reference: string; // clé publique (base58) unique à cette commande
  amountSol: string; // montant exact attendu, en SOL (chaîne décimale)
  amountEur: number;
  status: OrderStatus;
  createdAt: number;
};

const orders = new Map<string, Order>();

export function saveOrder(order: Order): void {
  orders.set(order.id, order);
}

export function getOrder(id: string): Order | undefined {
  return orders.get(id);
}

export function markPaid(id: string): void {
  const order = orders.get(id);
  if (order) order.status = 'paid';
}
