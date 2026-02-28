"use client";

import Link from "next/link";
import { Download, RefreshCw, Users, CalendarClock, ScanLine } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { AdminHeader } from "@/components/AdminHeader";
import { CompactStatsCards } from "@/components/StatsCards";
import { RegistrantDataTable } from "@/components/registrant-table/RegistrantDataTable";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { fetchAllRegistrants } from "@/lib/data";
import { exportRegistrantsListToCSV } from "@/lib/export";
import type { FormEntry, RegistrantStats } from "@/types/form-entries";
import { AddRegistrantSheet } from "@/components/AddRegistrantSheet";
import { EventRegistrationToggleSheet } from "@/components/EventRegistrationToggleSheet";
import { RegistrationStatusBadge } from "@/components/RegistrationStatusBadge";
import { SendQREmailSheet } from "@/components/SendQREmailSheet";
import { EmailBlastSheet } from "@/components/EmailBlastSheet";

export default function EventManagement() {
  const router = useRouter();
  const [registrants, setRegistrants] = useState<FormEntry[]>([]);
  const [stats, setStats] = useState<RegistrantStats>({
    total: 0,
    accepted: 0,
    rejected: 0,
    pending: 0,
    waitlisted: 0,
    checkedIn: 0,
    byIsland: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusKey, setStatusKey] = useState(0); // Key to force re-render of status badge

  const computeStats = (registrantsData: FormEntry[]): RegistrantStats => {
    const total = registrantsData.length;
    const accepted = registrantsData.filter((r) => r.status === "accepted").length;
    const rejected = registrantsData.filter((r) => r.status === "rejected").length;
    const pending = registrantsData.filter((r) => r.status === "pending").length;
    const waitlisted = registrantsData.filter((r) => r.status === "waitlisted").length;
    const checkedIn = registrantsData.filter((r) => r.is_checked_in).length;

    const byIsland: Record<string, { total: number; accepted: number; rejected: number; pending: number; waitlisted: number; checkedIn: number }> = {};
    for (const r of registrantsData) {
      const island = r.island;
      if (!island) continue;
      if (!byIsland[island]) {
        byIsland[island] = { total: 0, accepted: 0, rejected: 0, pending: 0, waitlisted: 0, checkedIn: 0 };
      }
      byIsland[island].total++;
      if (r.status === "accepted") byIsland[island].accepted++;
      if (r.status === "rejected") byIsland[island].rejected++;
      if (r.status === "pending") byIsland[island].pending++;
      if (r.status === "waitlisted") byIsland[island].waitlisted++;
      if (r.is_checked_in) byIsland[island].checkedIn++;
    }

    return { total, accepted, rejected, pending, waitlisted, checkedIn, byIsland };
  };

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const registrantsData = await fetchAllRegistrants();
      setRegistrants(registrantsData);
      setStats(computeStats(registrantsData));
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load registrant data");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data without showing the main loading spinner
  const refreshData = async () => {
    try {
      const registrantsData = await fetchAllRegistrants();
      setRegistrants(registrantsData);
      setStats(computeStats(registrantsData));
    } catch (err) {
      console.error("Error refreshing data:", err);
      // Don't set error state here as it would disrupt the UI
    }
  };

  // Handle status change from EventRegistrationToggleSheet
  const handleStatusChange = () => {
    setStatusKey((prev) => prev + 1); // Force re-render of status badge
    refreshData(); // Also refresh the data
  };

  const handleExportCSV = (islandFilter?: string) => {
    let filteredRegistrants = registrants;
    
    if (islandFilter && islandFilter !== "all") {
      filteredRegistrants = registrants.filter(
        (r) => r.island === islandFilter
      );
    }
    
    exportRegistrantsListToCSV(filteredRegistrants);
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-2xl mx-auto text-center relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 overflow-hidden">
          <div className="relative">
            <h1 className="text-3xl font-bold mb-4 text-[#0f9dfe]">
              Error Loading Management
            </h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button 
              onClick={fetchData} 
              className="bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-10">
      <AdminHeader
        title="START Management"
        showBackButton
        backButtonHref="/kickstart"
        backButtonText="Back to Dashboard"
        showTitle={false}
      >
        <Button
          onClick={fetchData}
          variant="outline"
          size="sm"
          disabled={isLoading}
          className="px-3 sm:px-4 py-2 font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 rounded-full text-xs sm:text-sm"
        >
          <RefreshCw
            className={`w-4 h-4 sm:mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={registrants.length === 0}
              className="px-3 sm:px-4 py-2 font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 rounded-full text-xs sm:text-sm"
            >
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Export CSV</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => handleExportCSV("all")}>
              Export All
            </DropdownMenuItem>
            {Array.from(new Set(registrants.map((r) => r.island).filter(Boolean)))
              .sort()
              .map((island) => (
                <DropdownMenuItem key={island} onClick={() => handleExportCSV(island!)}>
                  Export {island}
                </DropdownMenuItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Link href="/kickstart/check-in">
          <Button
            variant="outline"
            size="sm"
            className="px-3 sm:px-4 py-2 font-bold border-2 border-[#0f9dfe] text-[#0f9dfe] hover:bg-[#0f9dfe]/10 hover:border-[#0d8ae8] transition-all duration-300 rounded-full text-xs sm:text-sm"
          >
            <ScanLine className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Check-in Console</span>
          </Button>
        </Link>
        <Button
          onClick={() => router.push("/kickstart/allocations")}
          variant="outline"
          size="sm"
          className="px-3 sm:px-4 py-2 font-bold border-2 border-[#fcea3f] text-gray-700 hover:bg-[#fcea3f]/20 hover:border-[#fce83d] transition-all duration-300 rounded-full text-xs sm:text-sm"
        >
          <CalendarClock className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Slot Allocation</span>
        </Button>
      </AdminHeader>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        {/* Event Info Card */}
        <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="relative">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-[#0f9dfe]">
                  KickSTART 2026
                </h2>
                <p className="text-gray-600 mt-1">&quot;Empowering Scholars, Building Innovation, and Leading Change&quot;</p>
              </div>
              <RegistrationStatusBadge key={statusKey} />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <CompactStatsCards stats={stats} />
        </div>

        {/* Registrants Table */}
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="relative p-8">
            <div className="flex justify-between items-center gap-2 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#0f9dfe]/10 rounded-xl flex items-center justify-center border border-[#0f9dfe]/30">
                  <Users className="w-6 h-6 text-[#0f9dfe]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Registrants Management
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <EmailBlastSheet participants={registrants} />
                <SendQREmailSheet
                  participants={registrants}
                  onSent={refreshData}
                />
                <EventRegistrationToggleSheet
                  onStatusChange={handleStatusChange}
                />
                <AddRegistrantSheet onRegistrantAdded={refreshData} />
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#0f9dfe]" />
                  <span className="text-gray-600">Loading registrants...</span>
                </div>
              </div>
            ) : (
              <RegistrantDataTable
                data={registrants}
                onDataChange={refreshData}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
