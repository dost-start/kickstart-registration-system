"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

/**
 * Get event registration status (open/closed)
 * This function checks if the event registration is closed
 */
export async function getEventRegistrationStatus(): Promise<boolean> {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase configuration");
  }

  const supabase = createServerClient<Database>(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });

  const { data, error } = await supabase
    .from("options")
    .select("value")
    .eq("id", "is_event_closed")
    .single();

  if (error) {
    console.error("Error fetching event status:", error);
    // If there's an error or no record found, default to open (false)
    return false;
  }

  // Return true if the event is closed, false if it's open
  return data?.value ?? false;
}
