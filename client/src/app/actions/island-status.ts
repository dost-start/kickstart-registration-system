"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

const ISLAND_LIMIT = 150;
type Island = "Luzon" | "Visayas" | "Mindanao";

function getIslandClosedOptionId(island: Island) {
  if (island === "Luzon") return "island_luzon_closed" as const;
  if (island === "Visayas") return "island_visayas_closed" as const;
  return "island_mindanao_closed" as const;
}

export type IslandStatus = {
  island: Island;
  isClosed: boolean;
  currentCount: number;
  isFull: boolean;
};

/**
 * Get registration status for all islands
 */
export async function getIslandRegistrationStatus(): Promise<Record<Island, IslandStatus>> {
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
          // Ignore cookie setting errors
        }
      },
    },
  });

  const islands: Island[] = ["Luzon", "Visayas", "Mindanao"];
  const statusMap: Record<Island, IslandStatus> = {} as Record<Island, IslandStatus>;

  for (const island of islands) {
    const optionId = getIslandClosedOptionId(island);

    // Check if island is explicitly closed
    const { data: islandStatusRow } = await supabase
      .from("options")
      .select("value")
      .eq("id", optionId)
      .maybeSingle();

    const isClosed = islandStatusRow?.value ?? false;

    // Get current count for the island
    const { count } = await supabase
      .from("kickstart_form_entries")
      .select("id", { count: "exact", head: true })
      .eq("island", island)
      .in("status", ["pending", "accepted"]);

    const currentCount = count ?? 0;
    const isFull = currentCount >= ISLAND_LIMIT;

    statusMap[island] = {
      island,
      isClosed,
      currentCount,
      isFull,
    };
  }

  return statusMap;
}

