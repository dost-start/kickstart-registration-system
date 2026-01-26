import { fetchAllRegistrants } from "@/lib/data";
import type { FormEntry } from "@/types/form-entries";

/**
 * CSV headers for registrant data export
 */
export const CSV_HEADERS = [
  "ID",
  "First Name",
  "Middle Name",
  "Last Name",
  "Suffix",
  "Email",
  "Contact Number",
  "University",
  "University Other",
  "Course",
  "Year Awarded",
  "Scholarship Type",
  "Preferred Date",
  "Seat Assignment",
  "Event UID",
  "Has Attended GA",
  "Has DOST-SA",
  "Dietary Restrictions",
  "Status",
  "Checked In",
  "Created At",
];

/**
 * Convert a single registrant to CSV row format
 */
export function registrantToCSVRow(registrant: FormEntry): string[] {
  return [
    registrant.id.toString(),
    registrant.first_name,
    registrant.middle_name || "",
    registrant.last_name,
    registrant.suffix || "",
    registrant.email || "",
    registrant.contact_number,
    registrant.university,
    registrant.university_custom || "",
    registrant.course,
    registrant.year_awarded || "",
    registrant.scholarship_type,
    registrant.preferred_date || "",
    registrant.seat_assignment || "",
    registrant.event_uid || "",
    registrant.has_attended_ga ? "Yes" : "No",
    registrant.has_dost_sa ? "Yes" : "No",
    registrant.dietary_restrictions || "",
    registrant.status,
    registrant.is_checked_in ? "Yes" : "No",
    new Date(registrant.created_at).toISOString(),
  ];
}

/**
 * Generate CSV content from registrant data
 */
export function generateCSVContent(registrants: FormEntry[]): string {
  const rows = registrants.map(registrantToCSVRow);
  return [CSV_HEADERS, ...rows]
    .map((row) => row.map((field) => `"${field}"`).join(","))
    .join("\n");
}

/**
 * Download CSV file with given content and filename
 */
export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export all registrants to CSV file
 * Uses fetchAllRegistrants which handles pagination automatically
 */
export async function exportRegistrantsToCSV(): Promise<void> {
  try {
    // Fetch all registrant data for export (handles pagination automatically)
    const registrants = await fetchAllRegistrants();

    if (!registrants || registrants.length === 0) return;

    const csvContent = generateCSVContent(registrants);
    const filename = `registrants_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    downloadCSV(csvContent, filename);
  } catch (err) {
    console.error("Error exporting CSV:", err);
    throw err;
  }
}

/**
 * Export specific registrants to CSV file
 */
export function exportRegistrantsListToCSV(registrants: FormEntry[]): void {
  if (registrants.length === 0) return;

  const csvContent = generateCSVContent(registrants);
  const filename = `registrants_${new Date().toISOString().split("T")[0]}.csv`;

  downloadCSV(csvContent, filename);
}
