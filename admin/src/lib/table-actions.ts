import {
  updateRegistrantStatus,
  toggleRegistrantCheckIn,
  deleteRegistrant,
  batchUpdateCheckIn,
} from "@/lib/data";
import type { FormEntry, StatusType } from "@/types/form-entries";

/**
 * Handle updating registrant status
 */
export async function handleStatusUpdate(
  registrant: FormEntry,
  newStatus: StatusType,
  onSuccess: () => void
): Promise<void> {
  try {
    await updateRegistrantStatus(registrant.id, newStatus);
    onSuccess();
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
}

/**
 * Handle toggling registrant check-in status
 */
export async function handleCheckInToggle(
  registrant: FormEntry,
  onSuccess: () => void
): Promise<void> {
  try {
    const newCheckInStatus = !registrant.is_checked_in;
    await toggleRegistrantCheckIn(registrant.id, newCheckInStatus);
    onSuccess();
  } catch (error) {
    console.error("Error toggling check-in:", error);
    throw error;
  }
}

/**
 * Handle batch check-in/checkout
 */
export async function handleBatchCheckIn(
  registrantIds: number[],
  isCheckedIn: boolean,
  onSuccess: () => void
): Promise<void> {
  try {
    await batchUpdateCheckIn(registrantIds, isCheckedIn);
    onSuccess();
  } catch (error) {
    console.error("Error batch updating check-in:", error);
    throw error;
  }
}


/**
 * Handle deleting a registrant
 */
export async function handleRegistrantDelete(
  registrantId: number,
  onSuccess: () => void
): Promise<void> {
  try {
    await deleteRegistrant(registrantId);
    onSuccess();
  } catch (error) {
    console.error("Error deleting registrant:", error);
    throw error;
  }
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phoneNumber: string): string {
  // Remove any non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, "");

  // Format as (XXX) XXX-XXXX for US numbers or return as-is for international
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
      7
    )}`;
  }

  return phoneNumber; // Return original if it doesn't match expected patterns
}

/**
 * Truncate text to specified length with ellipsis
 */
export function truncateText(text: string, maxLength: number = 30): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Get status badge color class
 */
export function getStatusBadgeVariant(
  status: StatusType
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "accepted":
      return "default";
    case "rejected":
      return "destructive";
    case "pending":
      return "secondary";
    default:
      return "outline";
  }
}
