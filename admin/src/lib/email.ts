import nodemailer from "nodemailer";
import { Resend } from "resend";

// Cache instances to reuse connections and avoid login rate limits
let cachedTransporter: nodemailer.Transporter | null = null;
let cachedResend: Resend | null = null;

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
      if (!cachedTransporter) {
        cachedTransporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_PORT === "465",
          pool: true, // Use connection pooling
          maxConnections: 3, // Max simultaneous connections
          maxMessages: 100, // Max messages per connection before recycling
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });
      }

      const transporter = cachedTransporter;

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
      if (!cachedResend) {
        cachedResend = new Resend(resendApiKey);
      }

      const resend = cachedResend;

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

export interface BasicSendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send a generic basic email, sharing the connection pool and SMTP config
 */
export async function sendBasicEmail(
  options: BasicSendEmailOptions
): Promise<SendEmailResult> {
  const { to, subject, html } = options;

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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(to)) {
    return {
      success: false,
      error: `Invalid email address: ${to}`,
    };
  }

  const emailFrom =
    process.env.EMAIL_FROM ||
    (smtpUser ? `KickSTART <${smtpUser}>` : "KickSTART <onboarding@resend.dev>");

  if (smtpHost && smtpUser && smtpPass) {
    try {
      if (!cachedTransporter) {
        cachedTransporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_PORT === "465",
          pool: true,
          maxConnections: 3,
          maxMessages: 100,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });
      }

      const transporter = cachedTransporter;

      const info = await transporter.sendMail({
        from: emailFrom,
        to: to,
        subject: subject,
        html: html,
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

  // Fallback to Resend
  if (resendApiKey) {
    try {
      if (!cachedResend) {
        cachedResend = new Resend(resendApiKey);
      }

      const resend = cachedResend;

      const { data, error } = await resend.emails.send({
        from: emailFrom,
        to: [to],
        subject: subject,
        html: html,
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

