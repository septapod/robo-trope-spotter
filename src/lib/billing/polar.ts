/**
 * Polar.sh client for the buy-me-a-coffee tip jar.
 *
 * Polar handles tax compliance as Merchant of Record, so DSL LLC has zero
 * sales-tax / VAT burden. Customers check out via embedded or hosted Polar
 * checkout; the webhook fires on success and we grant a tip_today unlock.
 *
 * Required env:
 *   POLAR_ACCESS_TOKEN     organization API token
 *   POLAR_WEBHOOK_SECRET   shared secret for signature verification
 *   POLAR_PRODUCT_ID       the "Buy me a coffee" product id (pay-what-you-want)
 */

import { Polar } from "@polar-sh/sdk";

let cached: Polar | null = null;

export function getPolarClient(): Polar {
  if (cached) return cached;
  const accessToken = process.env.POLAR_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("POLAR_ACCESS_TOKEN is not set.");
  }
  cached = new Polar({
    accessToken,
    server: process.env.POLAR_ENV === "sandbox" ? "sandbox" : "production",
  });
  return cached;
}

export function getCoffeeProductId(): string {
  const id = process.env.POLAR_PRODUCT_ID;
  if (!id) {
    throw new Error("POLAR_PRODUCT_ID is not set.");
  }
  return id;
}

export function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://robotropes.dxn.is";
}
