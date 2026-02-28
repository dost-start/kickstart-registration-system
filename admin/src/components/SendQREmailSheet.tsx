"use client";

import { useState, useMemo } from "react";
import { QrCode, Send, Loader2, Users, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FormEntry } from "@/types/form-entries";
import { sendQREmails } from "@/app/actions/send-qr-emails";

interface SendQREmailSheetProps {
  participants: FormEntry[];
  onSent: () => void;
}

const ISLAND_OPTIONS = ["all", "Luzon", "Visayas", "Mindanao"] as const;

export function SendQREmailSheet({ participants, onSent }: SendQREmailSheetProps) {
  const [open, setOpen] = useState(false);
  const [islandFilter, setIslandFilter] = useState<string>("all");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{
    sent: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);

  // Only accepted participants with email and event_uid
  const eligibleParticipants = useMemo(() => {
    return participants.filter((p) => {
      if (p.status !== "accepted") return false;
      if (!p.email || !p.event_uid) return false;
      if (islandFilter !== "all" && p.island !== islandFilter) return false;
      return true;
    });
  }, [participants, islandFilter]);

  // Count accepted per island for quick reference
  const islandCounts = useMemo(() => {
    const accepted = participants.filter(
      (p) => p.status === "accepted" && p.email && p.event_uid
    );
    const counts: Record<string, number> = {};
    for (const p of accepted) {
      const island = p.island || "Unspecified";
      counts[island] = (counts[island] || 0) + 1;
    }
    return counts;
  }, [participants]);

  const handleSend = async () => {
    const ids = eligibleParticipants.map((p) => p.id);
    if (ids.length === 0) return;

    try {
      setIsSending(true);
      setResult(null);
      const res = await sendQREmails(ids);
      setResult({ sent: res.sent, failed: res.failed, errors: res.errors });
      setShowConfirm(false);
      if (res.sent > 0) onSent();
    } catch (error) {
      console.error("QR email send failed:", error);
      setResult({
        sent: 0,
        failed: ids.length,
        errors: [{ email: "N/A", error: error instanceof Error ? error.message : "Unknown error" }],
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleReset = () => {
    setIslandFilter("all");
    setResult(null);
    setShowConfirm(false);
    setShowRecipients(false);
  };

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setResult(null); setShowConfirm(false); setShowRecipients(false); } }}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="px-3 sm:px-4 py-2 font-bold border-2 border-[#0f9dfe] text-[#0f9dfe] hover:bg-[#0f9dfe]/10 hover:border-[#0d8ae8] transition-all duration-300 rounded-full text-xs sm:text-sm"
        >
          <QrCode className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Send QR Emails</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-white sm:max-w-lg w-full overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="text-gray-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#0f9dfe]" />
            Send QR Code Emails
          </SheetTitle>
          <SheetDescription className="text-gray-600">
            Send check-in QR code emails to accepted participants. Filter by island to send to a specific group.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 py-4">
          {/* Island Filter */}
          <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">Filter by Island</Label>
              <Select value={islandFilter} onValueChange={setIslandFilter}>
                <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {ISLAND_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt} className="text-gray-900">
                      {opt === "all"
                        ? `All Islands (${Object.values(islandCounts).reduce((a, b) => a + b, 0)})`
                        : `${opt} (${islandCounts[opt] || 0})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Recipient count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  <strong>{eligibleParticipants.length}</strong> accepted recipient{eligibleParticipants.length !== 1 ? "s" : ""}
                </span>
              </div>
              {eligibleParticipants.length === 0 && (
                <Badge className="bg-red-100 text-red-700 border border-red-300 text-xs">
                  No matches
                </Badge>
              )}
            </div>

            {/* Recipient preview */}
            {eligibleParticipants.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowRecipients(!showRecipients)}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors py-1"
                >
                  {showRecipients ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showRecipients ? "Hide" : "Preview"} recipients ({eligibleParticipants.length})
                </button>
                {showRecipients && (
                  <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                    <div className="space-y-0.5 p-2">
                      {eligibleParticipants.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-gray-50"
                        >
                          <div className="truncate max-w-[200px]">
                            <span className="text-gray-900 font-medium">{p.first_name} {p.last_name}</span>
                            <span className="text-gray-500 ml-1.5">{p.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            {p.island && (
                              <Badge className="bg-[#0f9dfe]/10 text-[#0f9dfe] border border-[#0f9dfe]/30 text-[10px] px-1.5 py-0">
                                {p.island}
                              </Badge>
                            )}
                            <Badge className="bg-green-100 text-green-700 border border-green-300 text-[10px] px-1.5 py-0">
                              {p.event_uid}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Info box */}
          <div className="rounded-xl border border-[#0f9dfe]/30 bg-[#0f9dfe]/5 p-4">
            <p className="text-xs text-gray-700">
              This will send an email with the participant&apos;s <strong>QR code</strong>, <strong>event details</strong>,
              {" "}and <strong>Apple Wallet pass</strong> (if configured) to each accepted registrant.
              {islandFilter !== "all" && (
                <> Only <strong>{islandFilter}</strong> participants will receive the email.</>
              )}
            </p>
          </div>

          {/* Result */}
          {result && (
            <div
              className={`rounded-xl border p-4 ${
                result.failed === 0
                  ? "border-green-300 bg-green-50"
                  : result.sent === 0
                  ? "border-red-300 bg-red-50"
                  : "border-yellow-300 bg-yellow-50"
              }`}
            >
              <p className="text-sm font-medium text-gray-900">
                ✅ Sent: {result.sent} &nbsp;|&nbsp; ❌ Failed: {result.failed}
              </p>
              {result.errors.length > 0 && (
                <div className="mt-2 space-y-1">
                  {result.errors.slice(0, 5).map((err, i) => (
                    <p key={i} className="text-xs text-red-600">
                      {err.email}: {err.error}
                    </p>
                  ))}
                  {result.errors.length > 5 && (
                    <p className="text-xs text-red-500">
                      ...and {result.errors.length - 5} more errors
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Confirm */}
          {showConfirm && (
            <div className="rounded-xl border border-orange-300 bg-orange-50 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-orange-800">
                    Confirm Send QR Emails
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    You are about to send QR code emails to{" "}
                    <strong>{eligibleParticipants.length}</strong>{" "}
                    {islandFilter !== "all" ? `${islandFilter} ` : ""}accepted participant
                    {eligibleParticipants.length !== 1 ? "s" : ""}. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={isSending}
                  className="bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white rounded-full"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
                  ) : (
                    <Send className="w-4 h-4 mr-1.5" />
                  )}
                  {isSending ? "Sending..." : "Yes, Send Now"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowConfirm(false)}
                  disabled={isSending}
                  className="border-gray-300 text-gray-700 rounded-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="flex gap-2 px-6 py-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSending}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full"
          >
            Reset
          </Button>
          <Button
            onClick={() => setShowConfirm(true)}
            disabled={eligibleParticipants.length === 0 || isSending}
            className="bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white rounded-full"
          >
            <Send className="w-4 h-4 mr-1.5" />
            Send to {eligibleParticipants.length} recipient{eligibleParticipants.length !== 1 ? "s" : ""}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

