import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { Resend } from "resend";

/**
 * Test endpoint to verify email configuration
 * GET /api/admin/test-email?to=your-email@example.com
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testEmail = searchParams.get("to");

    if (!testEmail) {
      return NextResponse.json(
        { error: "Please provide ?to=your-email@example.com" },
        { status: 400 }
      );
    }

    // Check for SMTP configuration (Gmail)
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const resendApiKey = process.env.RESEND_API_KEY;

    if (!smtpHost && !resendApiKey) {
      return NextResponse.json(
        {
          error: "Email service not configured",
          hint: "Add SMTP credentials (Gmail) or RESEND_API_KEY to your .env.local file",
          instructions: "See GMAIL_SMTP_SETUP.md for Gmail setup instructions",
        },
        { status: 500 }
      );
    }

    const emailFrom = process.env.EMAIL_FROM || (smtpUser ? `KickSTART <${smtpUser}>` : "KickSTART <onboarding@resend.dev>");

    console.log("Sending test email:", { from: emailFrom, to: testEmail, usingSMTP: !!smtpHost });

    // Use SMTP if configured
    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const info = await transporter.sendMail({
        from: emailFrom,
        to: testEmail,
        subject: "Test Email from KickSTART",
        html: `
          <h1>✅ Test Email Successful!</h1>
          <p>If you received this email, your Gmail SMTP configuration is working correctly!</p>
          <p><strong>Sent from:</strong> ${emailFrom}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <p><strong>Method:</strong> Gmail SMTP</p>
          <hr>
          <p style="color: #666; font-size: 12px;">You can now send QR code emails to participants from the admin panel!</p>
        `,
      });

      return NextResponse.json({
        success: true,
        message: "Test email sent successfully via Gmail SMTP",
        messageId: info.messageId,
        to: testEmail,
        from: emailFrom,
        method: "SMTP",
        hint: "Check your inbox (and spam folder) for the test email",
      });
    } else if (resendApiKey) {
      // Fall back to Resend
      const resend = new Resend(resendApiKey);

      const { data, error } = await resend.emails.send({
        from: emailFrom,
        to: [testEmail],
        subject: "Test Email from KickSTART",
        html: `
          <h1>Test Email</h1>
          <p>If you received this email, your Resend configuration is working correctly!</p>
          <p>Sent from: ${emailFrom}</p>
          <p>Time: ${new Date().toISOString()}</p>
        `,
      });

      if (error) {
        return NextResponse.json(
          {
            error: "Failed to send test email",
            details: error,
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: "Test email sent successfully via Resend",
        emailId: data?.id,
        to: testEmail,
        from: emailFrom,
        method: "Resend",
        hint: "Check your inbox (and spam folder) for the test email",
      });
    }
  } catch (error) {
    console.error("Test email error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send test email",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
