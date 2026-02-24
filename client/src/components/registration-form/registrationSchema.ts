import {
  YEAR_AWARDED_OPTIONS,
  UNIVERSITY_OPTIONS,
  SCHOLARSHIP_OPTIONS,
  OTHER_UNIVERSITY_LABEL,
  COURSE_OPTIONS,
  ISLAND_OPTIONS,
} from "@/types/types";
import { z } from "zod";

export const registrationSchema = z.object({
  // Core contact fields
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  contactNumber: z
    .string()
    .regex(
      /^09\d{9}$/,
      "Please enter a valid contact number starting with 09 (e.g., 09XXXXXXXXX)"
    )
    .min(1, "Contact number is required"),

  // Name fields
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional(),
  lastName: z.string().min(1, "Last name is required"),
  suffix: z.string().optional(),

  // Academic info
  university: z.union([
    z.enum(UNIVERSITY_OPTIONS),
    z.literal(OTHER_UNIVERSITY_LABEL),
  ], { message: "Please select a valid university" }),
  universityOther: z
    .string()
    .optional(),
  course: z.enum(COURSE_OPTIONS, {
    message: "Please select a valid course",
  }),
  scholarshipType: z.enum(SCHOLARSHIP_OPTIONS, {
    message: "Please select a valid scholarship type",
  }),
  yearAwarded: z.enum(YEAR_AWARDED_OPTIONS, {
    message: "Please select the scholarship year/batch",
  }),

  // Event-specific
  dietaryRestrictions: z.string().optional().or(z.literal("")),

  // Prioritization / limits
  island: z.enum(ISLAND_OPTIONS, { message: "Please select an island" }),
  isStartMember: z.boolean().optional(),
  whyJoin: z.string().optional(),

  // Consent
  agreeToDataPrivacy: z.boolean().refine((val) => val === true, {
    message: "You must agree to the Data Privacy Policy to register",
  }),
}).refine(
  (data) => {
    if (data.university === OTHER_UNIVERSITY_LABEL) {
      return !!data.universityOther && data.universityOther.trim().length > 0;
    }
    return true;
  },
  {
    message: "Please specify your school/university",
    path: ["universityOther"],
  }
);

export type RegistrationFormData = z.infer<typeof registrationSchema>;
