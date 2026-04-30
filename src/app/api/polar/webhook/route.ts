import { Webhooks } from "@polar-sh/nextjs";
import { grantUnlock } from "@/lib/billing/unlocks";

/**
 * POST /api/polar/webhook
 *
 * Receives Polar checkout events. On a successful order, grants the
 * tip_today unlock to the customer. The customer's userId is read from
 * checkout metadata, set when the checkout was created in /api/checkout.
 *
 * Webhook signature verification handled by @polar-sh/nextjs.
 */
export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET ?? "",
  onOrderCreated: async (payload) => {
    try {
      const order = payload.data;
      const metadata = (order.metadata ?? {}) as Record<string, unknown>;
      const userId = typeof metadata.userId === "string" && metadata.userId !== "anonymous"
        ? metadata.userId
        : null;
      const customerEmail = typeof order.customer?.email === "string"
        ? order.customer.email
        : null;

      const scopeKey = userId ? null : customerEmail ?? `polar_${order.id}`;

      await grantUnlock({
        userId,
        scopeKey,
        unlockType: "tip_today",
        polarCheckoutId: order.checkoutId ?? order.id,
      });
      console.log(`[polar:webhook] tip_today unlock granted for ${userId ?? scopeKey}`);
    } catch (err) {
      console.error("[polar:webhook] grant failed:", err instanceof Error ? err.message : err);
    }
  },
});
