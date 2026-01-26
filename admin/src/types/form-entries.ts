import { Database } from "./supabase";

export type FormEntry = Database["public"]["Tables"]["kickstart_form_entries"]["Row"];
export type FormEntryInsert =
  Database["public"]["Tables"]["kickstart_form_entries"]["Insert"];
export type FormEntryUpdate =
  Database["public"]["Tables"]["kickstart_form_entries"]["Update"];

export type StatusType = Database["public"]["Enums"]["status"];

export interface RegistrantStats {
  total: number;
  accepted: number;
  rejected: number;
  pending: number;
  waitlisted: number;
  checkedIn: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}
