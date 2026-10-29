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
    const parseCookieValue = (cookieName: string) => {
      const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${cookieName}=([^;]+)`));
      if (!match) return null;
      const rawVal = decodeURIComponent(match[1]).trim();
      if (!rawVal) return null;

      let payload: { id?: string; name?: string; email?: string; role?: string; organizationId?: string } | null = null;
      let isSigned = false;

      if (rawVal.includes(".")) {
        const parts = rawVal.split(".");
        if (parts.length === 2 && parts[0] && parts[1]) {
          try {
            let b64 = parts[0].replace(/-/g, "+").replace(/_/g, "/");
            while (b64.length % 4) b64 += "=";
            payload = JSON.parse(atob(b64));
            isSigned = true;
          } catch {
            // Ignored
          }
        }
      }

      if (!payload) {
        try {
          payload = JSON.parse(rawVal);
          isSigned = false;
        } catch {
          return null;
        }
      }

      return payload ? { payload, isSigned } : null;
    };

    // Check interndesk_user first, then akash_user
    const candidate1 = parseCookieValue("interndesk_user");
    const candidate2 = parseCookieValue("akash_user");

    // Select candidate that has a distinct human name (not just an email prefix)
    let selected = candidate1 || candidate2;
    if (candidate1?.payload && candidate2?.payload) {
      const name1 = candidate1.payload.name || "";
      const email1 = candidate1.payload.email || "";
      const isEmailPrefix1 = name1.toLowerCase() === email1.split("@")[0].toLowerCase();
      if (isEmailPrefix1 && candidate2.payload.name && candidate2.payload.name.toLowerCase() !== email1.split("@")[0].toLowerCase()) {
        selected = candidate2;
      }
    }

    if (!selected || !selected.payload) return null;
    const { payload, isSigned } = selected;

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
