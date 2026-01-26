"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Mail, Loader2, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { sendQREmails, type EmailSendResult } from "@/app/actions/send-qr-emails";
import type { FormEntry } from "@/types/form-entries";

interface SendQREmailSheetProps {
  participants: FormEntry[];
  onSent?: () => void;
}

export function SendQREmailSheet({
  participants,
  onSent,
}: SendQREmailSheetProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailSendResult | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"accepted" | "all">("accepted");

  // Filter participants based on selection
  const filteredParticipants = selectedFilter === "accepted"
    ? participants.filter((p) => p.status === "accepted" && p.email && p.event_uid)
    : participants.filter((p) => p.email && p.event_uid);

  const handleSend = async () => {
    if (filteredParticipants.length === 0) {
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      console.log("🚀 Starting email send for", filteredParticipants.length, "participants");
      const participantIds = filteredParticipants.map((p) => p.id);
      const emailResult = await sendQREmails(participantIds);

      console.log("📊 Email send result:", emailResult);
      setResult(emailResult);
      
      // Update success status based on actual results
      if (emailResult.sent > 0) {
        // Mark as success if at least one email was sent
        emailResult.success = true;
        
        // Close sheet after a delay if successful
        setTimeout(() => {
          setOpen(false);
          onSent?.();
        }, 3000);
      } else if (emailResult.failed > 0 && emailResult.sent === 0) {
        // All failed
        emailResult.success = false;
      }
    } catch (error) {
      console.error("❌ Error in handleSend:", error);
      setResult({
        success: false,
        sent: 0,
        failed: filteredParticipants.length,
        errors: [
          {
            email: "N/A",
            error: error instanceof Error ? error.message : "Unknown error",
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white"
          size="sm"
        >
          <Mail className="w-4 h-4 mr-2" />
          Send QR Emails
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white px-6">
        <SheetHeader className="pb-4 border-b border-gray-200 px-0 pt-0">
          <SheetTitle className="text-[#0f9dfe] text-2xl font-bold">
            Send QR Code Emails
          </SheetTitle>
          <SheetDescription className="text-gray-600 mt-2">
            Send check-in QR codes to participants via email. Only participants with email addresses and event UIDs will receive emails.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Filter Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <label className="text-sm font-semibold text-gray-900 mb-3 block">
              Select Participants
            </label>
            <div className="flex flex-col sm:flex-row gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="radio"
                    name="filter"
                    value="accepted"
                    checked={selectedFilter === "accepted"}
                    onChange={(e) => setSelectedFilter(e.target.value as "accepted" | "all")}
                    className="w-5 h-5 text-[#0f9dfe] border-gray-300 focus:ring-[#0f9dfe] focus:ring-2 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-[#0f9dfe] transition-colors">
                    Accepted Only
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Only accepted participants with email and UID
                  </p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="radio"
                    name="filter"
                    value="all"
                    checked={selectedFilter === "all"}
                    onChange={(e) => setSelectedFilter(e.target.value as "accepted" | "all")}
                    className="w-5 h-5 text-[#0f9dfe] border-gray-300 focus:ring-[#0f9dfe] focus:ring-2 cursor-pointer"
                  />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-medium text-gray-900 group-hover:text-[#0f9dfe] transition-colors">
                    All with Email & UID
                  </span>
                  <p className="text-xs text-gray-500 mt-0.5">
                    All participants with email and event UID
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Participant Count */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-[#0f9dfe]/20 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Participants to email
                </p>
                {filteredParticipants.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    No participants match the criteria
                  </p>
                ) : (
                  <p className="text-xs text-gray-500">
                    Ready to send QR codes
                  </p>
                )}
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-[#0f9dfe]">
                  {filteredParticipants.length}
                </span>
              </div>
            </div>
            {filteredParticipants.length === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-800">
                  No participants match the selected criteria. Please adjust your filter or ensure participants have email addresses and event UIDs.
                </p>
              </div>
            )}
          </div>

          {/* Result Display */}
          {result && (
            <div
              className={`p-5 rounded-xl border-2 shadow-sm ${
                result.success
                  ? "bg-green-50 border-green-300"
                  : "bg-red-50 border-red-300"
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  {result.success ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4
                    className={`text-lg font-bold mb-2 ${
                      result.success ? "text-green-900" : "text-red-900"
                    }`}
                  >
                    {result.success ? "Emails Sent Successfully!" : "Some Emails Failed"}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${
                        result.success ? "text-green-800" : "text-red-800"
                      }`}>
                        ✅ Sent:
                      </span>
                      <span className={`text-sm font-bold ${
                        result.success ? "text-green-900" : "text-red-900"
                      }`}>
                        {result.sent} email{result.sent !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {result.failed > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-red-800">
                          ❌ Failed:
                        </span>
                        <span className="text-sm font-bold text-red-900">
                          {result.failed} email{result.failed !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                  {result.errors.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-red-200">
                      <p className="text-xs font-semibold text-red-900 mb-2">
                        Error Details:
                      </p>
                      <div className="bg-white/60 rounded-lg p-3 max-h-40 overflow-y-auto">
                        <ul className="text-xs text-red-800 space-y-1.5">
                          {result.errors.slice(0, 5).map((err, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-red-600 mt-0.5">•</span>
                              <span className="flex-1">
                                <span className="font-medium">{err.email}:</span>{" "}
                                <span className="text-red-700">{err.error}</span>
                              </span>
                            </li>
                          ))}
                          {result.errors.length > 5 && (
                            <li className="text-red-600 font-medium pt-1">
                              ... and {result.errors.length - 5} more error{result.errors.length - 5 !== 1 ? "s" : ""}
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Info Note */}
          {!result && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 mb-1">
                    Email Service Configuration
                  </p>
                  <p className="text-xs text-gray-600">
                    Make sure your email service (SMTP) is properly configured in your environment variables. Check the documentation for setup instructions.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200">
            <Button
              onClick={handleSend}
              disabled={loading || filteredParticipants.length === 0}
              className="flex-1 bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white font-semibold shadow-sm"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending Emails...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Emails ({filteredParticipants.length})
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setOpen(false);
                setResult(null);
              }}
              variant="outline"
              disabled={loading}
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold"
              size="lg"
            >
              Cancel
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

