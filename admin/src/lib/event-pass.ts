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

function randomFourDigit(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function normalizeEventUid(uid: string): string {
  const sanitized = sanitizeSegment(uid);
  return sanitized || DEFAULT_PREFIX;
}

function getPrefixSegment(familyName?: string | null): string {
  if (!familyName) {
    return DEFAULT_PREFIX;
  }

  const sanitized = sanitizeSegment(familyName);
  return sanitized || DEFAULT_PREFIX;
}

export interface EventUidOptions {
  preferredDate?: string | null;
  familyName?: string | null;
  randomSeed?: string;
}

export function generateEventUid({
  preferredDate,
  familyName,
  randomSeed,
}: EventUidOptions = {}): string {
  const dateSegment = getDateSegment(preferredDate);
  const randomSegment = randomSeed || randomFourDigit();
  const prefixSegment = getPrefixSegment(familyName);

  return [prefixSegment, dateSegment, randomSegment]
    .filter(Boolean)
    .join("-");
}

