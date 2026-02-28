"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  ListChecks,
} from "lucide-react";
import type { RegistrantStats } from "@/types/form-entries";
import { Badge } from "@/components/ui/badge";

interface StatsCardsProps {
  stats: RegistrantStats;
  isLoading: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  colorClass: string;
}

function StatCard({ title, value, description, colorClass }: StatCardProps) {
  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-md border border-gray-200 overflow-hidden">
      <div className="relative">
        <div className="pb-2">
          <h3 className="text-sm font-medium text-gray-600">
            {title}
          </h3>
        </div>
        <div className={`text-3xl font-bold ${colorClass} mb-1`}>{value}</div>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function LoadingStatCard() {
  return (
    <div className="relative bg-white rounded-2xl p-6 shadow-md border border-gray-200 overflow-hidden animate-pulse">
      <div className="relative">
        <div className="pb-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded w-12 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3"></div>
      </div>
    </div>
  );
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <LoadingStatCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
      <StatCard
        title="Total Registrations"
        value={stats.total}
        description="All registrants"
        colorClass="text-[#0f9dfe]"
      />
      <StatCard
        title="Accepted"
        value={stats.accepted}
        description="Approved attendees"
        colorClass="text-green-600"
      />
      <StatCard
        title="Pending"
        value={stats.pending}
        description="Awaiting review"
        colorClass="text-yellow-600"
      />
      <StatCard
        title="Waitlisted"
        value={stats.waitlisted}
        description="Awaiting review"
        colorClass="text-purple-600"
      />
      <StatCard
        title="Rejected"
        value={stats.rejected}
        description="Declined applications"
        colorClass="text-red-600"
      />
      <StatCard
        title="Checked In"
        value={stats.checkedIn}
        description="Present at event"
        colorClass="text-[#0f9dfe]"
      />
    </div>
  );
}

// Compact version for manage page
interface CompactStatsCardsProps {
  stats: RegistrantStats;
}

export function CompactStatsCards({ stats }: CompactStatsCardsProps) {
  const statItems = [
    { label: "Total", value: stats.total, icon: Users, color: "text-[#0f9dfe]", bg: "bg-[#0f9dfe]/10", border: "border-[#0f9dfe]/30" },
    { label: "Accepted", value: stats.accepted, icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", border: "border-green-300" },
    { label: "Pending", value: stats.pending, icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-300" },
    { label: "Waitlisted", value: stats.waitlisted, icon: ListChecks, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-300" },
    { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-300" },
    { label: "Checked In", value: stats.checkedIn, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-300" },
  ];

  const islands = Object.entries(stats.byIsland || {}).sort(([a], [b]) => a.localeCompare(b));

  return (
    <div className="space-y-6">
      {/* Overall Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statItems.map((item) => (
          <Card key={item.label} className={`border ${item.border} ${item.bg}`}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${item.bg} flex items-center justify-center`}>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-gray-600">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Per-Island Breakdown */}
      {islands.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-4">Breakdown by Island</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {islands.map(([island, islandStats]) => (
              <Card key={island} className="bg-white border border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900">{island}</h5>
                    <Badge className="bg-[#0f9dfe]/10 text-[#0f9dfe] border border-[#0f9dfe]/30 hover:bg-[#0f9dfe]/10">
                      {islandStats.total}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-lg bg-green-50 border border-green-200 p-2">
                      <p className="font-bold text-green-700">{islandStats.accepted}</p>
                      <p className="text-green-600">Accepted</p>
                    </div>
                    <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-2">
                      <p className="font-bold text-yellow-700">{islandStats.pending}</p>
                      <p className="text-yellow-600">Pending</p>
                    </div>
                    <div className="rounded-lg bg-purple-50 border border-purple-200 p-2">
                      <p className="font-bold text-purple-700">{islandStats.waitlisted}</p>
                      <p className="text-purple-600">Waitlisted</p>
                    </div>
                    <div className="rounded-lg bg-red-50 border border-red-200 p-2">
                      <p className="font-bold text-red-700">{islandStats.rejected}</p>
                      <p className="text-red-600">Rejected</p>
                    </div>
                    <div className="col-span-2 rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                      <p className="font-bold text-emerald-700">{islandStats.checkedIn}</p>
                      <p className="text-emerald-600">Checked In</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
