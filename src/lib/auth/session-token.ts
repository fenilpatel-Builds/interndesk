import crypto from "crypto";
import { MemberRole } from "@/types/multitenant";

export interface SessionPayload {
  id: string;
  name?: string;
  email: string;
  role: MemberRole;
  organizationId?: string;
  iat?: number;
  exp?: number;
}

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.SUPABASE_JWT_SECRET ||
  "interndesk_production_secure_hmac_secret_2026_x89f_#_tamper_proof";

/**
 * Creates an HMAC-SHA256 signature for a given payload string.
 */
function createSignature(payloadBase64: string): string {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadBase64)
    .digest("hex");
}

/**
 * Base64url encode helper
 */
function toBase64Url(str: string): string {
  return Buffer.from(str, "utf8")
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Base64url decode helper
 */
function fromBase64Url(b64url: string): string {
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) {
    b64 += "=";
  }
  return Buffer.from(b64, "base64").toString("utf8");
}

/**
 * Cryptographically signs a session payload into a tamper-proof session token.
 * Token format: <base64url(payload)>.<signature>
 */
export function signSessionToken(payload: Omit<SessionPayload, "iat" | "exp">, expiresInDays: number = 7): string {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInDays * 24 * 60 * 60,
  };

  const payloadJson = JSON.stringify(fullPayload);
  const payloadBase64 = toBase64Url(payloadJson);
  const signature = createSignature(payloadBase64);

  return `${payloadBase64}.${signature}`;
}

/**
 * Cryptographically verifies a session token.
 * Returns the decoded payload if valid, or null if tampered or expired.
 */
export function verifySessionToken(tokenString: string): SessionPayload | null {
  if (!tokenString || typeof tokenString !== "string") {
    return null;
  }

  const parts = tokenString.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [payloadBase64, signature] = parts;
  if (!payloadBase64 || !signature) {
    return null;
  }

  try {
    const expectedSignature = createSignature(payloadBase64);

    // Constant-time signature comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature, "hex");
    const expBuffer = Buffer.from(expectedSignature, "hex");

    if (sigBuffer.length !== expBuffer.length) {
      return null;
    }

    if (!crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      return null;
    }

    const payloadJson = fromBase64Url(payloadBase64);
    const payload = JSON.parse(payloadJson) as SessionPayload;

    // Check expiration
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return null;
    }

    // Verify required fields
    if (!payload.email || !payload.role) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Safely parses cookie value.
 * If signed: verifies HMAC signature.
 * If unsigned legacy JSON: strictly downgrades role to STUDENT (NEVER grants admin roles without HMAC signature).
 */
export function safeParseSession(cookieValue: string | undefined | null): SessionPayload | null {
  if (!cookieValue) return null;

  // Try verifying as signed token first
  const verified = verifySessionToken(cookieValue);
  if (verified) {
    return verified;
  }

  // Fallback: If it's URL-encoded or raw JSON (legacy or client-side fallback)
  try {
    const decoded = decodeURIComponent(cookieValue);
    const parsed = JSON.parse(decoded);

    if (parsed && typeof parsed === "object" && parsed.email) {
      const email = String(parsed.email).toLowerCase().trim();
      const rawRole = String(parsed.role || "STUDENT").toUpperCase();

      // SECURITY RULE: Never allow unsigned cookies to assume administrative roles!
      // Any attempt to set SUPER_ADMIN, ORG_ADMIN, ORG_OWNER, ADMIN, etc. without signature is strictly blocked.
      const isPrivilegedRole = [
        "SUPER_ADMIN",
        "ORG_ADMIN",
        "ORG_OWNER",
        "ADMIN",
        "MANAGER_SUPERVISOR",
        "HR_COORDINATOR",
        "TRAINER_MENTOR",
      ].includes(rawRole);

      const safeRole: MemberRole = isPrivilegedRole ? "STUDENT" : (rawRole as MemberRole);

      return {
        id: parsed.id || `usr-${email.replace(/[^a-z0-9]/g, "")}`,
        name: parsed.name || email.split("@")[0],
        email,
        role: safeRole,
        organizationId: parsed.organizationId,
      };
    }
  } catch {
    // Malformed
  }

  return null;
}
