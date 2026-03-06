"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export type CustomEmailResult = {
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
};

export async function sendCustomEmails(
  participantIds: number[],
  subject: string,
  htmlBody: string
): Promise<CustomEmailResult> {
  const supabase = await createClient();

  const { data: participants, error: fetchError } = await supabase
    .from("kickstart_form_entries")
    .select("*")
    .in("id", participantIds);

  if (fetchError) {
    throw new Error(`Failed to fetch participants: ${fetchError.message}`);
  }

  if (!participants || participants.length === 0) {
    return {
      success: false,
      sent: 0,
      failed: 0,
      errors: [{ email: "N/A", error: "No participants found" }],
    };
  }

  const results: CustomEmailResult = {
    success: false,
    sent: 0,
    failed: 0,
    errors: [],
  };

  const resend = new Resend(process.env.RESEND_API_KEY);
  const fromEmail = process.env.EMAIL_FROM || "KickSTART 2026 <noreply@simera.cloud>";

  // Helper for adding delay between sends
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  for (const participant of participants) {
    if (!participant.email) {
      results.failed++;
      results.errors.push({
        email: "No email",
        error: "Participant has no email address",
      });
      continue;
    }

    try {
      const fullName = `${participant.first_name} ${participant.middle_name ? participant.middle_name + " " : ""}${participant.last_name}${participant.suffix ? " " + participant.suffix : ""}`;

      // Replace placeholders in subject and body
      const personalizedSubject = subject
        .replace(/{{name}}/g, fullName)
        .replace(/{{first_name}}/g, participant.first_name || "")
        .replace(/{{last_name}}/g, participant.last_name || "")
        .replace(/{{email}}/g, participant.email || "")
        .replace(/{{event_uid}}/g, participant.event_uid || "")
        .replace(/{{island}}/g, participant.island || "")
        .replace(/{{status}}/g, participant.status || "")
        .replace(/{{university}}/g, participant.university || "");

      const personalizedBody = htmlBody
        .replace(/{{name}}/g, fullName)
        .replace(/{{first_name}}/g, participant.first_name || "")
        .replace(/{{last_name}}/g, participant.last_name || "")
        .replace(/{{email}}/g, participant.email || "")
        .replace(/{{event_uid}}/g, participant.event_uid || "")
        .replace(/{{island}}/g, participant.island || "")
        .replace(/{{status}}/g, participant.status || "")
        .replace(/{{university}}/g, participant.university || "");

      await resend.emails.send({
        from: fromEmail,
        to: participant.email,
        subject: personalizedSubject,
        html: wrapInEmailTemplate(personalizedBody),
      });

      results.sent++;
      results.success = true;
      console.log(`✅ Custom email sent to ${participant.email}`);
    } catch (error) {
      results.failed++;
      results.errors.push({
        email: participant.email,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      console.error(`❌ Failed to send to ${participant.email}:`, error);
    }

    // Add a 500ms delay between emails to prevent rate limiting
    if (participant !== participants[participants.length - 1]) {
      await delay(500);
    }
  }

  if (results.sent > 0) results.success = true;

  console.log("📊 Custom email blast results:", {
    total: participants.length,
    sent: results.sent,
    failed: results.failed,
  });

  return results;
}

function wrapInEmailTemplate(body: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0f9dfe 0%, #0d8ae8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">KickSTART 2026</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">START-DOST General Assembly</p>
  </div>
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    ${body}
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    <p style="font-size: 12px; color: #666; text-align: center;">
      This is an automated email. Please do not reply to this message.<br>
      If you have any questions, please contact the event organizers.
    </p>
  </div>
</body>
</html>`.trim();
}
