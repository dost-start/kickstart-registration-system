import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";
import { FormEntryInsert } from "@/types/form-entries";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";
import { addRegistrantSchema } from "@/schemas/addRegistrantSchema";
import { YEAR_AWARDED_OPTIONS, UNIVERSITY_OPTIONS, SCHOLARSHIP_OPTIONS, OTHER_UNIVERSITY_LABEL, ISLAND_OPTIONS } from "@/types/types";

type AddRegistrantFormData = z.infer<typeof addRegistrantSchema>;

interface AddRegistrantDialogProps {
  onRegistrantAdded: () => void;
}

export function AddRegistrantSheet({
  onRegistrantAdded,
}: AddRegistrantDialogProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<AddRegistrantFormData>({
    resolver: zodResolver(addRegistrantSchema),
    defaultValues: {
      first_name: "",
      middle_name: "",
      last_name: "",
      suffix: "",
      email: "",
      contact_number: "",
      spas_id: "",
      university: undefined,
      university_other: "",
      course: "",
      scholarship_type: undefined,
      year_awarded: undefined,
      status: "pending",
      is_checked_in: false,
      has_attended_ga: false,
      has_dost_sa: false,
      dietary_restrictions: "",
      seat_assignment: "",
      event_uid: "",
      island: undefined,
      is_start_member: false,
      why_join: "",
    },
  });

  const handleSubmit = async (data: AddRegistrantFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      // Check if email already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("kickstart_form_entries")
        .select("email")
        .eq("email", data.email)
        .single();

      if (checkError && checkError.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is what we want
        throw checkError;
      }

      if (existingUser) {
        throw new Error("A registrant with this email address already exists");
      }

      // Check if island registration is closed
      if (data.island) {
        const { getIslandRegistrationStatus, getIslandCounts } = await import("@/lib/data");
        const islandStatus = await getIslandRegistrationStatus();
        const islandCounts = await getIslandCounts();
        
        if (islandStatus[data.island]) {
          throw new Error(`Registration for ${data.island} is currently closed. The limit of 150 participants has been reached.`);
        }
        
        // Also check if we're at the limit (double-check)
        const currentCount = islandCounts[data.island] || 0;
        if (currentCount >= 150) {
          throw new Error(`Registration for ${data.island} is full. The limit of 150 participants has been reached (current: ${currentCount}).`);
        }
      }

      // Convert form data to match FormEntryInsert type
      const insertData: FormEntryInsert = {
        first_name: data.first_name,
        last_name: data.last_name,
        middle_name: data.middle_name || null,
        suffix: data.suffix || null,
        email: data.email || null,
        contact_number: data.contact_number,
        spas_id: data.spas_id.trim(),
        university: data.university === OTHER_UNIVERSITY_LABEL ? (data.university_other || "") : (data.university || ""),
        university_custom: data.university === OTHER_UNIVERSITY_LABEL ? (data.university_other || null) : null,
        course: data.course,
        scholarship_type: data.scholarship_type,
        year_awarded: data.year_awarded || null,
        status: data.status,
        is_checked_in: data.is_checked_in,
        has_attended_ga: data.has_attended_ga || false,
        has_dost_sa: data.has_dost_sa || false,
        dietary_restrictions: data.dietary_restrictions || null,
        preferred_date: null,
        seat_assignment: data.seat_assignment?.trim() ? data.seat_assignment.trim() : null,
        event_uid: data.event_uid?.trim()
          ? data.event_uid.trim().toLowerCase()
          : null,
        island: data.island || null,
        is_start_member: data.is_start_member || false,
        why_join: data.why_join?.trim() ? data.why_join.trim() : null,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("kickstart_form_entries").insert(insertData);

      if (error) {
        throw error;
      }

      // Check if island registration should be automatically closed (150 limit)
      if (data.island) {
        const { checkAndCloseIslandRegistrations } = await import("@/lib/data");
        const closedIslands = await checkAndCloseIslandRegistrations();
        
        if (closedIslands.includes(data.island)) {
          // Show a notification that the island registration was closed
          setError(`Registration for ${data.island} has been automatically closed (reached 150 participants).`);
          // Don't close the form, let user see the message
          return;
        }
      }

      setOpen(false);
      form.reset({
        first_name: "",
        middle_name: "",
        last_name: "",
        suffix: "",
        email: "",
        contact_number: "",
        spas_id: "",
        university: undefined,
        university_other: "",
        course: "",
        scholarship_type: undefined,
        year_awarded: undefined,
        status: "pending",
        is_checked_in: false,
        has_attended_ga: false,
        has_dost_sa: false,
        dietary_restrictions: "",
        seat_assignment: "",
        event_uid: "",
        island: undefined,
        is_start_member: false,
        why_join: "",
      });
      onRegistrantAdded();
    } catch (err) {
      console.error("Error adding registrant:", err);
      setError(err instanceof Error ? err.message : "Failed to add registrant");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Add Registrant</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto p-4 w-full md:max-w-[600px] lg:max-w-[800px] bg-white dark:bg-slate-900">
         <SheetHeader>
           <SheetTitle className="text-2xl font-bold text-slate-800 dark:text-slate-100">
             Add New Registrant
           </SheetTitle>
           <SheetDescription className="text-slate-600 dark:text-slate-400">
             Add a new registrant to the National Technovation Summit 2025.
           </SheetDescription>
         </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 mt-6"
          >
             {error && (
               <div className="p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg dark:text-red-200 dark:bg-red-900/20 dark:border-red-800">
                 {error}
               </div>
             )}

             {/* Name Fields */}
             <div className="space-y-4">
               <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                 Personal Information
               </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                     <FormItem>
                       <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">First Name *</FormLabel>
                       <FormControl>
                         <Input 
                           {...field} 
                           disabled={isLoading}
                           className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="last_name"
                  render={({ field }) => (
                     <FormItem>
                       <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Last Name *</FormLabel>
                       <FormControl>
                         <Input 
                           {...field} 
                           disabled={isLoading}
                           className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="middle_name"
                  render={({ field }) => (
                     <FormItem>
                       <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Middle Name</FormLabel>
                       <FormControl>
                         <Input 
                           {...field} 
                           disabled={isLoading}
                           className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="suffix"
                  render={({ field }) => (
                     <FormItem>
                       <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Suffix</FormLabel>
                       <FormControl>
                         <Input 
                           {...field} 
                           disabled={isLoading}
                           className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                  )}
                />
              </div>
            </div>

             {/* Contact Information */}
             <div className="space-y-4">
               <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                 Contact Information
               </h3>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                   <FormItem>
                     <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Email *</FormLabel>
                     <FormControl>
                       <Input 
                         {...field} 
                         type="email" 
                         disabled={isLoading}
                         className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_number"
                render={({ field }) => (
                   <FormItem>
                     <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Contact Number *</FormLabel>
                     <FormControl>
                       <Input 
                         {...field} 
                         disabled={isLoading}
                         className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="spas_id"
                render={({ field }) => (
                   <FormItem>
                     <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">SPAS ID *</FormLabel>
                     <FormControl>
                       <Input 
                         {...field} 
                         placeholder="DOST-SEI SPAS ID"
                         disabled={isLoading}
                         className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                )}
              />
            </div>

             {/* Academic Information */}
             <div className="space-y-4">
               <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                 Academic Information
               </h3>

              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                   <FormItem>
                     <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">University *</FormLabel>
                     <Select onValueChange={field.onChange} value={field.value}>
                       <FormControl>
                         <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                           <SelectValue placeholder="Select university" />
                         </SelectTrigger>
                       </FormControl>
                       <SelectContent className="max-h-72 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                         {UNIVERSITY_OPTIONS.map((university: string) => (
                           <SelectItem key={university} value={university} className="text-slate-900 dark:text-slate-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                             {university}
                           </SelectItem>
                         ))}
                         <SelectItem value={OTHER_UNIVERSITY_LABEL} className="text-slate-900 dark:text-slate-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                           {OTHER_UNIVERSITY_LABEL}
                         </SelectItem>
                       </SelectContent>
                     </Select>
                     <FormMessage />
                   </FormItem>
                )}
              />

              {form.watch("university") === OTHER_UNIVERSITY_LABEL && (
                <FormField
                  control={form.control}
                  name="university_other"
                  render={({ field }) => (
                     <FormItem>
                       <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">University Name *</FormLabel>
                       <FormControl>
                         <Input 
                           {...field} 
                           disabled={isLoading}
                           placeholder="Enter university name"
                           className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                         />
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="course"
                render={({ field }) => (
                   <FormItem>
                     <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Course *</FormLabel>
                     <FormControl>
                       <Input 
                         {...field} 
                         disabled={isLoading}
                         className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="scholarship_type"
                  render={({ field }) => (
                     <FormItem>
                       <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Scholarship Type *</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                         <FormControl>
                           <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                             <SelectValue placeholder="Select scholarship type" />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                           {SCHOLARSHIP_OPTIONS.map((type: string) => (
                             <SelectItem key={type} value={type} className="text-slate-900 dark:text-slate-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                               {type}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       <FormMessage />
                     </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="year_awarded"
                  render={({ field }) => (
                     <FormItem>
                       <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Year Awarded *</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                         <FormControl>
                           <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                             <SelectValue placeholder="Select year" />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                           {YEAR_AWARDED_OPTIONS.map((year) => (
                             <SelectItem key={year} value={year} className="text-slate-900 dark:text-slate-100 hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                               {year}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       <FormMessage />
                     </FormItem>
                  )}
                />
              </div>
            </div>

             {/* Event Information */}
             <div className="space-y-4">
               <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2">
                 Event Information
               </h3>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="island"
                  render={({ field }) => (
                     <FormItem>
                       <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Island</FormLabel>
                       <Select onValueChange={field.onChange} value={field.value}>
                         <FormControl>
                           <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
                             <SelectValue placeholder="Select island" />
                           </SelectTrigger>
                         </FormControl>
                         <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                           {ISLAND_OPTIONS.map((island) => (
                             <SelectItem key={island} value={island} className="hover:bg-slate-50 dark:hover:bg-slate-700">
                               {island}
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                       <FormMessage />
                     </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="has_attended_ga"
                  render={({ field }) => (
                     <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-slate-300 dark:border-slate-600 p-4">
                       <FormControl>
                         <Checkbox
                           checked={field.value}
                           onCheckedChange={field.onChange}
                           className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                         />
                       </FormControl>
                       <div className="space-y-1 leading-none">
                         <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Has Attended GA *</FormLabel>
                       </div>
                     </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="has_dost_sa"
                  render={({ field }) => (
                     <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-slate-300 dark:border-slate-600 p-4">
                       <FormControl>
                         <Checkbox
                           checked={field.value}
                           onCheckedChange={field.onChange}
                           className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                         />
                       </FormControl>
                       <div className="space-y-1 leading-none">
                         <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Has DOST-SA *</FormLabel>
                       </div>
                     </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_start_member"
                  render={({ field }) => (
                     <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border border-slate-300 dark:border-slate-600 p-4">
                       <FormControl>
                         <Checkbox
                           checked={field.value}
                           onCheckedChange={field.onChange}
                           className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                         />
                       </FormControl>
                       <div className="space-y-1 leading-none">
                         <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">START Member *</FormLabel>
                       </div>
                     </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="dietary_restrictions"
                render={({ field }) => (
                   <FormItem>
                     <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Dietary Restrictions</FormLabel>
                     <FormControl>
                       <Textarea
                         {...field}
                         disabled={isLoading}
                         placeholder="Enter any dietary restrictions or allergies..."
                         rows={3}
                         className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="why_join"
                render={({ field }) => (
                   <FormItem>
                     <FormLabel className="font-semibold text-slate-700 dark:text-slate-300">Why do you want to join?</FormLabel>
                     <FormControl>
                       <Textarea
                         {...field}
                         disabled={isLoading}
                         placeholder="Share your motivation for joining this event (helpful for prioritizing limited slots)..."
                         rows={4}
                         className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                       />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                )}
              />
            </div>

             <SheetFooter className="border-t border-slate-200 dark:border-slate-700 pt-6 flex flex-row gap-3">
               <Button
                 type="button"
                 variant="outline"
                 onClick={() => setOpen(false)}
                 disabled={isLoading}
                 className="flex-1 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
               >
                 Cancel
               </Button>
               <Button 
                 type="submit" 
                 disabled={isLoading} 
                 className="flex-1 bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white"
               >
                 {isLoading ? "Adding..." : "Add Registrant"}
               </Button>
             </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
