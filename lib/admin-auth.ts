/**
 * Shared helpers for the demo-grade admin gate.
 *
 * Imported by both `proxy.ts` (cookie check) and `lib/admin-actions.ts`
 * (login/logout server actions) so the password source and cookie format
 * live in one place.
 *
 * The password comes from the `ADMIN_PASSWORD` env var. When it is unset,
 * nobody can sign in. The cookie holds a SHA-256 digest of the password
 * rather than the password itself, so changing the password signs everyone
 * out. This is still a shared-password gate, not real auth: there are no
 * per-user sessions and a copied cookie works until the password changes.
 */
export const ADMIN_COOKIE_NAME = "admin_auth";

export function getAdminPassword(): string | undefined {
  return process.env.ADMIN_PASSWORD || undefined;
}

/** The cookie value issued for a given password. Web Crypto, so it runs in any runtime. */
export async function adminSessionToken(password: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`admin-session:${password}`),
  );
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** True when `token` is the session token for the configured password. */
export async function isAdminSession(token: string | undefined): Promise<boolean> {
  const password = getAdminPassword();
  if (!password || !token) return false;
  return token === (await adminSessionToken(password));
}
