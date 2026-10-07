import { createAdminClient } from "@/lib/supabase/admin";
import { UserSession } from "@/types/database";

export async function getUserSessions(userId: string): Promise<UserSession[]> {
  const adminClient = createAdminClient();
  const { data, error } = await adminClient
    .from("user_sessions")
    .select("*")
    .eq("user_id", userId)
    .is("revoked_at", null)
    .order("last_active", { ascending: false });

  if (error || !data) {
    return [];
  }

  return data as UserSession[];
}

export async function revokeSession(sessionId: string, userId: string): Promise<boolean> {
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("user_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .match({ id: sessionId, user_id: userId });

  if (!error) {
    // Record security event
    await adminClient.from("audit_logs").insert({
      actor_user_id: userId,
      actor_role: "STUDENT",
      action: "SESSION_REVOKED",
      entity_type: "USER_SESSION",
      entity_id: sessionId,
      metadata: { revoked_at: new Date().toISOString() },
    });
  }

  return !error;
}

export async function revokeAllOtherSessions(currentSessionId: string, userId: string): Promise<boolean> {
  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("user_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("user_id", userId)
    .neq("id", currentSessionId)
    .is("revoked_at", null);

  if (!error) {
    await adminClient.from("audit_logs").insert({
      actor_user_id: userId,
      actor_role: "STUDENT",
      action: "ALL_OTHER_SESSIONS_REVOKED",
      entity_type: "USER_SESSION",
      entity_id: userId,
      metadata: { revoked_at: new Date().toISOString() },
    });
  }

  return !error;
}
