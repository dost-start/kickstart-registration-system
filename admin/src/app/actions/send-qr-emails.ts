"use server";

import { createClient } from "@/lib/supabase/server";
import { generateQRCodeBuffer } from "@/lib/qr-code";
import { sendEmailWithQRCode } from "@/lib/email";
import {
  generateAppleWalletPass,
  isWalletPassConfigured,
} from "@/lib/wallet-pass";
import type { FormEntry } from "@/types/form-entries";
import fs from "node:fs/promises";
import path from "node:path";

export type EmailSendResult = {
  success: boolean;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
};

/**
 * Send emails with QR codes to participants
 * @param participantIds - Array of participant IDs to send emails to
 * @param emailSubject - Custom email subject (optional)
 * @param emailBody - Custom email body (optional)
 */
export async function sendQREmails(
  participantIds: number[],
  emailSubject?: string,
  emailBody?: string
): Promise<EmailSendResult> {
  const supabase = await createClient();

  // Fetch participants (don't filter by status here - the UI already filtered)
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
      errors: [{ email: "N/A", error: "No accepted participants found" }],
    };
  }

  const results: EmailSendResult = {
    success: false, // Will be set to true if at least one email is sent
    sent: 0,
    failed: 0,
    errors: [],
  };

  // Process each participant
  for (const participant of participants) {
    if (!participant.email) {
      results.failed++;
      results.errors.push({
        email: participant.email || "No email",
        error: "Participant has no email address",
      });
      continue;
    }

    if (!participant.event_uid) {
      results.failed++;
      results.errors.push({
        email: participant.email,
        error: "Participant has no event UID",
      });
      continue;
    }

    try {
      // Generate QR code
      const qrCodeBuffer = await generateQRCodeBuffer(participant.event_uid);

      // Generate Apple Wallet pass if configured
      let walletPass: { buffer: Buffer; filename: string } | undefined;
      if (isWalletPassConfigured()) {
        const passBuffer = await generateAppleWalletPass(participant);
        if (passBuffer) {
          walletPass = {
            buffer: passBuffer,
            filename: `KickSTART-2026-${participant.event_uid}.pkpass`,
          };
          console.log(`🍎 Wallet pass generated for ${participant.email}`);
        }
      }

      // Send email directly (no API route needed)
      console.log(`📧 Sending email to ${participant.email}`);

      // Attach Luzon-specific venue map image when applicable
      let venueMap:
        | {
            buffer: Buffer;
            filename: string;
          }
        | undefined;

      if (participant.island === "Luzon") {
        try {
          const venueMapPath = path.join(
            process.cwd(),
            "public",
            "venue-map.JPEG"
          );
          const buffer = await fs.readFile(venueMapPath);
          venueMap = {
            buffer,
            filename: "KickSTART-2026-Luzon-Venue-Map.jpeg",
          };
        } catch (error) {
          console.error("Failed to load Luzon venue map image:", error);
        }
      }

      const emailResult = await sendEmailWithQRCode({
        to: participant.email,
        subject: emailSubject || getDefaultSubject(participant),
        html: emailBody || getDefaultEmailBody(participant, !!walletPass),
        qrCode: qrCodeBuffer.toString("base64"),
        qrCodeFilename: `qr-code-${participant.event_uid}.png`,
        walletPass,
        venueMap,
      });

      if (emailResult.success) {
        console.log(`✅ Email sent to ${participant.email}:`, {
          messageId: emailResult.messageId || "N/A",
          emailId: emailResult.emailId || "N/A",
          method: emailResult.method || "SMTP",
        });
        results.sent++;
        results.success = true; // At least one email was sent successfully
      } else {
        const errorMsg = emailResult.error || "Email sending failed";
        console.error(`❌ Email not sent to ${participant.email}:`, errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      results.failed++;
      results.errors.push({
        email: participant.email,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  // Final success status: true if at least one email was sent
  if (results.sent > 0) {
    results.success = true;
  }

  console.log("📊 Final email send results:", {
    total: participants.length,
    sent: results.sent,
    failed: results.failed,
    success: results.success,
  });

  return results;
}

function getDefaultSubject(participant: FormEntry): string {
  const island = participant.island || "Luzon";
  return `Your KickSTART ${island} 2026 Check-in QR Code - ${participant.event_uid}`;
}

function getDefaultEmailBody(
  participant: FormEntry,
  includeWalletInstructions = false
): string {
  const fullName = `${participant.first_name} ${participant.middle_name ? participant.middle_name + " " : ""}${participant.last_name}${participant.suffix ? " " + participant.suffix : ""}`;
  const island = participant.island || "Luzon";
  const eventDate =
    island === "Luzon" || island === "Visayas"
      ? "February 28, 2026"
      : "March 14, 2026";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>KickSTART Luzon 2026 - Your QR Code</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0f9dfe 0%, #0d8ae8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px;">KickSTART ${island} 2026</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">START-DOST General Assembly</p>
  </div>
  
  <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
    <h2 style="color: #0f9dfe; margin-top: 0;">Hello ${participant.first_name}!</h2>
    
    <p>Thank you for registering for <strong>KickSTART ${island} 2026: START-DOST General Assembly</strong>.</p>
    
    <p>Your registration has been <strong style="color: #10b981;">accepted</strong>! Please find your check-in QR code attached to this email.</p>
    
    <div style="background: #f9fafb; border-left: 4px solid #0f9dfe; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="color: #0f9dfe; margin-top: 0;">Your Event Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Name:</strong></td>
          <td style="padding: 8px 0; color: #333;">${fullName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Event UID:</strong></td>
          <td style="padding: 8px 0; color: #333; font-family: monospace;">${participant.event_uid}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Date:</strong></td>
          <td style="padding: 8px 0; color: #333;">${eventDate}</td>
        </tr>
        
        <tr>
          <td style="padding: 8px 0; color: #666;"><strong>Location:</strong></td>
          <td style="padding: 8px 0; color: #333;">${
            island === "Luzon"
              ? "Batangas State University, The National Engineering University (Alangilan Campus) – Leonardo Da Vinci Amphitheater (3rd floor of Albert Einstein Building)"
              : island === "Visayas"
                ? "University of Southern Philippines Foundation"
                : "University of Mindanao - Main Campus"
          }</td>
        </tr>
      </table>
    </div>
    
    <div style="background: #fff9e6; border: 1px solid #fcea3f; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="color: #856404; margin-top: 0;">📱 Important Instructions</h3>
      <ul style="color: #856404; padding-left: 20px;">
        <li>Your QR code is attached to this email</li>
        ${includeWalletInstructions ? '<li><strong>Add to Apple Wallet:</strong> Open the .pkpass attachment on your iPhone to add your ticket to Wallet for quick access at check-in</li>' : ""}
        <li>Save the QR code image to your phone or print it out</li>
        <li>Present your QR code at the check-in counter on the event day</li>
        <li>Make sure your QR code is clearly visible and not damaged</li>
        <li>Please bring a <strong>tablet or iPad (or similar device) or Laptop</strong> that you can use during the ideathon and workshop.</li>
        <li>Present your valid ID or school ID to the guard upon entry for verification. <strong>No ID, no entry.</strong></li>
        <li>No backing out.</li>
        <li>Registration starts at <strong>12NN</strong>.</li>
        <li>Lastly, <strong>huwag magpapalipas ng gutom ah :))</strong></li>
      </ul>
    </div>

    ${
      island === "Luzon"
        ? `
    <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="color: #92400e; margin-top: 0;">🔔 Luzon-Specific Reminders</h3>
      <ol style="color: #92400e; padding-left: 20px; margin: 0;">
        <li><strong>STRICTLY NO PARKING</strong> (drop and go lang pwede)</li>
        <li><strong>STRICTLY NO THROWING OF TRASH ANYWHERE</strong> (pakiuwi ang trash with you)</li>
        <li>Gate 2 will be used for <strong>Entrance</strong>, while Gate 3 will be used for <strong>Exit</strong>.</li>
        <li>Participants shall only walk along the pathway indicated in the venue map.</li>
        <li>Additionally, <strong>no plastic bottles will be allowed upon entry</strong>.</li>
        <li>The detailed <strong>venue map is attached</strong> to this email for your reference.</li>
      </ol>
    </div>
    `
        : island === "Mindanao"
          ? `
    <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 20px; margin: 25px 0; border-radius: 5px;">
      <h3 style="color: #92400e; margin-top: 0;">🔔 Mindanao-Specific Reminders</h3>
      <ol style="color: #92400e; padding-left: 20px; margin: 0;">
        <li><strong>STRICTLY NO PARKING</strong> (drop-and-go only).</li>
        <li><strong>STRICTLY NO THROWING OF TRASH ANYWHERE</strong></li>
        <li>Location: AVR-GET BLDG, University of Mindanao-Matina</li> 
        <li>You may use the <strong>Matina Gate</strong> or <strong>Maa Gate</strong> for entry.</li>
        <li>Please be mindful of the university dress code. Refer here: <a href="https://online.fliphtml5.com/zyzbr/obgp/" style="color: #92400e;">https://online.fliphtml5.com/zyzbr/obgp/</a></li>
        <li>Please present a valid ID or school ID to the guard upon entry for verification. Use the same university/organization ID you registered with. <strong>No ID, no entry.</strong></li>
        <li>Register on Luma now for a <strong>chance to win exclusive Avalanche merch! </strong> Winners will be announced on-site at the event. 🔗 Sign up here: <a href="https://luma.com/o7hrsicu" style="color: #92400e;">https://luma.com/o7hrsicu</a></li>
      </ol>
    </div>
    `
          : ""
    }
    
    <p style="margin-top: 30px;">We look forward to seeing you at the event!</p>
    
    <p style="margin-top: 20px;">
      Best regards,<br>
      <strong>KickSTART 2026 Organizing Committee</strong>
    </p>
    
    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0;">
    
    <p style="font-size: 12px; color: #666; text-align: center;">
      This is an automated email. Please do not reply to this message.<br>
      If you have any questions, please contact the event organizers.
    </p>
  </div>
</body>
</html>
  `.trim();
}

