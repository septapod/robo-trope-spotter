import { Resend } from "resend";
import { eq, and, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { magicLinks, users, sessions } from "@/db/schema";
import { generateToken, hashToken } from "./tokens";

const MAGIC_LINK_TTL_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is not set. Add it to Vercel project env (and .env.local for dev)."
    );
  }
  return new Resend(apiKey);
}

function getSenderAddress(): string {
  return process.env.RESEND_FROM ?? "Robotropes <hello@robotropes.dxn.is>";
}

function getAppUrl(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "https://robotropes.dxn.is";
}

/**
 * Issue a magic link to the given email. Stores the token hash, then emails
 * the raw token via Resend. Old unconsumed links for the same email are NOT
 * invalidated automatically — they expire on their own. This makes the
 * common "user clicks send twice" case work without a hidden race.
 */
export async function issueMagicLink(email: string): Promise<void> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !normalized.includes("@")) {
    throw new Error("Invalid email address.");
  }

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + MAGIC_LINK_TTL_MS);

  await db().insert(magicLinks).values({
    email: normalized,
    tokenHash,
    expiresAt,
  });

  const link = `${getAppUrl()}/api/auth/verify?token=${encodeURIComponent(token)}`;
  const resend = getResendClient();
  await resend.emails.send({
    from: getSenderAddress(),
    to: normalized,
    subject: "Your sign-in link for Robotropes",
    html: renderMagicLinkEmail(link),
    text: renderMagicLinkText(link),
  });
}

/**
 * Verify a magic link token and create a session. Returns the session secret
 * the caller should set as a cookie, plus the user record.
 *
 * Marks the magic link consumed so it can't be replayed. Creates the user
 * record on first verify.
 */
export async function consumeMagicLink(
  token: string
): Promise<{ sessionToken: string; userId: string; email: string }> {
  if (!token) throw new Error("Missing token.");
  const tokenHash = hashToken(token);

  const [link] = await db()
    .select()
    .from(magicLinks)
    .where(
      and(
        eq(magicLinks.tokenHash, tokenHash),
        gt(magicLinks.expiresAt, new Date()),
        isNull(magicLinks.consumedAt)
      )
    )
    .limit(1);

  if (!link) {
    throw new Error("This sign-in link is expired or already used.");
  }

  // Mark consumed before user/session work so a retry can't double-create.
  await db()
    .update(magicLinks)
    .set({ consumedAt: new Date() })
    .where(eq(magicLinks.id, link.id));

  // Find or create the user.
  let user = (await db().select().from(users).where(eq(users.email, link.email)).limit(1))[0];
  if (!user) {
    const localPart = link.email.split("@")[0] ?? "Spotter";
    const inserted = await db()
      .insert(users)
      .values({ email: link.email, displayName: localPart })
      .returning();
    user = inserted[0];
  }

  // Issue a session token.
  const sessionToken = generateToken();
  const sessionHash = hashToken(sessionToken);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db().insert(sessions).values({
    userId: user.id,
    tokenHash: sessionHash,
    expiresAt,
  });

  return {
    sessionToken,
    userId: user.id,
    email: user.email,
  };
}

function renderMagicLinkEmail(link: string): string {
  return `
<!doctype html>
<html>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #18181b;">
    <h1 style="font-size: 22px; margin: 0 0 16px;">Sign in to Robotropes</h1>
    <p style="font-size: 16px; line-height: 1.5; color: #3f3f46;">
      Click the button below to finish signing in. The link works once and expires in 15 minutes.
    </p>
    <p style="margin: 24px 0;">
      <a href="${link}" style="display: inline-block; background: #ec4899; color: #fff; text-decoration: none; padding: 12px 24px; border-radius: 9999px; font-weight: 700;">Sign in</a>
    </p>
    <p style="font-size: 13px; color: #71717a; line-height: 1.5;">
      Didn't ask for this? You can ignore this email. The link expires on its own.
    </p>
    <p style="font-size: 13px; color: #a1a1aa; margin-top: 32px; word-break: break-all;">
      ${link}
    </p>
  </body>
</html>
  `.trim();
}

function renderMagicLinkText(link: string): string {
  return `Sign in to Robotropes\n\nClick the link below to finish signing in. The link works once and expires in 15 minutes.\n\n${link}\n\nDidn't ask for this? You can ignore this email.`;
}
