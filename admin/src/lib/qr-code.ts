import QRCode from "qrcode";

/**
 * Generate a QR code image buffer from an event UID
 * @param eventUid - The event UID to encode in the QR code
 * @returns Promise<Buffer> - QR code image as a buffer
 */
export async function generateQRCodeBuffer(eventUid: string): Promise<Buffer> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(eventUid, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });

    // Convert data URL to buffer
    const base64Data = qrCodeDataURL.replace(/^data:image\/png;base64,/, "");
    return Buffer.from(base64Data, "base64");
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generate a QR code as a data URL (for preview/display)
 * @param eventUid - The event UID to encode in the QR code
 * @returns Promise<string> - QR code as data URL
 */
export async function generateQRCodeDataURL(eventUid: string): Promise<string> {
  try {
    return await QRCode.toDataURL(eventUid, {
      errorCorrectionLevel: "M",
      type: "image/png",
      width: 300,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
    });
  } catch (error) {
    throw new Error(`Failed to generate QR code: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

