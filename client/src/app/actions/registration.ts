/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import {
  RegistrationFormData,
  registrationSchema,
} from "@/components/registration-form/registrationSchema";
import { Database, TablesInsert } from "@/types/supabase";
import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { getEventRegistrationStatus } from "./event-status";
import { generateEventUid } from "@/lib/event-pass";

const ISLAND_LIMIT = 150;
type Island = "Luzon" | "Visayas" | "Mindanao";

async function getIslandClosedOptionId(island: Island) {
  if (island === "Luzon") return "island_luzon_closed" as const;
  if (island === "Visayas") return "island_visayas_closed" as const;
  return "island_mindanao_closed" as const;
}

async function assertIslandIsOpen(
  supabase: SupabaseClient<Database>,
  island: Island
) {
  const optionId = await getIslandClosedOptionId(island);

  const { data: islandStatusRow, error: islandStatusError } = await supabase
    .from("options")
    .select("value")
    .eq("id", optionId)
    .maybeSingle();

  if (islandStatusError && islandStatusError.code !== "PGRST116") {
    throw new Error(`Failed to check island registration status.`);
  }

  const isClosed = islandStatusRow?.value ?? false;
  if (isClosed) {
    throw new Error(
      `Registration for ${island} is currently closed. The limit of ${ISLAND_LIMIT} participants has been reached.`
    );
  }

  const { count, error: countError } = await supabase
    .from("kickstart_form_entries")
    .select("id", { count: "exact", head: true })
    .eq("island", island)
    .in("status", ["pending", "accepted"]);

  if (countError) {
    throw new Error(`Failed to check island capacity.`);
  }

  const currentCount = count ?? 0;
  if (currentCount >= ISLAND_LIMIT) {
    // Best-effort: mark island closed (may be blocked by RLS depending on your policies)
    await supabase
      .from("options")
      .update({ value: true })
      .eq("id", optionId);

    throw new Error(
      `Registration for ${island} is full. The limit of ${ISLAND_LIMIT} participants has been reached.`
    );
  }
}

async function getUniqueEventUid(
  supabase: SupabaseClient<Database>,
  options: { preferredDate?: string | null; familyName?: string | null }
) {
  const MAX_ATTEMPTS = 8;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const { uid, seatLabel } = generateEventUid(options);

    const { data: existing, error } = await supabase
      .from("kickstart_form_entries")
      .select("id")
      .eq("event_uid", uid)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!existing) {
      return { uid, seatLabel };
    }
  }

  throw new Error("Unable to generate a unique event UID. Please try again.");
}

export async function submitRegistration(data: RegistrationFormData) {
  try {
    // Check if registration is closed before processing
    const isRegistrationClosed = await getEventRegistrationStatus();
    if (isRegistrationClosed) {
      return {
        success: false,
        message: "Registration is currently closed for this event.",
        errors: null,
      };
    }

    // Log the received data (remove in production)
    console.log("Registration data received:", data);
    const validationResult = registrationSchema.safeParse(data);

    if (!validationResult.success) {
      // Log validation errors (remove in production)
      console.error("Validation errors:", validationResult.error.format());
      return {
        success: false,
        message: "Please correct the form errors.",
        errors: validationResult.error.format(),
      };
    }

    // Validated data (remove in production)
    const validatedData = validationResult.data;

    // Log successful validation (remove in production)
    console.log(
      "Validation successful. Proceeding with submission:",
      validatedData
    );

    // Handle university field - use enum values directly
    const isOtherUniversity = validatedData.university === "Other (please specify)";
    const universityValue = isOtherUniversity ? "Other" : validatedData.university;
    
    // Store custom university in university_custom field if "Other" was selected
    const customUniversity = isOtherUniversity ? (validatedData.universityOther ?? "") : "";
    const dietaryRestrictions = validatedData.dietaryRestrictions ?? "";

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
        setAll(cookies: any) {
          try {
            cookies.forEach(
              (cookie: { name: string; value: string; options?: any }) => {
                cookieStore.set(cookie.name, cookie.value, cookie.options);
              }
            );
          } catch {}
        },
      },
    });

    // First, try a simple query to verify table access
    // This helps diagnose schema cache issues
    const { error: testError } = await supabase
      .from("kickstart_form_entries")
      .select("id")
      .limit(1);

    if (testError && testError.code === "PGRST205") {
      console.error("Schema cache error - table not accessible:", testError);
      return {
        success: false,
        message: "PostgREST schema cache needs to be refreshed. Even after archiving the old table, PostgREST's cache can be persistent. Please:\n\n1. Go to Supabase Dashboard > Settings > API\n2. Click 'Reload schema' button (wait 60-90 seconds after clicking)\n3. If you don't see 'Reload schema', try refreshing the browser page\n4. After reloading, wait another 30 seconds\n5. Restart your Next.js dev server (stop and start it again)\n6. Try the registration form again\n\nIf it still doesn't work after 5 minutes, PostgREST may need more time. The cache usually refreshes automatically within 10-15 minutes.",
        errors: null,
      };
    }

    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("kickstart_form_entries")
      .select("email")
      .eq("email", validatedData.email)
      .single();

    if (checkError) {
      // PGRST116 is "not found" error, which is what we want (email doesn't exist)
      if (checkError.code === "PGRST116") {
        // Email doesn't exist, continue with registration
      } else if (checkError.code === "PGRST205") {
        // Table not found in schema cache - PostgREST needs schema refresh
        console.error("Schema cache error - table not found:", checkError);
        return {
          success: false,
          message: "Database schema cache needs to be refreshed. Please refresh the schema in Supabase Dashboard (Settings > API > Reload schema) and try again.",
          errors: null,
        };
      } else {
        // Other errors
        console.error("Email check error:", checkError);
        return {
          success: false,
          message: "Failed to verify email availability. Please try again.",
          errors: null,
        };
      }
    }

    if (existingUser) {
      return {
        success: false,
        message:
          "This email is already registered. Please use a different email address or contact support if you believe this is an error.",
        errors: {
          email: {
            _errors: ["This email is already registered"],
          },
          _errors: [],
        },
      };
    }

    let eventUidResult: { uid: string; seatLabel: string } | null = null;
    try {
      eventUidResult = await getUniqueEventUid(supabase, {
        familyName: validatedData.lastName,
      });
    } catch (uidError) {
      console.error("UID generation error:", uidError);
      return {
        success: false,
        message:
          "Failed to generate your event QR code. Please try submitting the form again.",
        errors: null,
      };
    }

    if (!eventUidResult) {
      return {
        success: false,
        message: "Failed to generate your event QR code. Please try again.",
        errors: null,
      };
    }

    // Enforce per-island capacity + closure
    if (validatedData.island) {
      await assertIslandIsOpen(supabase, validatedData.island);
    }

    const formEntry: TablesInsert<"kickstart_form_entries"> = {
      first_name: validatedData.firstName,
      middle_name: validatedData.middleName ?? null,
      last_name: validatedData.lastName,
      suffix: validatedData.suffix ?? null,
      email: validatedData.email,
      contact_number: validatedData.contactNumber,
      university: universityValue as Database["public"]["Enums"]["university"],
      university_custom: customUniversity || null,
      course: validatedData.course,
      year_awarded: validatedData.yearAwarded,
      scholarship_type:
        validatedData.scholarshipType as unknown as Database["public"]["Enums"]["scholarship_type"],
      status: "pending",
      is_checked_in: false,
      has_attended_ga: validatedData.hasAttendedGA,
      has_dost_sa: validatedData.hasDostSa ?? false,
      dietary_restrictions: dietaryRestrictions || null,
      preferred_date: null,
      event_uid: eventUidResult.uid,
      seat_assignment: `Seat ${eventUidResult.seatLabel}`,
      island: validatedData.island ?? null,
      is_start_member: validatedData.isStartMember ?? false,
      why_join: validatedData.whyJoin?.trim() ? validatedData.whyJoin.trim() : null,
    };

    // Log the mapped entry (remove in production)
    console.log("Prepared database entry:", formEntry);

    const { data: insertedData, error } = await supabase
      .from("kickstart_form_entries")
      .insert(formEntry)
      .select()
      .single();

    if (error) {
      // Log the error (remove in production)
      console.error("Database error:", error);
      return {
        success: false,
        message: "Registration failed: " + (error.message || "Database error"),
        errors: null,
      };
    }

    console.log("Successfully inserted entry:", insertedData);

    // Encode email in base64 for URL parameter
    const encodedEmail = Buffer.from(validatedData.email).toString("base64");

    return {
      success: true,
      message: "Registration submitted successfully!",
      redirectUrl: `/success?e=${encodedEmail}`,
    };
  } catch (error: unknown) {
    // Error handling (remove in production)
    console.error("Registration submission error:", error);

    return {
      success: false,
      message: `Failed to submit registration: ${
        error instanceof Error ? error.message : "Unknown error"
      }. Please try again.`,
      errors: null,
    };
  }
}
