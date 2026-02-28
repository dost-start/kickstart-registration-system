"use client";

import { useState, useMemo } from "react";
import { Mail, Send, Loader2, Users, Filter, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { sendCustomEmails } from "@/app/actions/send-custom-emails";

interface EmailBlastSheetProps {
  participants: FormEntry[];
}

const ISLAND_OPTIONS = ["all", "Luzon", "Visayas", "Mindanao"] as const;
const STATUS_OPTIONS = ["all", "accepted", "pending", "waitlisted", "rejected"] as const;
const CHECKIN_OPTIONS = ["all", "checked_in", "not_checked_in"] as const;

export function EmailBlastSheet({ participants }: EmailBlastSheetProps) {
  const [open, setOpen] = useState(false);
  const [islandFilter, setIslandFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [checkInFilter, setCheckInFilter] = useState<string>("all");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{
    sent: number;
    failed: number;
    errors: Array<{ email: string; error: string }>;
  } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showRecipients, setShowRecipients] = useState(false);

  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      if (islandFilter !== "all" && p.island !== islandFilter) return false;
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (checkInFilter === "checked_in" && !p.is_checked_in) return false;
      if (checkInFilter === "not_checked_in" && p.is_checked_in) return false;
      if (!p.email) return false;
      return true;
    });
  }, [participants, islandFilter, statusFilter, checkInFilter]);

  const handleSend = async () => {
    if (!subject.trim() || !body.trim()) return;

    const ids = filteredParticipants.map((p) => p.id);
    if (ids.length === 0) return;

    try {
      setIsSending(true);
      setResult(null);
      const res = await sendCustomEmails(ids, subject.trim(), body.trim());
      setResult({ sent: res.sent, failed: res.failed, errors: res.errors });
      setShowConfirm(false);
    } catch (error) {
      console.error("Email blast failed:", error);
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
    setStatusFilter("all");
    setCheckInFilter("all");
    setSubject("");
    setBody("");
    setResult(null);
    setShowConfirm(false);
    setShowRecipients(false);
  };

  const canSend = subject.trim() && body.trim() && filteredParticipants.length > 0 && !isSending;

  return (
    <Sheet open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setResult(null); setShowConfirm(false); setShowRecipients(false); } }}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="px-3 sm:px-4 py-2 font-bold border-2 border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400 transition-all duration-300 rounded-full text-xs sm:text-sm"
        >
          <Mail className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Email Blast</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-white sm:max-w-lg w-full overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-2">
          <SheetTitle className="text-gray-900 flex items-center gap-2">
            <Mail className="w-5 h-5 text-orange-500" />
            Email Blast
          </SheetTitle>
          <SheetDescription className="text-gray-600">
            Send a custom email to filtered recipients. Use placeholders like{" "}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{"{{first_name}}"}</code>,{" "}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{"{{name}}"}</code>,{" "}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{"{{island}}"}</code>,{" "}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{"{{university}}"}</code>,{" "}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{"{{event_uid}}"}</code>,{" "}
            <code className="text-xs bg-gray-100 px-1 py-0.5 rounded">{"{{status}}"}</code>.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 px-6 py-4">
          {/* Filters */}
          <div className="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Filter className="w-4 h-4" />
              Recipient Filters
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Island</Label>
                <Select value={islandFilter} onValueChange={setIslandFilter}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {ISLAND_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-gray-900 text-xs">
                        {opt === "all" ? "All Islands" : opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-gray-900 text-xs">
                        {opt === "all" ? "All Status" : opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-gray-600">Check-in</Label>
                <Select value={checkInFilter} onValueChange={setCheckInFilter}>
                  <SelectTrigger className="bg-white border-gray-300 text-gray-900 text-xs h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {CHECKIN_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="text-gray-900 text-xs">
                        {opt === "all" ? "All" : opt === "checked_in" ? "Checked In" : "Not Checked In"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Recipient count & preview */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  <strong>{filteredParticipants.length}</strong> recipient{filteredParticipants.length !== 1 ? "s" : ""}
                </span>
              </div>
              {filteredParticipants.length === 0 && (
                <Badge className="bg-red-100 text-red-700 border border-red-300 text-xs">
                  No matches
                </Badge>
              )}
            </div>

            {filteredParticipants.length > 0 && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowRecipients(!showRecipients)}
                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 transition-colors py-1"
                >
                  {showRecipients ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {showRecipients ? "Hide" : "Preview"} recipients ({filteredParticipants.length})
                </button>
                {showRecipients && (
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white">
                    <div className="space-y-0.5 p-2">
                      {filteredParticipants.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded hover:bg-gray-50"
                        >
                          <span className="text-gray-900 truncate max-w-[180px]">
                            {p.first_name} {p.last_name}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {p.island && (
                              <Badge className="bg-[#0f9dfe]/10 text-[#0f9dfe] border border-[#0f9dfe]/30 text-[10px] px-1.5 py-0">
                                {p.island}
                              </Badge>
                            )}
                            <Badge
                              className={`text-[10px] px-1.5 py-0 ${
                                p.status === "accepted"
                                  ? "bg-green-100 text-green-700 border border-green-300"
                                  : p.status === "pending"
                                  ? "bg-yellow-100 text-yellow-700 border border-yellow-300"
                                  : p.status === "waitlisted"
                                  ? "bg-purple-100 text-purple-700 border border-purple-300"
                                  : "bg-red-100 text-red-700 border border-red-300"
                              }`}
                            >
                              {p.status}
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

          {/* Email Composition */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email-subject" className="text-sm font-medium text-gray-700">
                Subject
              </Label>
              <Input
                id="email-subject"
                placeholder="e.g., Important Update for KickSTART {{island}} 2026"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email-body" className="text-sm font-medium text-gray-700">
                Body (HTML supported)
              </Label>
              <Textarea
                id="email-body"
                placeholder={`<h2 style="color: #0f9dfe;">Hello {{first_name}}!</h2>\n<p>We have an important update regarding KickSTART {{island}} 2026...</p>`}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 min-h-[200px] font-mono text-sm"
              />
            </div>
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

          {/* Confirm dialog */}
          {showConfirm && (
            <div className="rounded-xl border border-orange-300 bg-orange-50 p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-orange-800">
                    Confirm Email Blast
                  </p>
                  <p className="text-xs text-orange-700 mt-1">
                    You are about to send an email to{" "}
                    <strong>{filteredParticipants.length}</strong> recipient
                    {filteredParticipants.length !== 1 ? "s" : ""}. This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={isSending}
                  className="bg-orange-600 hover:bg-orange-700 text-white rounded-full"
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
            disabled={!canSend}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full"
          >
            <Send className="w-4 h-4 mr-1.5" />
            Send to {filteredParticipants.length} recipient{filteredParticipants.length !== 1 ? "s" : ""}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
