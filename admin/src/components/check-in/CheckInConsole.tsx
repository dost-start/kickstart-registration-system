"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  Camera,
  CheckCircle2,
  Loader2,
  ScanLine,
  VideoOff,
} from "lucide-react";

import type { FormEntry } from "@/types/form-entries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ScanResult {
  registrant: FormEntry;
  alreadyCheckedIn: boolean;
  scannedAt: string;
}

export function CheckInConsole() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const qrWrapperRef = useRef<HTMLDivElement | null>(null);
  const html5QrCodeRef = useRef<any>(null);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const [isCameraVisible, setIsCameraVisible] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const qrRegionId = "check-in-qr-reader";
  const [scanSuccessMessage, setScanSuccessMessage] = useState<string | null>(null);

  const processCheckIn = async (
    inputCode: string,
    options: { silentEmpty?: boolean } = {}
  ) => {
    if (!inputCode.trim()) {
      if (!options.silentEmpty) {
        setError("Enter or scan a UID to proceed.");
      }
      return false;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: inputCode }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to check in participant.");
      }

      const result: ScanResult = {
        registrant: payload.registrant as FormEntry,
        alreadyCheckedIn: Boolean(payload.alreadyCheckedIn),
        scannedAt: new Date().toISOString(),
      };

      setLastResult(result);
      setScanSuccessMessage(
        result.alreadyCheckedIn
          ? `${result.registrant.first_name} ${result.registrant.last_name} was already checked in.`
          : `${result.registrant.first_name} ${result.registrant.last_name} is checked in!`
      );
      await stopCamera(); // freeze feed after success
      setHistory((prev) => [result, ...prev].slice(0, 5));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process scan.");
      return false;
    } finally {
      setIsSubmitting(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = async (event?: React.FormEvent) => {
    event?.preventDefault();
    const success = await processCheckIn(code);
    if (success) {
      setCode("");
    }
  };

  const stopCamera = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch {
        // ignore
      }
      try {
        await html5QrCodeRef.current.clear();
      } catch {
        // ignore
      }
      html5QrCodeRef.current = null;
    }
    setIsCameraActive(false);
    setIsCameraVisible(false);
  };

  useEffect(() => {
    let isCancelled = false;
    const initializeCamera = async () => {
      if (
        !isCameraVisible ||
        isCameraActive ||
        isCameraLoading ||
        html5QrCodeRef.current
      ) {
        return;
      }

      setIsCameraLoading(true);
      setCameraError(null);

      try {
        const { Html5Qrcode } = await import("html5-qrcode");

        if (!qrWrapperRef.current) {
          throw new Error("Camera container is not ready yet.");
        }

        html5QrCodeRef.current = new Html5Qrcode(qrRegionId, {
          verbose: false,
        });

        await html5QrCodeRef.current.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          async (decodedText: string) => {
            const success = await processCheckIn(decodedText, {
              silentEmpty: true,
            });
            if (success) {
              setCode("");
            }
          },
          () => {
            // ignore scan errors
          }
        );

        if (!isCancelled) {
          setIsCameraActive(true);
        }
      } catch (err) {
        console.error("Camera initialization error:", err);
        setCameraError(
          err instanceof Error
            ? err.message
            : "Unable to access the camera. Please check permissions."
        );
        await stopCamera();
      } finally {
        if (!isCancelled) {
          setIsCameraLoading(false);
        }
      }
    };

    void initializeCamera();

    return () => {
      isCancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCameraVisible]);

  useEffect(() => {
    inputRef.current?.focus();
    return () => {
      void stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0f9dfe]/10 text-[#0f9dfe]">
                <ScanLine className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm uppercase tracking-wide text-gray-500">
                  QR Scanner
                </p>
                <h2 className="text-2xl font-bold text-[#0f9dfe]">
                  Auto Check-in Console
                </h2>
                <p className="text-sm text-gray-600">
                  Keep this input focused. Most QR scanners act as keyboards and
                  will paste the UID automatically.
                </p>
              </div>
            </div>
          </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col items-stretch gap-3 md:flex-row"
        >
          <Input
            ref={inputRef}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Scan or type the event UID (e.g., simera-dec13-1234)"
            className="flex-1 bg-white border-gray-300 text-gray-900 focus:border-[#0f9dfe] focus:ring-[#0f9dfe]"
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white shadow-sm font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ScanLine className="h-4 w-4" />
                Check-in
              </>
            )}
          </Button>
        </form>

        {scanSuccessMessage && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <span>{scanSuccessMessage}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={
              isCameraVisible
                ? () => void stopCamera()
                : () => setIsCameraVisible(true)
            }
            disabled={isCameraLoading}
            className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
          >
            {isCameraVisible ? (
              <>
                <VideoOff className="h-4 w-4" />
                Stop Camera
              </>
            ) : (
              <>
                <Camera className="h-4 w-4" />
                Use Camera
              </>
            )}
          </Button>
          {isCameraLoading && (
            <span className="flex items-center gap-1 text-xs text-gray-600">
              <Loader2 className="h-3 w-3 animate-spin" />
              Initializing camera...
            </span>
          )}
        </div>

        {cameraError && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span>{cameraError}</span>
          </div>
        )}

        {isCameraVisible && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
            <p className="mb-3 text-sm text-gray-700">
              Aim the participant's QR code at the camera. Successful scans will
              automatically submit and log the check-in.
            </p>
            <div
              id={qrRegionId}
              ref={qrWrapperRef}
              className="aspect-square w-full overflow-hidden rounded-xl border border-gray-300 bg-black"
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm">
        {lastResult ? (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-wide text-gray-500">
                    Participant
                  </p>
                  <p className="text-xl font-bold text-[#0f9dfe]">
                    {[lastResult.registrant.first_name, lastResult.registrant.last_name]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                  <p className="text-sm text-gray-600">
                    {lastResult.registrant.university}
                  </p>
                </div>
                <Badge
                  className={
                    lastResult.alreadyCheckedIn
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : "bg-green-100 text-green-800 border border-green-300"
                  }
                >
                  {lastResult.alreadyCheckedIn ? "Already Checked In" : "Checked In"}
                </Badge>
              </div>
              <div className="grid gap-3 text-sm text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">UID</span>
                  <span className="font-mono text-gray-900">{lastResult.registrant.event_uid}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Seat</span>
                  <span className="text-gray-900">
                    {lastResult.registrant.seat_assignment || "No seat assigned"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Preferred Date</span>
                  <span className="text-gray-900">{lastResult.registrant.preferred_date || "—"}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <p className="text-lg font-semibold text-gray-900">
                  {lastResult.alreadyCheckedIn
                    ? "Participant was already checked in."
                    : "Check-in recorded successfully."}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Timestamp: {new Date(lastResult.scannedAt).toLocaleString()}
              </p>
              <p className="text-sm text-gray-700">
                Scholarship: {lastResult.registrant.scholarship_type}
              </p>
              <p className="text-sm text-gray-700">
                Contact: {lastResult.registrant.email || "No email"} •{" "}
                {lastResult.registrant.contact_number}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-10 text-center text-gray-500">
            <ScanLine className="h-10 w-10 text-gray-400" />
            <p className="text-lg font-semibold text-gray-900">
              No scans yet. Start by scanning a QR code.
            </p>
            <p className="text-sm text-gray-600">
              Successful scans will display participant info and be logged below.
            </p>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-bold text-[#0f9dfe]">Recent scans</h3>
          <p className="text-sm text-gray-600 mt-1">
            Keep track of the last five check-ins.
          </p>
          <div className="mt-4 space-y-3">
            {history.map((entry) => (
              <div
                key={`${entry.registrant.id}-${entry.scannedAt}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm hover:bg-gray-100 transition-colors"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {[entry.registrant.first_name, entry.registrant.last_name]
                      .filter(Boolean)
                      .join(" ")}
                  </p>
                  <p className="text-gray-600">
                    UID: {entry.registrant.event_uid || "—"}
                  </p>
                </div>
                <div className="text-right text-xs text-gray-600">
                  <p className="text-gray-900">{new Date(entry.scannedAt).toLocaleTimeString()}</p>
                  <p>
                    {entry.registrant.seat_assignment || "No seat •"}{" "}
                    {entry.alreadyCheckedIn ? "Already in" : "New check-in"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

