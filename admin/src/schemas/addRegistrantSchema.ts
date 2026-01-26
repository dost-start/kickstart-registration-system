import { UNIVERSITY_OPTIONS, SCHOLARSHIP_OPTIONS, YEAR_AWARDED_OPTIONS, OTHER_UNIVERSITY_LABEL, ISLAND_OPTIONS } from "@/types/types";
import z from "zod";

// Validation schema for admin adding registrants
export const addRegistrantSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  middle_name: z.string().optional(),
  last_name: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  contact_number: z.string().min(1, "Contact number is required"),
  university: z.union([
    z.enum(UNIVERSITY_OPTIONS),
    z.literal(OTHER_UNIVERSITY_LABEL),
  ], { message: "Please select a valid university" }),
  university_other: z.string().optional(),
  course: z.string().min(1, "Course is required"),
  scholarship_type: z.enum(SCHOLARSHIP_OPTIONS, {
    message: "Please select a valid scholarship type",
  }),
  year_awarded: z.enum(YEAR_AWARDED_OPTIONS, {
    message: "Please select the scholarship year/batch",
  }),
  status: z.enum(["pending", "accepted", "rejected", "waitlisted"] as const),
  is_checked_in: z.boolean(),
  has_attended_ga: z.boolean(),
  has_dost_sa: z.boolean(),
  dietary_restrictions: z.string().optional(),
  preferred_date: z.string().min(1, "Preferred date is required"),
  seat_assignment: z.string().optional(),
  event_uid: z.string().optional(),
  island: z.enum(ISLAND_OPTIONS, {
    message: "Please select an island",
  }).optional(),
  is_start_member: z.boolean(),
  why_join: z.string().optional(),
}).refine(
  (data) => {
    if (data.university === OTHER_UNIVERSITY_LABEL) {
      return !!data.university_other && data.university_other.trim().length > 0;
    }
    return true;
  },
  {
    message: "Please specify the university name",
    path: ["university_other"],
  }
);
