"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users } from "lucide-react";

import { fetchRegistrantStats } from "@/lib/data";
import { exportRegistrantsToCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { AdminHeader } from "@/components/AdminHeader";
import { EventInfo, EventDescription } from "@/components/EventInfo";
import { StatsCards } from "@/components/StatsCards";
import { QuickActions } from "@/components/QuickActions";
import type { RegistrantStats } from "@/types/form-entries";

export default function EventDashboard() {
  const [stats, setStats] = useState<RegistrantStats>({
    total: 0,
    accepted: 0,
    rejected: 0,
    pending: 0,
    waitlisted: 0,
    checkedIn: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleExportCSV = async () => {
    try {
      await exportRegistrantsToCSV();
    } catch (err) {
      console.error("Error exporting CSV:", err);
    }
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsData = await fetchRegistrantStats();
        setStats(statsData);
      } catch (err) {
        console.error("Error fetching stats:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to load registration statistics";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadStats();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-2xl mx-auto text-center relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 overflow-hidden">
          <div className="relative">
            <h1 className="text-3xl font-bold mb-4 text-[#0f9dfe]">
              Error Loading Dashboard
            </h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminHeader title="Event Dashboard" subtitle="KickSTART 2026">
        <Link href="/kickstart/manage">
          <Button className="flex items-center gap-2 bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full">
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">Manage Event</span>
          </Button>
        </Link>
      </AdminHeader>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-34">
        <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="relative">
            <EventInfo />
            <EventDescription />
          </div>
        </div>

        <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 overflow-hidden">
          <div className="relative">
            <h2 className="text-3xl font-bold mb-8 text-[#0f9dfe]">
              Registration Summary
            </h2>
            <StatsCards stats={stats} isLoading={isLoading} />
          </div>
        </div>

        <div className="mt-8">
          <QuickActions onExportCSV={handleExportCSV} />
        </div>
      </main>
    </div>
  );
}
