const DEFAULT_PREFIX = process.env.NEXT_PUBLIC_EVENT_UID_PREFIX || "simera";
const DEFAULT_DATE_SEGMENT = "general";

const DATE_SEGMENT_MAP: Record<string, string> = {
  "december 13": "dec13",
  "december 14": "dec14",
  "dec 13": "dec13",
  "dec 14": "dec14",
};

function sanitizeSegment(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

function getDateSegment(preferredDate?: string | null): string {
  if (!preferredDate) return DEFAULT_DATE_SEGMENT;

  const normalized = preferredDate.trim().toLowerCase();
  if (DATE_SEGMENT_MAP[normalized]) {
    return DATE_SEGMENT_MAP[normalized];
  }

  const sanitized = sanitizeSegment(normalized);
  return sanitized || DEFAULT_DATE_SEGMENT;
}

function randomSeatNumber(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function getSurnameSegment(familyName?: string | null): string {
  if (!familyName) return DEFAULT_PREFIX;
  const sanitized = sanitizeSegment(familyName);
  return sanitized || DEFAULT_PREFIX;
}

export interface EventUidOptions {
  preferredDate?: string | null;
  familyName?: string | null;
  seatNumber?: string;
}

export function generateEventUid({
  preferredDate,
  familyName,
  seatNumber,
}: EventUidOptions = {}): { uid: string; seatLabel: string } {
  const surnameSegment = getSurnameSegment(familyName);
  const dateSegment = getDateSegment(preferredDate);
  const seatSegment = (seatNumber || randomSeatNumber()).padStart(4, "0");

  return {
    uid: [surnameSegment, dateSegment, seatSegment].join("-"),
    seatLabel: seatSegment,
  };
}

