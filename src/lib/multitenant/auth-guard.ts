import { cookies } from "next/headers";
import { createServerSupabaseClient } from "../supabase/server";
import { MemberRole, Organization, OrganizationMembership } from "../../types/multitenant";
import { hasPermission, Permission } from "./permissions";
import { multiTenantStore } from "./store";
import { safeParseSession } from "../auth/session-token";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: MemberRole;
  isSuperAdmin: boolean;
}

export interface TenantContext {
  user: AuthenticatedUser;
  organization: Organization;
  membership?: OrganizationMembership;
  role: MemberRole;
}

export class AuthorizationError extends Error {
  public statusCode: number;
  constructor(message: string, statusCode: number = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.statusCode = statusCode;
  }
}

/**
 * Derives authenticated user identity from real Supabase session or validated server session cookie.
 * NEVER trusts client-supplied user ID or email from request body or query params.
 */
export async function resolveAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  // 1. Check genuine Supabase Auth session via SSR
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user && user.email) {
      const isSuperAdmin = user.email.toLowerCase() === "superadmin@interndesk.com";
      const role: MemberRole = isSuperAdmin ? "SUPER_ADMIN" : "INTERN";

      return {
        userId: user.id,
        email: user.email.toLowerCase(),
        role,
        isSuperAdmin,
      };
    }
  } catch {
    // Non-blocking fallback to application session cookie
  }

  // 2. Fallback: Parse cryptographically validated session cookie
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("interndesk_user")?.value;

    if (sessionCookie) {
      const parsed = safeParseSession(sessionCookie);
      if (parsed && parsed.email) {
        const email = parsed.email.toLowerCase();
        const isSuperAdmin = email === "superadmin@interndesk.com" || parsed.role === "SUPER_ADMIN";
        const role: MemberRole = isSuperAdmin ? "SUPER_ADMIN" : parsed.role;

        return {
          userId: parsed.id || `usr-${email.replace(/[^a-z0-9]/g, "")}`,
          email,
          role,
          isSuperAdmin,
        };
      }
    }
  } catch {
    // Malformed cookie
  }

  return null;
}

/**
 * Resolves and validates tenant context for the requested organization.
 * Strictly verifies that the authenticated user has an active membership in the target organization.
 * Platform Super Admins are granted authorized cross-tenant oversight.
 */
export async function resolveAuthenticatedTenantContext(
  requestedOrgId?: string
): Promise<TenantContext> {
  const user = await resolveAuthenticatedUser();
  if (!user) {
    throw new AuthorizationError("Authentication required. Please sign in.", 401);
  }

  // If no org specified, read active org cookie or default
  let orgId = requestedOrgId;
  if (!orgId) {
    try {
      const cookieStore = await cookies();
      orgId = cookieStore.get("interndesk_active_org")?.value || "org-akash-01";
    } catch {
      orgId = "org-akash-01";
    }
  }

  const organization = multiTenantStore.getOrganizationById(orgId);
  if (!organization) {
    throw new AuthorizationError(`Organization "${orgId}" not found.`, 404);
  }

  if (organization.status === "SUSPENDED" && !user.isSuperAdmin) {
    throw new AuthorizationError(`Organization "${organization.name}" is currently suspended.`, 403);
  }

  // Super Admin bypass: Global administrative purview
  if (user.isSuperAdmin) {
    return {
      user,
      organization,
      role: "SUPER_ADMIN",
    };
  }

  // Find membership in targeted organization
  const memberships = multiTenantStore.getMemberships(orgId);
  const membership = memberships.find(
    (m) =>
      m.user_email?.toLowerCase() === user.email.toLowerCase() ||
      m.user_id === user.userId
  );

  if (!membership) {
    throw new AuthorizationError(
      `Access denied: You are not an active member of organization "${organization.name}".`,
      403
    );
  }

  if (membership.status === "SUSPENDED" || membership.status === "REJECTED") {
    throw new AuthorizationError(
      `Access denied: Your membership status in "${organization.name}" is ${membership.status}.`,
      403
    );
  }

  return {
    user,
    organization,
    membership,
    role: membership.role,
  };
}

/**
 * Checks whether an actor has the required permission for their role.
 * Throws AuthorizationError if unauthorized.
 */
export function requirePermission(role: MemberRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new AuthorizationError(
      `Unauthorized: Role "${role}" lacks required permission "${permission}".`,
      403
    );
  }
}

/**
 * Validates that resource belongs strictly to the actor's tenant context.
 */
export function assertTenantBoundary(actorOrgId: string, resourceOrgId: string): void {
  if (actorOrgId !== resourceOrgId) {
    throw new AuthorizationError(
      `Cross-tenant violation: Cannot access resource from organization "${resourceOrgId}" from active tenant "${actorOrgId}".`,
      403
    );
  }
}
