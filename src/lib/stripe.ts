import "server-only";
import Stripe from "stripe";

let instance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!instance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error(
        "STRIPE_SECRET_KEY manquant. Ajoute ta clé secrète de test Stripe dans .env pour activer les paiements.",
      );
    }
    instance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return instance;
}
