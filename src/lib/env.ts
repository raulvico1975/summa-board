import { getProductBaseUrl } from "@/src/lib/product/config";

export type StripeEnv = {
  secretKey: string;
  webhookSecret: string;
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  billingReturnUrl: string;
};

export function getStripeEnv(): StripeEnv {
  const baseUrl = getProductBaseUrl();
  const env = {
    secretKey: process.env.STRIPE_SECRET_KEY ?? "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
    priceId: process.env.STRIPE_PRICE_ID ?? "",
    successUrl: process.env.STRIPE_SUCCESS_URL ?? `${baseUrl}/dashboard`,
    cancelUrl: process.env.STRIPE_CANCEL_URL ?? `${baseUrl}/signup`,
    billingReturnUrl: process.env.STRIPE_BILLING_RETURN_URL ?? `${baseUrl}/billing`,
  };

  if (
    process.env.NODE_ENV === "production" &&
    (!env.secretKey || !env.webhookSecret || !env.priceId)
  ) {
    throw new Error("Stripe not configured");
  }

  return env;
}
