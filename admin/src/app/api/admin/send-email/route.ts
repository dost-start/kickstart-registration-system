import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      to,
      subject,
      html,
      qrCode,
      qrCodeFilename,
      participantName,
      eventUid,
      seatAssignment,
      preferredDate,
    } = body;

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, html" },
        { status: 400 }
      );
    }

    // Check if SMTP is configured (Gmail or other SMTP)
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    
    // Check if Resend is configured (alternative)
    const resendApiKey = process.env.RESEND_API_KEY;
    
    if (!smtpHost && !resendApiKey) {
      console.error("❌ Email service not configured");
      return NextResponse.json(
        {
          error: "Email service not configured. Please set either SMTP credentials or RESEND_API_KEY.",
          hint: "For Gmail: Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env.local",
        },
        { status: 500 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        { error: `Invalid email address: ${to}` },
        { status: 400 }
      );
    }

    // Convert base64 QR code to buffer
    let qrCodeBuffer: Buffer;
    try {
      qrCodeBuffer = Buffer.from(qrCode, "base64");
    } catch (err) {
      console.error("Failed to decode QR code:", err);
      return NextResponse.json(
        { error: "Failed to process QR code attachment" },
        { status: 400 }
      );
    }

    // Determine email FROM address
    const emailFrom = process.env.EMAIL_FROM || (smtpUser ? `KickSTART <${smtpUser}>` : "KickSTART <onboarding@resend.dev>");

    console.log("📧 Attempting to send email:", {
      to,
      from: emailFrom,
      subject,
      hasQRCode: !!qrCode,
      qrCodeSize: qrCodeBuffer.length,
      usingSMTP: !!smtpHost,
      usingResend: !!resendApiKey,
    });

    // Use SMTP (Gmail) if configured, otherwise fall back to Resend
    if (smtpHost && smtpUser && smtpPass) {
      // Send via SMTP (Gmail)
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const mailOptions = {
        from: emailFrom,
        to: to,
        subject: subject,
        html: html,
        attachments: [
          {
            filename: qrCodeFilename,
            content: qrCodeBuffer,
          },
        ],
      };

      const info = await transporter.sendMail(mailOptions);

      console.log("✅ Email sent successfully via SMTP:", {
        to,
        subject,
        participantName,
        eventUid,
        messageId: info.messageId,
        from: emailFrom,
      });

      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        messageId: info.messageId,
        to,
        from: emailFrom,
        method: "SMTP",
      });
    } else if (resendApiKey) {
      // Fall back to Resend
      const resend = new Resend(resendApiKey);

      const { data, error } = await resend.emails.send({
        from: emailFrom,
        to: [to],
        subject: subject,
        html: html,
        attachments: [
          {
            filename: qrCodeFilename,
            content: qrCodeBuffer,
          },
        ],
      });

      if (error) {
        console.error("❌ Resend API error:", {
          message: error.message,
          name: error.name,
          error: JSON.stringify(error, null, 2),
        });
        return NextResponse.json(
          {
            error: `Failed to send email: ${error.message}`,
            details: error,
          },
          { status: 500 }
        );
      }

      console.log("✅ Email sent successfully via Resend:", {
        to,
        subject,
        participantName,
        eventUid,
        emailId: data?.id,
        from: emailFrom,
      });

      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        emailId: data?.id,
        to,
        from: emailFrom,
        method: "Resend",
      });
    } else {
      throw new Error("No email service configured");
    }
  } catch (error) {
    console.error("❌ Unexpected error sending email:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send email",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

