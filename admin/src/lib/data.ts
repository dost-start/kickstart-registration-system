import { createClient } from "@/lib/supabase/client";
import type {
  FormEntry,
  FormEntryUpdate,
  RegistrantStats,
  StatusType,
} from "@/types/form-entries";

const PAGE_SIZE = 1000; // Supabase max limit per query

/**
 * Helper function to paginate through all results from Supabase
 */
async function paginateQuery<T>(
  queryBuilder: (from: number, to: number) => Promise<{
    data: T[] | null;
    error: any;
  }>
): Promise<T[]> {
  const allResults: T[] = [];
  let from = 0;
  let batch: T[];

  do {
    const { data, error } = await queryBuilder(from, from + PAGE_SIZE - 1);

    if (error) {
      throw error;
    }

    batch = data || [];
    if (batch.length > 0) {
      allResults.push(...batch);
      from += PAGE_SIZE;
    }
  } while (batch.length === PAGE_SIZE); // Continue if we got a full page

  return allResults;
}

/**
 * Fetch all registrants from the database
 * Uses efficient pagination to fetch all rows (Supabase has a default limit of 1000 per query)
 */
export async function fetchAllRegistrants(): Promise<FormEntry[]> {
  const supabase = createClient();

  return paginateQuery<FormEntry>(async (from, to) => {
    return await supabase
      .from("kickstart_form_entries")
      .select("*")
      .order("created_at", { ascending: false })
      .range(from, to);
  });
}

/**
 * Fetch registration statistics
 * Uses efficient count queries instead of fetching all rows
 */
export async function fetchRegistrantStats(): Promise<RegistrantStats> {
  const supabase = createClient();

  try {
    // Check authentication status
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("Auth status:", { 
      isAuthenticated: !!user, 
      userId: user?.id,
      authError: authError ? JSON.stringify(authError) : null 
    });

    // First, test if we can connect and if the table exists
    const testQuery = await supabase
      .from("kickstart_form_entries")
      .select("id", { count: "exact", head: true })
      .limit(1);

    console.log("Test query result:", {
      hasError: !!testQuery.error,
      error: testQuery.error ? JSON.stringify(testQuery.error) : null,
      errorKeys: testQuery.error ? Object.keys(testQuery.error) : [],
      count: testQuery.count,
      data: testQuery.data
    });

    // If test query fails, provide helpful error
    if (testQuery.error) {
      const testError = testQuery.error;
      const isEmptyError = testError && Object.keys(testError).length === 0;
      const errorCode = testError?.code;
      const errorMessage = testError?.message || "";

      // Empty error usually means RLS is blocking or table doesn't exist
      if (isEmptyError) {
        if (!user) {
          throw new Error(
            "Not authenticated. Please log in to access the registration data. If you're already logged in, check your RLS policies in Supabase."
          );
        } else {
          throw new Error(
            "Access denied. The table exists but Row Level Security (RLS) is blocking access. Please check your RLS policies for 'kickstart_form_entries' in Supabase. Make sure policies allow SELECT for authenticated users or anon role."
          );
        }
      } else if (errorCode === "42P01" || errorMessage.includes("does not exist") || errorMessage.includes("relation")) {
        throw new Error(
          "Table 'kickstart_form_entries' does not exist. Please run the SQL script in admin/sql/create_kickstart_form_entries.sql in your Supabase project."
        );
      } else if (errorCode === "42501" || errorMessage.toLowerCase().includes("permission denied") || errorMessage.toLowerCase().includes("row-level security")) {
        throw new Error(
          "Permission denied. Check your RLS policies for 'kickstart_form_entries' table. Make sure you're authenticated or adjust the policies in Supabase."
        );
      } else {
        throw new Error(
          `Failed to connect to table: ${errorMessage || "Unknown error"}${errorCode ? ` [Code: ${errorCode}]` : ""}`
        );
      }
    }

    // Use parallel count queries for maximum efficiency - use "id" instead of "*" for better RLS compatibility
    const [
      totalResult,
      acceptedResult,
      rejectedResult,
      pendingResult,
      waitlistedResult,
      checkedInResult,
    ] = await Promise.all([
      // Get total count
      supabase
        .from("kickstart_form_entries")
        .select("id", { count: "exact", head: true }),
      // Get counts by status using count queries
      supabase
        .from("kickstart_form_entries")
        .select("id", { count: "exact", head: true })
        .eq("status", "accepted"),
      supabase
        .from("kickstart_form_entries")
        .select("id", { count: "exact", head: true })
        .eq("status", "rejected"),
      supabase
        .from("kickstart_form_entries")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabase
        .from("kickstart_form_entries")
        .select("id", { count: "exact", head: true })
        .eq("status", "waitlisted"),
      // Get checked-in count
      supabase
        .from("kickstart_form_entries")
        .select("id", { count: "exact", head: true })
        .eq("is_checked_in", true),
    ]);

    // Check for errors
    const errors = [
      { name: "total", error: totalResult.error },
      { name: "accepted", error: acceptedResult.error },
      { name: "rejected", error: rejectedResult.error },
      { name: "pending", error: pendingResult.error },
      { name: "waitlisted", error: waitlistedResult.error },
      { name: "checkedIn", error: checkedInResult.error },
    ].filter((item) => item.error);

    if (errors.length > 0) {
      // Check if any errors are empty objects (RLS blocking)
      const hasEmptyError = errors.some(({ error }) => error && Object.keys(error).length === 0);
      
      if (hasEmptyError) {
        // Empty errors mean RLS is blocking - provide clear guidance
        const errorMsg = !user 
          ? "Not authenticated. Please log in to access the registration data."
          : "Row Level Security (RLS) is blocking access to 'kickstart_form_entries'. Please check your RLS policies in Supabase. The policies should allow SELECT for authenticated users or anon role.";
        
        console.error("RLS blocking detected:", {
          isAuthenticated: !!user,
          userId: user?.id,
          failedQueries: errors.map(e => e.name),
          allErrors: errors.map(e => ({
            name: e.name,
            error: e.error,
            isEmpty: e.error && Object.keys(e.error).length === 0
          }))
        });
        
        throw new Error(`Failed to fetch stats: ${errorMsg}`);
      }
      
      // Log all errors for debugging with full details
      errors.forEach(({ name, error }) => {
        // Try to extract error information from various possible structures
        const errorStr = JSON.stringify(error, null, 2);
        const errorKeys = error ? Object.keys(error) : [];
        const errorAny = error as any; // Use any to access potentially dynamic properties
        console.error(`Error in ${name} query:`, {
          errorObject: error,
          errorString: errorStr,
          errorKeys: errorKeys,
          errorType: typeof error,
          errorConstructor: error?.constructor?.name,
          code: error?.code,
          message: error?.message,
          details: error?.details,
          hint: error?.hint,
          status: errorAny?.status,
          statusText: errorAny?.statusText,
        });
      });
      
      const firstError = errors[0].error;
      const firstErrorAny = firstError as any; // Use any to access potentially dynamic properties
      
      // Try multiple ways to extract error information
      const errorCode = firstError?.code || firstErrorAny?.status || firstErrorAny?.error_code;
      const errorMessage = firstError?.message || firstErrorAny?.error || firstErrorAny?.statusText || "Unknown error";
      const errorDetails = firstError?.details || firstError?.hint || firstErrorAny?.error_description || "";
      
      // Provide helpful error messages for common issues
      let helpfulMessage = errorMessage;
      if (errorCode === "42P01" || (typeof errorMessage === "string" && (errorMessage.includes("does not exist") || (errorMessage.includes("relation") && errorMessage.includes("does not exist"))))) {
        helpfulMessage = "Table 'kickstart_form_entries' does not exist. Please run the SQL script in admin/sql/create_kickstart_form_entries.sql in your Supabase project.";
      } else if (errorCode === "42501" || (typeof errorMessage === "string" && (errorMessage.toLowerCase().includes("permission denied") || errorMessage.toLowerCase().includes("row-level security") || errorMessage.toLowerCase().includes("new row violates row-level security")))) {
        helpfulMessage = "Permission denied. Check your RLS policies for 'kickstart_form_entries' table. Make sure you're authenticated or adjust the policies in Supabase.";
      } else if (errorCode === "PGRST301" || (typeof errorMessage === "string" && errorMessage.includes("JWT"))) {
        helpfulMessage = "Authentication error. Please check your Supabase credentials and ensure you're logged in.";
      }
      
      const errorInfo = `Failed to fetch stats: ${helpfulMessage}${errorDetails ? ` (${errorDetails})` : ""}${errorCode ? ` [Code: ${errorCode}]` : ""}`;
      console.error("Full error details:", { 
        errorInfo, 
        allErrors: errors.map(e => ({ 
          name: e.name, 
          error: e.error,
          errorString: JSON.stringify(e.error),
          errorKeys: e.error ? Object.keys(e.error) : []
        })),
        firstError: firstError,
        firstErrorString: JSON.stringify(firstError, null, 2)
      });
      throw new Error(errorInfo);
    }

    // Return stats - empty table will return all zeros, which is correct
    return {
      total: totalResult.count ?? 0,
      accepted: acceptedResult.count ?? 0,
      rejected: rejectedResult.count ?? 0,
      pending: pendingResult.count ?? 0,
      waitlisted: waitlistedResult.count ?? 0,
      checkedIn: checkedInResult.count ?? 0,
    };
  } catch (error) {
    // If it's already our custom error, re-throw it
    if (error instanceof Error && error.message.includes("Failed to fetch stats")) {
      throw error;
    }
    // Otherwise, wrap it
    console.error("Unexpected error in fetchRegistrantStats:", error);
    throw new Error(`Failed to fetch stats: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Update registrant status
 */
export async function updateRegistrantStatus(
  id: number,
  status: StatusType
): Promise<void> {
  const supabase = createClient();

  // Get the registrant's island before updating
  const { data: registrant } = await supabase
    .from("kickstart_form_entries")
    .select("island")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("kickstart_form_entries")
    .update({ status })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update status: ${error.message}`);
  }

  // If status changed to accepted or pending, check if island should be closed
  if ((status === "accepted" || status === "pending") && registrant?.island) {
    try {
      await checkAndCloseIslandRegistrations();
    } catch (error) {
      console.error("Error checking island registration limits:", error);
      // Don't throw - status update succeeded, this is just a side effect
    }
  }
}

/**
 * Toggle registrant check-in status
 */
export async function toggleRegistrantCheckIn(
  id: number,
  isCheckedIn: boolean
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("kickstart_form_entries")
    .update({ is_checked_in: isCheckedIn })
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update check-in status: ${error.message}`);
  }
}

/**
 * Update registrant information
 */
export async function updateRegistrantInfo(
  id: number,
  updates: FormEntryUpdate
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("kickstart_form_entries")
    .update(updates)
    .eq("id", id);

  if (error) {
    throw new Error(`Failed to update registrant info: ${error.message}`);
  }
}

/**
 * Batch update check-in status for multiple registrants
 */
export async function batchUpdateCheckIn(
  ids: number[],
  isCheckedIn: boolean
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("kickstart_form_entries")
    .update({ is_checked_in: isCheckedIn })
    .in("id", ids);

  if (error) {
    throw new Error(`Failed to batch update check-in status: ${error.message}`);
  }
}

/**
 * Delete a registrant
 */
export async function deleteRegistrant(id: number): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase.from("kickstart_form_entries").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete registrant: ${error.message}`);
  }
}

/**
 * Get event registration status (open/closed)
 */
export async function getEventRegistrationStatus(): Promise<boolean> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("options")
    .select("value")
    .eq("id", "is_event_closed")
    .single();

  if (error) {
    throw new Error(`Failed to get event status: ${error.message}`);
  }

  return data?.value ?? false;
}

/**
 * Toggle event registration status (open/closed)
 */
export async function toggleEventRegistrationStatus(
  isClosed: boolean
): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("options")
    .update({ id: "is_event_closed", value: isClosed })
    .eq("id", "is_event_closed");

  if (error) {
    throw new Error(`Failed to update event status: ${error.message}`);
  }
}

/**
 * Get count of accepted registrants per island
 */
export async function getIslandCounts(): Promise<Record<"Luzon" | "Visayas" | "Mindanao", number>> {
  const supabase = createClient();
  const islands: ("Luzon" | "Visayas" | "Mindanao")[] = ["Luzon", "Visayas", "Mindanao"];

  const counts: Record<"Luzon" | "Visayas" | "Mindanao", number> = {
    Luzon: 0,
    Visayas: 0,
    Mindanao: 0,
  };

  for (const island of islands) {
    const { count, error } = await supabase
      .from("kickstart_form_entries")
      .select("id", { count: "exact", head: true })
      .eq("island", island)
      .in("status", ["accepted", "pending"]); // Count accepted and pending as they can still attend

    if (error) {
      console.error(`Error counting ${island}:`, error);
      counts[island] = 0;
    } else {
      counts[island] = count ?? 0;
    }
  }

  return counts;
}

/**
 * Get per-island registration status (open/closed)
 */
export async function getIslandRegistrationStatus(): Promise<Record<"Luzon" | "Visayas" | "Mindanao", boolean>> {
  const supabase = createClient();
  const islandOptions: Record<"Luzon" | "Visayas" | "Mindanao", "island_luzon_closed" | "island_visayas_closed" | "island_mindanao_closed"> = {
    Luzon: "island_luzon_closed",
    Visayas: "island_visayas_closed",
    Mindanao: "island_mindanao_closed",
  };

  const status: Record<"Luzon" | "Visayas" | "Mindanao", boolean> = {
    Luzon: false,
    Visayas: false,
    Mindanao: false,
  };

  for (const [island, optionId] of Object.entries(islandOptions) as [keyof typeof islandOptions, typeof islandOptions[keyof typeof islandOptions]][]) {
    const { data, error } = await supabase
      .from("options")
      .select("value")
      .eq("id", optionId)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error(`Error getting ${island} status:`, error);
      status[island] = false; // Default to open if error
    } else {
      status[island] = data?.value ?? false;
    }
  }

  return status;
}

/**
 * Close registration for a specific island
 */
export async function closeIslandRegistration(island: "Luzon" | "Visayas" | "Mindanao"): Promise<void> {
  const supabase = createClient();
  const islandOptions: Record<"Luzon" | "Visayas" | "Mindanao", "island_luzon_closed" | "island_visayas_closed" | "island_mindanao_closed"> = {
    Luzon: "island_luzon_closed",
    Visayas: "island_visayas_closed",
    Mindanao: "island_mindanao_closed",
  };

  const optionId = islandOptions[island];

  // First, try to update existing option
  const { error: updateError } = await supabase
    .from("options")
    .update({ value: true })
    .eq("id", optionId);

  // If update fails (option doesn't exist), insert it
  if (updateError) {
    const { error: insertError } = await supabase
      .from("options")
      .insert({ id: optionId, value: true });

    if (insertError) {
      throw new Error(`Failed to close ${island} registration: ${insertError.message}`);
    }
  }
}

/**
 * Check island counts and automatically close registration if limit reached (150 per island)
 */
export async function checkAndCloseIslandRegistrations(): Promise<("Luzon" | "Visayas" | "Mindanao")[]> {
  const supabase = createClient();
  const MAX_PER_ISLAND = 150;
  const closedIslands: ("Luzon" | "Visayas" | "Mindanao")[] = [];
  const islands: ("Luzon" | "Visayas" | "Mindanao")[] = ["Luzon", "Visayas", "Mindanao"];

  // Get current counts per island
  const counts = await getIslandCounts();
  
  // Get current status
  const status = await getIslandRegistrationStatus();

  // Check each island
  for (const island of islands) {
    const count = counts[island];
    // If island is not already closed and count >= 150, close it
    if (!status[island] && count >= MAX_PER_ISLAND) {
      try {
        await closeIslandRegistration(island);
        closedIslands.push(island);
        console.log(`Automatically closed registration for ${island} (reached ${count} participants)`);
      } catch (error) {
        console.error(`Failed to close ${island} registration:`, error);
      }
    }
  }

  return closedIslands;
}
