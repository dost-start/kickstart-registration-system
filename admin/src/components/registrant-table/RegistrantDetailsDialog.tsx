"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FormEntry, FormEntryUpdate } from "@/types/form-entries";
import { getStatusBadgeVariant } from "@/lib/table-actions";
import { updateRegistrantInfo } from "@/lib/data";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import { generateEventUid } from "@/lib/event-pass";
import { generateQRCodeDataURL } from "@/lib/qr-code";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { addRegistrantSchema } from "@/schemas/addRegistrantSchema";
import {
  YEAR_AWARDED_OPTIONS,
  UNIVERSITY_OPTIONS,
  SCHOLARSHIP_OPTIONS,
  OTHER_UNIVERSITY_LABEL,
  ISLAND_OPTIONS,
} from "@/types/types";
import {
  Pencil,
  X,
  Check,
  QrCode,
  RefreshCw,
  Copy,
  Download,
  AlertCircle,
  CheckCircle2,
  Ticket,
} from "lucide-react";

type EditRegistrantFormData = z.infer<typeof addRegistrantSchema>;

interface RegistrantDetailsDialogProps {
  registrant: FormEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: () => void;
}

interface EventPassSectionProps {
  registrant: FormEntry;
  onUpdate?: () => void;
}

function EventPassSection({ registrant, onUpdate }: EventPassSectionProps) {
  const [seatValue, setSeatValue] = useState(registrant.seat_assignment || "");
  const [isSeatSaving, setIsSeatSaving] = useState(false);
  const [seatMessage, setSeatMessage] = useState<string | null>(null);
  const [seatError, setSeatError] = useState<string | null>(null);
  const [isGeneratingUid, setIsGeneratingUid] = useState(false);
  const [uidMessage, setUidMessage] = useState<string | null>(null);
  const [uidError, setUidError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [qrPreviewUrl, setQrPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setSeatValue(registrant.seat_assignment || "");
    setSeatMessage(null);
    setSeatError(null);
  }, [registrant.id, registrant.seat_assignment]);

  useEffect(() => {
    setUidMessage(null);
    setUidError(null);
    setCopied(false);
  }, [registrant.event_uid]);

  // Generate QR code using the same method as emails (ensures consistency)
  useEffect(() => {
    if (registrant.event_uid) {
      const eventUid = registrant.event_uid; // Store in const to satisfy TypeScript
      generateQRCodeDataURL(eventUid)
        .then((dataUrl) => {
          setQrPreviewUrl(dataUrl);
        })
        .catch((err) => {
          console.error("Failed to generate QR code preview:", err);
          // Fallback to external API if local generation fails
          setQrPreviewUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=480x480&data=${encodeURIComponent(
              eventUid
            )}`
          );
        });
    } else {
      setQrPreviewUrl(null);
    }
  }, [registrant.event_uid]);

  const handleGenerateUid = async () => {
    setUidError(null);
    setUidMessage(null);
    setIsGeneratingUid(true);

    const supabase = createSupabaseClient();

    try {
      for (let attempt = 0; attempt < 8; attempt++) {
        const candidate = generateEventUid({
          familyName: registrant.last_name || registrant.first_name || undefined,
        });

        const { data: existing, error: lookupError } = await supabase
          .from("kickstart_form_entries")
          .select("id")
          .eq("event_uid", candidate)
          .maybeSingle();

        if (lookupError && lookupError.code !== "PGRST116") {
          throw lookupError;
        }

        if (!existing) {
          const { error: updateError } = await supabase
            .from("kickstart_form_entries")
            .update({ event_uid: candidate })
            .eq("id", registrant.id);

          if (updateError) {
            throw updateError;
          }

          setUidMessage(`Generated UID ${candidate.toUpperCase()}`);
          setCopied(false);
          onUpdate?.();
          return;
        }
      }

      throw new Error("Unable to generate a unique UID. Please try again.");
    } catch (err) {
      setUidError(
        err instanceof Error ? err.message : "Failed to generate UID"
      );
    } finally {
      setIsGeneratingUid(false);
    }
  };

  const handleCopyUid = async () => {
    if (!registrant.event_uid) return;
    try {
      await navigator.clipboard.writeText(registrant.event_uid);
      setCopied(true);
      setUidError(null);
      setUidMessage("UID copied to clipboard");
    } catch (err) {
      setUidError(
        err instanceof Error ? err.message : "Failed to copy UID to clipboard"
      );
    }
  };

  const handleSeatSave = async (newValue: string) => {
    setSeatError(null);
    setSeatMessage(null);
    setIsSeatSaving(true);

    try {
      await updateRegistrantInfo(registrant.id, {
        seat_assignment: newValue.trim() ? newValue.trim() : null,
      });
      setSeatMessage(
        newValue.trim() ? "Seat assignment saved" : "Seat assignment cleared"
      );
      onUpdate?.();
    } catch (err) {
      setSeatError(
        err instanceof Error ? err.message : "Failed to update seat assignment"
      );
    } finally {
      setIsSeatSaving(false);
    }
  };

  const handleSeatSubmit = async () => {
    await handleSeatSave(seatValue);
  };

  const handleSeatClear = async () => {
    setSeatValue("");
    await handleSeatSave("");
  };

  return (
    <div className="space-y-4 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/20 via-slate-900/40 to-slate-900/60 p-5 shadow-inner">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-200">
          <QrCode className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-white/60">
            Event Pass
          </p>
          <h3 className="text-xl font-semibold text-white">
            QR & Check-in Controls
          </h3>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/60">
                  UID
                </p>
                <p className="font-mono text-lg text-white">
                  {registrant.event_uid || "Not generated"}
                </p>
                <p className="text-xs text-white/50">
                  Format: prefix-date-XXXX
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUid}
                  disabled={!registrant.event_uid}
                  className="border border-white/20 text-white hover:bg-white/10"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
                <Button
                  size="sm"
                  onClick={handleGenerateUid}
                  disabled={isGeneratingUid}
                  className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-orange-500/20 hover:from-orange-600 hover:to-yellow-600"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isGeneratingUid ? "animate-spin" : ""}`}
                  />
                  {registrant.event_uid ? "Regenerate" : "Generate"} UID
                </Button>
              </div>
            </div>
            {(uidMessage || uidError) && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                {uidError ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-300" />
                    <span className="text-red-200">{uidError}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span className="text-emerald-200">{uidMessage}</span>
                  </>
                )}
              </div>
            )}
            {copied && !uidError && (
              <p className="mt-1 text-xs text-emerald-200">
                Copied to clipboard
              </p>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2">
              <Ticket className="h-4 w-4 text-orange-200" />
              <p className="text-sm font-medium text-white">
                Seat Assignment
              </p>
            </div>
            <p className="text-xs text-white/60">
              Keep this synced with your seating plan (e.g., Simera A-12).
            </p>
            <div className="mt-3 flex flex-col gap-2 md:flex-row">
              <Input
                value={seatValue}
                onChange={(e) => setSeatValue(e.target.value)}
                placeholder="simera-dec13-001 • VIP Row 1 Seat 3"
                className="bg-slate-900/60 text-white"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSeatSubmit}
                  disabled={isSeatSaving}
                  className="bg-white/10 text-white hover:bg-white/20"
                >
                  {isSeatSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  Save
                </Button>
                {registrant.seat_assignment && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="border border-white/20 text-white hover:bg-white/10"
                    onClick={handleSeatClear}
                    disabled={isSeatSaving}
                  >
                    <X className="h-4 w-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
            {(seatMessage || seatError) && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                {seatError ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-300" />
                    <span className="text-red-200">{seatError}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span className="text-emerald-200">{seatMessage}</span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-white/10 bg-black/30 p-4">
          {qrPreviewUrl ? (
            <>
              <img
                src={qrPreviewUrl}
                alt={`QR code for ${registrant.event_uid}`}
                className="w-full max-w-[220px] rounded-lg border border-white/10 bg-white p-2 shadow-lg"
              />
              <Button
                asChild
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600"
              >
                <a
                  href={qrPreviewUrl || undefined}
                  download={registrant.event_uid ? `qr-code-${registrant.event_uid}.png` : undefined}
                >
                  <Download className="h-4 w-4" />
                  Download QR
                </a>
              </Button>
              <p className="text-center text-xs text-white/60">
                QR code matches the one sent in emails for consistency.
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full border border-dashed border-white/20">
                <QrCode className="h-10 w-10 text-white/40" />
              </div>
              <p className="text-sm text-white/70">
                Generate a UID to preview and download the QR code.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function RegistrantDetailsDialog({
  registrant,
  open,
  onOpenChange,
  onUpdate,
}: RegistrantDetailsDialogProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine if university is "Other"
  const isOtherUniversity = !UNIVERSITY_OPTIONS.includes(
    registrant.university as (typeof UNIVERSITY_OPTIONS)[number]
  );

  const form = useForm<EditRegistrantFormData>({
    resolver: zodResolver(addRegistrantSchema),
    defaultValues: {
      first_name: registrant.first_name || "",
      middle_name: registrant.middle_name || "",
      last_name: registrant.last_name || "",
      suffix: registrant.suffix || "",
      email: registrant.email || "",
      contact_number: registrant.contact_number || "",
      spas_id: registrant.spas_id || "",
      university: isOtherUniversity
        ? OTHER_UNIVERSITY_LABEL
        : (registrant.university as (typeof UNIVERSITY_OPTIONS)[number]),
      university_other: isOtherUniversity ? registrant.university : "",
      course: registrant.course || "",
      scholarship_type: registrant.scholarship_type as (typeof SCHOLARSHIP_OPTIONS)[number],
      year_awarded: registrant.year_awarded as (typeof YEAR_AWARDED_OPTIONS)[number],
      status: registrant.status,
      is_checked_in: registrant.is_checked_in || false,
      has_attended_ga: registrant.has_attended_ga || false,
      has_dost_sa: registrant.has_dost_sa || false,
      dietary_restrictions: registrant.dietary_restrictions || "",
      island: registrant.island || undefined,
      is_start_member: registrant.is_start_member || false,
      why_join: registrant.why_join || "",
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleEdit = () => {
    setIsEditMode(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setError(null);
    form.reset();
  };

  const handleSubmit = async (data: EditRegistrantFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      // Prepare update data
      const updateData: FormEntryUpdate = {
        first_name: data.first_name,
        last_name: data.last_name,
        middle_name: data.middle_name || null,
        suffix: data.suffix || null,
        email: data.email || null,
        contact_number: data.contact_number,
        spas_id: data.spas_id?.trim() || null,
        university:
          data.university === OTHER_UNIVERSITY_LABEL
            ? (data.university_other || "")
            : (data.university || ""),
        university_custom:
          data.university === OTHER_UNIVERSITY_LABEL
            ? data.university_other || null
            : null,
        course: data.course,
        scholarship_type: data.scholarship_type as FormEntryUpdate["scholarship_type"],
        year_awarded: data.year_awarded || null,
        status: data.status,
        is_checked_in: data.is_checked_in,
        has_attended_ga: data.has_attended_ga || false,
        has_dost_sa: data.has_dost_sa || false,
        dietary_restrictions: data.dietary_restrictions || null,
        island: data.island || null,
        is_start_member: data.is_start_member || false,
        why_join: data.why_join?.trim() ? data.why_join.trim() : null,
      };

      await updateRegistrantInfo(registrant.id, updateData);

      setIsEditMode(false);
      if (onUpdate) {
        onUpdate();
      }
    } catch (err) {
      console.error("Error updating registrant:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update registrant"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Registrant Details</DialogTitle>
              <DialogDescription>
                {isEditMode
                  ? "Edit registrant information"
                  : `Complete information for ${registrant.first_name} ${registrant.last_name}`}
              </DialogDescription>
            </div>
            {!isEditMode && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEdit}
                className="ml-4"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        {error && (
          <div className="p-4 text-sm text-red-800 bg-red-50 border border-red-200 rounded-lg dark:text-red-200 dark:bg-red-900/20 dark:border-red-800">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <EventPassSection registrant={registrant} onUpdate={onUpdate} />
        </div>

        {isEditMode ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  Personal Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
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
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
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
                        <FormLabel>Middle Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
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
                        <FormLabel>Suffix</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          disabled={isLoading}
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
                      <FormLabel>Contact Number *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
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
                      <FormLabel>SPAS ID *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="DOST-SEI SPAS ID" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  Academic Information
                </h3>

                <FormField
                  control={form.control}
                  name="university"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>University *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select university" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-72">
                          {UNIVERSITY_OPTIONS.map((university: string) => (
                            <SelectItem key={university} value={university}>
                              {university}
                            </SelectItem>
                          ))}
                          <SelectItem value={OTHER_UNIVERSITY_LABEL}>
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
                        <FormLabel>University Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={isLoading}
                            placeholder="Enter university name"
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
                      <FormLabel>Course *</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
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
                        <FormLabel>Scholarship Type *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select scholarship type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SCHOLARSHIP_OPTIONS.map((type: string) => (
                              <SelectItem key={type} value={type}>
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
                        <FormLabel>Year Awarded *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {YEAR_AWARDED_OPTIONS.map((year) => (
                              <SelectItem key={year} value={year}>
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
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  Event Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="island"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Island</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select island" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {ISLAND_OPTIONS.map((island) => (
                              <SelectItem key={island} value={island}>
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
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Has Attended GA</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="has_dost_sa"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Has DOST-SA</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_start_member"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>START Member</FormLabel>
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
                      <FormLabel>Dietary Restrictions</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={isLoading}
                          placeholder="Enter any dietary restrictions or allergies..."
                          rows={3}
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
                      <FormLabel>Why do you want to join?</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          disabled={isLoading}
                          placeholder="Share your motivation for joining this event (helpful for prioritizing limited slots)..."
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Registration Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">
                  Registration Status
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="accepted">Accepted</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="waitlisted">
                              Waitlisted
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="is_checked_in"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Checked In</FormLabel>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Registration Date
                    </label>
                    <p className="text-sm">
                      {formatDate(registrant.created_at)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Registrant ID
                    </label>
                    <p className="text-sm">#{registrant.id}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  <Check className="w-4 h-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="grid gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </label>
                  <p className="text-sm">
                    {[
                      registrant.first_name,
                      registrant.middle_name,
                      registrant.last_name,
                      registrant.suffix,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Email
                  </label>
                  <div>
                    {registrant.email ? (
                      <a
                        href={`mailto:${registrant.email}`}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {registrant.email}
                      </a>
                    ) : (
                      <p className="text-sm">Not provided</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Contact Number
                  </label>
                  <p className="text-sm">
                    {registrant.contact_number || "Not provided"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    SPAS ID
                  </label>
                  <p className="text-sm font-mono">
                    {registrant.spas_id || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Academic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    University
                  </label>
                  <p className="text-sm">{registrant.university}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Course
                  </label>
                  <p className="text-sm">{registrant.course}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Scholarship Type
                  </label>
                  <p className="text-sm">{registrant.scholarship_type}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Year Awarded
                  </label>
                  <p className="text-sm">
                    {registrant.year_awarded || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            {/* Event Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Event Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Preferred Date
                  </label>
                  <p className="text-sm">
                    {registrant.preferred_date || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Has Attended GA
                  </label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        registrant.has_attended_ga ? "default" : "secondary"
                      }
                    >
                      {registrant.has_attended_ga ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Has DOST-SA
                  </label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={registrant.has_dost_sa ? "default" : "secondary"}
                    >
                      {registrant.has_dost_sa ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Island
                  </label>
                  <p className="text-sm">
                    {registrant.island || "Not specified"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    START Member
                  </label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={registrant.is_start_member ? "default" : "secondary"}
                    >
                      {registrant.is_start_member ? "Yes" : "No"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Dietary Restrictions
                  </label>
                  <p className="text-sm">
                    {registrant.dietary_restrictions || "None"}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Why do you want to join?
                  </label>
                  <p className="text-sm whitespace-pre-wrap">
                    {registrant.why_join || "Not provided"}
                  </p>
                </div>
              </div>
            </div>

            {/* Registration Status */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Registration Status
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Status
                  </label>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusBadgeVariant(registrant.status)}>
                      {registrant.status.charAt(0).toUpperCase() +
                        registrant.status.slice(1)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Check-in Status
                  </label>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        registrant.is_checked_in ? "default" : "secondary"
                      }
                    >
                      {registrant.is_checked_in
                        ? "Checked In"
                        : "Not Checked In"}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Registration Date
                  </label>
                  <p className="text-sm">{formatDate(registrant.created_at)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Registrant ID
                  </label>
                  <p className="text-sm">#{registrant.id}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
