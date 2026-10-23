import { MemberRole } from "@/types/multitenant";

export interface ClientSession {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  organizationId?: string;
}

/**
 * Safely decodes session from browser document.cookie.
 * Tamper Protection:
 * If a token is unsigned (raw JSON created in DevTools), any privileged role
 * (SUPER_ADMIN, ORG_ADMIN, ADMIN, etc.) is strictly stripped and downgraded to STUDENT.
 */
export function parseClientSessionCookie(): ClientSession | null {
  if (typeof window === "undefined") return null;

  try {
    const match = document.cookie.match(/(?:^|;\s*)interndesk_user=([^;]+)/);
    if (!match) return null;

    const rawVal = decodeURIComponent(match[1]).trim();
    if (!rawVal) return null;

    let payload: { id?: string; name?: string; email?: string; role?: string; organizationId?: string } | null = null;
    let isSigned = false;

    // Check if token format is <base64url>.<signature>
    if (rawVal.includes(".")) {
      const parts = rawVal.split(".");
      if (parts.length === 2 && parts[0] && parts[1]) {
        try {
          let b64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
          while (b64.length % 4) {
            b64 += "=";
          }
          const jsonStr = atob(b64);
          payload = JSON.parse(jsonStr);
          isSigned = true;
        } catch {
          // Ignored
        }
      }
    }

    // Fallback: If raw JSON without signature
    if (!payload) {
      try {
        payload = JSON.parse(rawVal);
        isSigned = false;
      } catch {
        return null;
      }
    }

    if (payload && payload.email) {
      const email = String(payload.email).toLowerCase().trim();
      const rawRole = String(payload.role || "STUDENT").toUpperCase();

      // SECURITY: If cookie was NOT cryptographically signed by the server,
      // downgrade any privileged role attempt to STUDENT!
      const isPrivileged = [
        "SUPER_ADMIN",
        "ORG_ADMIN",
        "ORG_OWNER",
        "ADMIN",
        "MANAGER_SUPERVISOR",
        "HR_COORDINATOR",
        "TRAINER_MENTOR",
      ].includes(rawRole);

      const effectiveRole: MemberRole = (!isSigned && isPrivileged)
        ? "STUDENT"
        : (rawRole as MemberRole);

      const rawName = payload.name || email.split("@")[0].replace(/[^a-zA-Z0-9]/g, " ");
      const name = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      return {
        id: payload.id || `usr-${email.replace(/[^a-z0-9]/g, "")}`,
        name,
        email,
        role: effectiveRole,
        organizationId: payload.organizationId,
      };
    }
  } catch {
    // Malformed
  }

  return null;
}
