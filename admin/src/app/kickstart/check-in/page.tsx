"use client";

import Link from "next/link";
import { ChevronLeft, ClipboardList } from "lucide-react";

import { AdminHeader } from "@/components/AdminHeader";
import { CheckInConsole } from "@/components/check-in/CheckInConsole";
import { Button } from "@/components/ui/button";

export default function CheckInPage() {
  return (
    <div className="min-h-screen bg-white pt-10">
      <AdminHeader
        title="On-site QR Check-in"
        subtitle="Scan event UIDs to auto check-in participants"
        showBackButton
        backButtonHref="/kickstart"
      >
        <div className="flex gap-2">
          <Link href="/kickstart/manage">
            <Button
              size="sm"
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
            >
              <ClipboardList className="h-4 w-4" />
              Manage Registrants
            </Button>
          </Link>
        </div>
      </AdminHeader>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-28">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-8 flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-[#0f9dfe]">
                Scan · Match · Confirm
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Each successful scan instantly checks in the participant and
                surfaces their seat assignment.
              </p>
            </div>
          </div>
          <CheckInConsole />
        </div>
      </main>
    </div>
  );
}

