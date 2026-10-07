"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthListener() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        try {
          // Check role from profiles
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("auth_user_id", session.user.id)
            .single();

          if (profile?.role === "ADMIN") {
            router.push("/admin/dashboard");
          } else {
            router.push("/student/dashboard");
          }
        } catch {
          router.push("/student/dashboard");
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return null;
}
