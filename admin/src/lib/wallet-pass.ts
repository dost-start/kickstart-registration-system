import { PKPass } from "passkit-generator";
import { PNG } from "pngjs";
import type { FormEntry } from "@/types/form-entries";

/** Event info per island for wallet pass */
const EVENT_INFO: Record<
  string,
  { date: string; location: string; eventName: string }
> = {
  Luzon: {
    date: "February 28, 2026",
    location: "Batangas State University - Alangilan Campus",
    eventName: "KickSTART Luzon 2026",
  },
  Visayas: {
    date: "February 28, 2026",
    location: "University of Southern Philippines Foundation",
    eventName: "KickSTART Visayas 2026",
  },
  Mindanao: {
    date: "March 14, 2026",
    location: "University of Mindanao - Main Campus",
    eventName: "KickSTART Mindanao 2026",
  },
};

/** Create a 58x58 PNG icon for the pass (KickSTART blue) */
function createPassIcon(): Buffer {
  const size = 58;
  const png = new PNG({ width: size, height: size });
  // #0f9dfe - KickSTART blue
  const r = 15;
  const g = 157;
  const b = 254;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;
    }
  }
  return PNG.sync.write(png);
}

/** Check if Apple Wallet pass generation is configured */
export function isWalletPassConfigured(): boolean {
  const passTypeId = process.env.PASS_TYPE_ID;
  const teamId = process.env.TEAM_ID;
  const orgName = process.env.ORG_NAME;
  const signerCert = process.env.APPLE_SIGNER_CERT_BASE64;
  const signerKey = process.env.APPLE_SIGNER_KEY_BASE64;
  const wwdr = process.env.APPLE_WWDR_BASE64;
  return !!(
    passTypeId &&
    teamId &&
    orgName &&
    signerCert &&
    signerKey &&
    wwdr
  );
}

/**
 * Generate an Apple Wallet (.pkpass) ticket for a participant.
 * Returns Buffer of .pkpass file, or null if not configured or generation fails.
 *
 * Required env vars (from Apple Developer Program):
 * - PASS_TYPE_ID: e.g. pass.com.startdost.kickstart
 * - TEAM_ID: Apple Developer Team ID
 * - ORG_NAME: Organization name
 * - APPLE_SIGNER_CERT_BASE64: Base64-encoded .p12 certificate
 * - APPLE_SIGNER_KEY_BASE64: Base64-encoded private key (or use .p12)
 * - APPLE_WWDR_BASE64: Base64-encoded Apple WWDR certificate
 * - APPLE_SIGNER_KEY_PASSPHRASE: (optional) Passphrase for the certificate
 */
export async function generateAppleWalletPass(
  participant: FormEntry
): Promise<Buffer | null> {
  if (!participant.event_uid) return null;
  if (!isWalletPassConfigured()) return null;

  const passTypeId = process.env.PASS_TYPE_ID!;
  const teamId = process.env.TEAM_ID!;
  const orgName = process.env.ORG_NAME!;
  const signerCert = Buffer.from(
    process.env.APPLE_SIGNER_CERT_BASE64!,
    "base64"
  );
  const signerKey = Buffer.from(
    process.env.APPLE_SIGNER_KEY_BASE64!,
    "base64"
  );
  const wwdr = Buffer.from(process.env.APPLE_WWDR_BASE64!, "base64");
  const signerKeyPassphrase = process.env.APPLE_SIGNER_KEY_PASSPHRASE || "";

  const island = participant.island || "Luzon";
  const eventInfo = EVENT_INFO[island] || EVENT_INFO.Luzon;
  const fullName = `${participant.first_name}${participant.middle_name ? " " + participant.middle_name : ""} ${participant.last_name}${participant.suffix ? " " + participant.suffix : ""}`.trim();

  const iconBuffer = createPassIcon();

  const passJson = {
    formatVersion: 1,
    passTypeIdentifier: passTypeId,
    teamIdentifier: teamId,
    organizationName: orgName,
    description: "KickSTART 2026 - START-DOST General Assembly",
    serialNumber: participant.event_uid,
    foregroundColor: "rgb(255, 255, 255)",
    backgroundColor: "rgb(15, 157, 254)",
    labelColor: "rgb(255, 255, 255)",
    eventTicket: {
      primaryFields: [
        {
          key: "event",
          label: "Event",
          value: eventInfo.eventName,
        },
      ],
      secondaryFields: [
        {
          key: "name",
          label: "Attendee",
          value: fullName,
        },
      ],
      auxiliaryFields: [
        {
          key: "date",
          label: "Date",
          value: eventInfo.date,
        },
      ],
      backFields: [
        {
          key: "location",
          label: "Location",
          value: eventInfo.location,
        },
        {
          key: "seat",
          label: "Seat",
          value: participant.seat_assignment || "To be assigned",
        },
        {
          key: "uid",
          label: "Event UID",
          value: participant.event_uid,
        },
      ],
      barcode: {
        message: participant.event_uid,
        format: "PKBarcodeFormatQR",
        messageEncoding: "iso-8859-1",
      },
    },
  };

  try {
    const pass = new PKPass(
      {
        "icon.png": iconBuffer,
        "icon@2x.png": iconBuffer,
        "pass.json": Buffer.from(JSON.stringify(passJson)),
      },
      {
        wwdr,
        signerCert,
        signerKey,
        signerKeyPassphrase,
      },
      {
        serialNumber: participant.event_uid,
      }
    );

    const buffer = pass.getAsBuffer();
    return buffer;
  } catch (error) {
    console.error("Failed to generate Apple Wallet pass:", error);
    return null;
  }
}
