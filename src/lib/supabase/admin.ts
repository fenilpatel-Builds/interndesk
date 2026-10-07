import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy-service-role-key";

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("WARNING: SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables. Admin client will run with mock credentials.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
