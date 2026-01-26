import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { normalizeEventUid } from "@/lib/event-pass";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawCode = typeof body?.code === "string" ? body.code : "";

    if (!rawCode.trim()) {
      return NextResponse.json(
        { error: "QR code value is required" },
        { status: 400 }
      );
    }

    const normalizedCode = normalizeEventUid(rawCode);
    const supabase = await createClient();

    const { data: registrant, error } = await supabase
      .from("kickstart_form_entries")
      .select("*")
      .eq("event_uid", normalizedCode)
      .maybeSingle();

    if (error && error.code !== "PGRST116") {
      console.error("Error looking up QR UID", error);
      return NextResponse.json(
        { error: "Failed to lookup QR code" },
        { status: 500 }
      );
    }

    if (!registrant) {
      return NextResponse.json(
        {
          error:
            "QR code not recognized. Double-check that the participant has a generated UID.",
        },
        { status: 404 }
      );
    }

    if (registrant.is_checked_in) {
      return NextResponse.json({
        registrant,
        alreadyCheckedIn: true,
      });
    }

    const { data: updatedRegistrant, error: updateError } = await supabase
      .from("kickstart_form_entries")
      .update({ is_checked_in: true })
      .eq("id", registrant.id)
      .select("*")
      .single();

    if (updateError || !updatedRegistrant) {
      console.error("Failed to update check-in status", updateError);
      return NextResponse.json(
        { error: "Failed to update check-in status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      registrant: updatedRegistrant,
      alreadyCheckedIn: false,
    });
  } catch (err) {
    console.error("Unexpected check-in API error", err);
    return NextResponse.json(
      { error: "Unexpected error while checking in participant" },
      { status: 500 }
    );
  }
}

