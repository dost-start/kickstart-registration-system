"use client";

import { submitRegistration } from "@/app/actions/registration";
import {
  registrationSchema,
  type RegistrationFormData,
} from "@/components/registration-form/registrationSchema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  YEAR_AWARDED_OPTIONS,
  UNIVERSITY_OPTIONS,
  SCHOLARSHIP_OPTIONS,
  OTHER_UNIVERSITY_LABEL,
  COURSE_OPTIONS,
  ISLAND_OPTIONS,
} from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import DataPrivacyDialog from "@/components/DataPrivacyDialog";
import { getIslandRegistrationStatus, type IslandStatus } from "@/app/actions/island-status";

type FormErrors = z.inferFormattedError<typeof registrationSchema>;
type SubmitMessageType = {
  success: boolean;
  message: string;
  errors?: FormErrors | null;
  redirectUrl?: string;
};
type FormFieldName = keyof RegistrationFormData;

export default function RegistrationForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<SubmitMessageType | null>(
    null
  );
  const [islandStatus, setIslandStatus] = useState<Record<string, IslandStatus> | null>(null);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      email: "",
      contactNumber: "",
      firstName: "",
      middleName: "",
      lastName: "",
      suffix: "",
      university: undefined,
      universityOther: "",
      course: undefined,
      scholarshipType: undefined,
      yearAwarded: undefined,
      hasAttendedGA: false,
      hasDostSa: false,
      dietaryRestrictions: "",
      preferredDate: undefined,
      island: undefined,
      isStartMember: false,
      whyJoin: "",
      agreeToDataPrivacy: false,
    },
    mode: "onBlur",
  });

  const formErrors = form.formState.errors;
  const hasFormErrors = Object.keys(formErrors).length > 0;

  // Fetch island registration status on mount
  useEffect(() => {
    async function fetchIslandStatus() {
      try {
        const status = await getIslandRegistrationStatus();
        setIslandStatus(status);
      } catch (error) {
        console.error("Failed to fetch island status:", error);
      }
    }
    fetchIslandStatus();
  }, []);

  useEffect(() => {
    if (hasFormErrors) {
      // Focus on the first error field, or the registration form title if no specific field error
      const firstErrorField = document.querySelector(".text-destructive");
      const registrationFormTitle = document.getElementById(
        "registration-form-title"
      );

      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (registrationFormTitle) {
        registrationFormTitle.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    }
  }, [hasFormErrors]);

  const onSubmit = async (data: RegistrationFormData) => {
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const result = await submitRegistration(data);
      setSubmitMessage(result);

      if (result.success) {
        form.reset();
        if (result.redirectUrl) {
          setTimeout(() => {
            router.push(result.redirectUrl as string);
          }, 1500);
        }
      } else if (result.errors) {
        Object.entries(result.errors).forEach(([field, error]) => {
          if (
            field !== "formErrors" &&
            error &&
            typeof error === "object" &&
            "_errors" in error &&
            Array.isArray(error._errors) &&
            error._errors.length > 0
          ) {
            form.setError(field as FormFieldName, {
              type: "server",
              message: error._errors[0],
            });
          } else if (Array.isArray(error) && error.length > 0) {
            form.setError(field as FormFieldName, {
              type: "server",
              message: error[0],
            });
          }
        });

        // Focus on the registration form and scroll to the first error
        const registrationFormTitle = document.getElementById(
          "registration-form-title"
        );
        const firstErrorField = document.querySelector(".text-destructive");

        if (firstErrorField) {
          // Scroll to the first error field
          firstErrorField.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        } else if (registrationFormTitle) {
          // Scroll to the top of the registration form
          registrationFormTitle.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      } else {
        // For general errors, scroll to the top of the registration form
        const registrationFormTitle = document.getElementById(
          "registration-form-title"
        );
        if (registrationFormTitle) {
          registrationFormTitle.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }
    } catch {
      setSubmitMessage({
        success: false,
        message: "An unexpected error occurred. Please try again later.",
      });

      // Focus on the registration form title for unexpected errors
      const registrationFormTitle = document.getElementById(
        "registration-form-title"
      );
      if (registrationFormTitle) {
        registrationFormTitle.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="registration-form"
      className="bg-white py-16 px-4"
    >
      <div className="max-w-2xl mx-auto relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 overflow-hidden">
        <div className="relative">
          <h2
            id="registration-form-title"
            className="text-3xl sm:text-4xl font-bold mb-2 text-center text-[#0f9dfe]"
          >
            Registration Form
          </h2>
          <p className="text-center text-gray-600 mb-8">
            KickSTART 2026 • START-DOST General Assembly
          </p>

          {submitMessage && (
            <div
              id="error-summary"
              className={cn(
                "mb-6 p-4 rounded-xl border",
                submitMessage.success
                  ? "bg-green-50 text-green-800 border-green-200"
                  : "bg-red-50 text-red-800 border-red-200"
              )}
            >
              <p className="font-medium">{submitMessage.message}</p>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* First Name */}
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">
                    First Name *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="First name" 
                      {...field}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#0f9dfe]/50 focus:ring-[#0f9dfe]/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Middle Name */}
            <FormField
              control={form.control}
              name="middleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">
                    Middle Name (optional)
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="Middle name" 
                      {...field}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#0f9dfe]/50 focus:ring-[#0f9dfe]/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last Name */}
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">
                    Last Name *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="Last name" 
                      {...field}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#0f9dfe]/50 focus:ring-[#0f9dfe]/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Suffix */}
            <FormField
              control={form.control}
              name="suffix"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">
                    Suffix (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g., Jr., III"
                      {...field}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#0f9dfe]/50 focus:ring-[#0f9dfe]/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">
                    Email *
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Email address"
                      {...field}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#0f9dfe]/50 focus:ring-[#0f9dfe]/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Number */}
            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">
                    Contact Number *
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="tel" 
                      placeholder="Contact number" 
                      {...field}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#0f9dfe]/50 focus:ring-[#0f9dfe]/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* School / University */}
            <FormField
              control={form.control}
              name="university"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">
                    School / University *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-[#0f9dfe]/50 focus:ring-[#0f9dfe]/20">
                        <SelectValue placeholder="Select your school/university" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-72 bg-white border-gray-200">
                      {UNIVERSITY_OPTIONS.map((u) => (
                        <SelectItem key={u} value={u} className="text-gray-900 hover:bg-[#0f9dfe]/10">
                          {u}
                        </SelectItem>
                      ))}
                      <SelectItem value={OTHER_UNIVERSITY_LABEL} className="text-gray-900 hover:bg-[#0f9dfe]/10">
                        {OTHER_UNIVERSITY_LABEL}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Specify if Other University - Only show when "Other" is selected */}
            {form.watch("university") === OTHER_UNIVERSITY_LABEL && (
              <FormField
                control={form.control}
                name="universityOther"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">
                      If Other, please specify
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="text" 
                        placeholder="Your school/university" 
                        {...field}
                        className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#0f9dfe]/50 focus:ring-[#0f9dfe]/20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Course */}
            <FormField
              control={form.control}
              name="course"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">
                    Course *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-[#0f9dfe]/50 focus:ring-[#0f9dfe]/20">
                        <SelectValue placeholder="Select your course" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-72 bg-white border-gray-200">
                      {COURSE_OPTIONS.map((course) => (
                        <SelectItem key={course} value={course} className="text-gray-900 hover:bg-[#0f9dfe]/10">
                          {course}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scholarship Type */}
            <FormField
              control={form.control}
              name="scholarshipType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">
                    Scholarship Type *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-[#0f9dfe]/50 focus:ring-[#0f9dfe]/20">
                        <SelectValue placeholder="Select scholarship type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-gray-200">
                      {SCHOLARSHIP_OPTIONS.map((type) => (
                        <SelectItem key={type} value={type} className="text-gray-900 hover:bg-[#0f9dfe]/10">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Scholarship Year/Batch */}
            <FormField
              control={form.control}
              name="yearAwarded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">
                    Scholarship Year/Batch *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-[#0f9dfe]/50 focus:ring-[#0f9dfe]/20">
                        <SelectValue placeholder="Select scholarship year/batch" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-gray-200">
                      {YEAR_AWARDED_OPTIONS.map((year) => (
                        <SelectItem key={year} value={year} className="text-gray-900 hover:bg-[#0f9dfe]/10">
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Island */}
            <FormField
              control={form.control}
              name="island"
              render={({ field }) => {
                const isIslandDisabled = (island: string) => {
                  if (!islandStatus) return false;
                  const status = islandStatus[island];
                  return status ? (status.isClosed || status.isFull) : false;
                };

                return (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-semibold">
                      Island (for slot allocation)
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-[#0f9dfe]/50 focus:ring-[#0f9dfe]/20">
                          <SelectValue placeholder="Select island" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white border-gray-200">
                        {ISLAND_OPTIONS.map((island) => {
                          const disabled = isIslandDisabled(island);
                          const status = islandStatus?.[island];
                          const displayText = disabled && status
                            ? `${island} (Full - ${status.currentCount}/150)`
                            : island;

                          return (
                            <SelectItem
                              key={island}
                              value={island}
                              disabled={disabled}
                              className={`${
                                disabled
                                  ? "text-gray-400 cursor-not-allowed opacity-50"
                                  : "text-gray-900 hover:bg-[#0f9dfe]/10"
                              }`}
                            >
                              {displayText}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    {islandStatus && field.value && islandStatus[field.value] && (
                      <p className="text-sm text-gray-600 mt-1">
                        {islandStatus[field.value].currentCount} / 150 participants registered
                      </p>
                    )}
                  </FormItem>
                );
              }}
            />

            {/* Past General Assembly attendance */}
            <FormField
              control={form.control}
              name="hasAttendedGA"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                      className="border-gray-300 data-[state=checked]:bg-[#0f9dfe] data-[state=checked]:border-[#0f9dfe]"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-gray-700 font-semibold">
                      Have you attended a past General Assembly?
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Has DOST-SA */}
            <FormField
              control={form.control}
              name="hasDostSa"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                      className="border-gray-300 data-[state=checked]:bg-[#0f9dfe] data-[state=checked]:border-[#0f9dfe]"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-gray-700 font-semibold">
                      Are you currently assigned a DOST-SA?
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* START Member */}
            <FormField
              control={form.control}
              name="isStartMember"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value || false}
                      onCheckedChange={(checked) => field.onChange(!!checked)}
                      className="border-gray-300 data-[state=checked]:bg-[#0f9dfe] data-[state=checked]:border-[#0f9dfe]"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-gray-700 font-semibold">
                      START Member
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {/* Dietary Restrictions / Food Preferences */}
            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">
                    Dietary Restrictions / Food Preferences (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="e.g., vegetarian, no peanuts"
                      {...field}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#0f9dfe]/50 focus:ring-[#0f9dfe]/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Why Join */}
            <FormField
              control={form.control}
              name="whyJoin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">
                    Why do you want to join? (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Short reason (used when prioritizing limited slots)"
                      {...field}
                      className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#0f9dfe]/50 focus:ring-[#0f9dfe]/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preferred Date */}
            <FormField
              control={form.control}
              name="preferredDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-semibold">
                    Preferred Date *
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-[#0f9dfe]/50 focus:ring-[#0f9dfe]/20">
                        <SelectValue placeholder="Select date (December 13 or 14)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white border-gray-200">
                      <SelectItem value="December 13" className="text-gray-900 hover:bg-[#0f9dfe]/10">December 13</SelectItem>
                      <SelectItem value="December 14" className="text-gray-900 hover:bg-[#0f9dfe]/10">December 14</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Consent */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Consent
              </h3>

              {/* Data Privacy Policy Confirmation */}
              <FormField
                control={form.control}
                name="agreeToDataPrivacy"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value || false}
                        onCheckedChange={(checked) =>
                          field.onChange(checked || false)
                        }
                        className="border-gray-300 data-[state=checked]:bg-[#0f9dfe] data-[state=checked]:border-[#0f9dfe] cursor-pointer"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-gray-700 font-semibold text-sm leading-relaxed">
                        <span>
                          I have read and agree to the{" "}
                          <DataPrivacyDialog
                            onAgree={() => field.onChange(true)}
                          >
                            <button
                              type="button"
                              className="text-[#0f9dfe] hover:opacity-90 underline font-semibold inline cursor-pointer"
                            >
                              Data Privacy Policy
                            </button>
                          </DataPrivacyDialog>
                          . *
                        </span>
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* In-Person Event Warning */}
            <div className="bg-[#fcea3f]/30 border-l-4 border-[#fcea3f] p-4 rounded-xl mb-4">
              <p className="text-gray-900 font-medium">
                Note: This event is{" "}
                <span className="font-bold">in-person only</span>. Please ensure
                you are able to physically attend.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <Button
                type="submit"
                size="lg"
                className="w-full font-bold text-lg px-8 py-4 bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Registration"}
              </Button>
            </div>
          </form>
        </Form>
        </div>
      </div>
    </section>
  );
}
