import Stripe from "stripe";

export function getStripe(secretKey?: string | null) {
  const key = secretKey || process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
}

/** Demo checkout without Stripe keys — marks order paid immediately */
export const DEMO_CHECKOUT = !process.env.STRIPE_SECRET_KEY;
