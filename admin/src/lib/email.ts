import nodemailer from "nodemailer";
import { Resend } from "resend";

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  qrCode: string; // base64 encoded
  qrCodeFilename: string;
  /** Optional Apple Wallet .pkpass attachment for "Add to Wallet" */
  walletPass?: { buffer: Buffer; filename: string };
  /** Optional venue map attachment (e.g. Luzon venue map image) */
  venueMap?: { buffer: Buffer; filename: string };
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  emailId?: string;
  method?: string;
  error?: string;
}

/**
 * Send an email with QR code attachment
 * Supports both SMTP (Gmail) and Resend
 */
export async function sendEmailWithQRCode(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const { to, subject, html, qrCode, qrCodeFilename, walletPass, venueMap } =
    options;

  // Check for SMTP configuration (Gmail)
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!smtpHost && !resendApiKey) {
    return {
      success: false,
      error: "Email service not configured. Please set either SMTP credentials or RESEND_API_KEY.",
    };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return {
      success: false,
      error: `Invalid email address: ${to}`,
    };
  }

  // Convert base64 QR code to buffer
  let qrCodeBuffer: Buffer;
  try {
    qrCodeBuffer = Buffer.from(qrCode, "base64");
  } catch (err) {
    return {
      success: false,
      error: "Failed to process QR code attachment",
    };
  }

  // Determine email FROM address
  const emailFrom =
    process.env.EMAIL_FROM ||
    (smtpUser ? `KickSTART <${smtpUser}>` : "KickSTART <onboarding@resend.dev>");

  // Use SMTP (Gmail) if configured
  if (smtpHost && smtpUser && smtpPass) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_PORT === "465",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      const attachments: { filename: string; content: Buffer }[] = [
        { filename: qrCodeFilename, content: qrCodeBuffer },
      ];
      if (walletPass) {
        attachments.push({
          filename: walletPass.filename,
          content: walletPass.buffer,
        });
      }
      if (venueMap) {
        attachments.push({
          filename: venueMap.filename,
          content: venueMap.buffer,
        });
      }

      const info = await transporter.sendMail({
        from: emailFrom,
        to: to,
        subject: subject,
        html: html,
        attachments,
      });

      return {
        success: true,
        messageId: info.messageId,
        method: "SMTP",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email via SMTP",
      };
    }
  }

  // Fall back to Resend
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);

      const attachments: { filename: string; content: Buffer }[] = [
        { filename: qrCodeFilename, content: qrCodeBuffer },
      ];
      if (walletPass) {
        attachments.push({
          filename: walletPass.filename,
          content: walletPass.buffer,
        });
      }
      if (venueMap) {
        attachments.push({
          filename: venueMap.filename,
          content: venueMap.buffer,
        });
      }

      const { data, error } = await resend.emails.send({
        from: emailFrom,
        to: [to],
        subject: subject,
        html: html,
        attachments,
      });

      if (error) {
        return {
          success: false,
          error: `Resend error: ${error.message}`,
        };
      }

      return {
        success: true,
        emailId: data?.id,
        method: "Resend",
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send email via Resend",
      };
    }
  }

  return {
    success: false,
    error: "No email service configured",
  };
}

