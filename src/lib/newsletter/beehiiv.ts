/**
 * Beehiiv subscription helper for the AI for FIs newsletter unlock path.
 *
 * Required env:
 *   BEEHIIV_API_KEY            org API key
 *   BEEHIIV_PUBLICATION_ID     pub id for "AI for FIs"
 *
 * Per Brent's memory: Free Launch tier supports GET endpoints only. The
 * subscribers POST endpoint is available on Scale tier and above. Verify
 * the current plan exposes POST /publications/{pubId}/subscriptions before
 * relying on this in production. If not available, fall back to the
 * shared-domain hosted form.
 */

const BEEHIIV_API_BASE = "https://api.beehiiv.com/v2";

export interface SubscribeResult {
  ok: boolean;
  error?: string;
}

export async function subscribeToAiForFis(email: string): Promise<SubscribeResult> {
  const apiKey = process.env.BEEHIIV_API_KEY;
  const pubId = process.env.BEEHIIV_PUBLICATION_ID;
  if (!apiKey || !pubId) {
    return { ok: false, error: "Newsletter integration not configured." };
  }

  const normalized = email.trim().toLowerCase();
  if (!normalized.includes("@")) {
    return { ok: false, error: "Invalid email." };
  }

  try {
    const res = await fetch(`${BEEHIIV_API_BASE}/publications/${pubId}/subscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email: normalized,
        send_welcome_email: true,
        utm_source: "robotropes",
        utm_medium: "unlock-modal",
        reactivate_existing: true,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Beehiiv ${res.status}: ${text.slice(0, 200)}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
