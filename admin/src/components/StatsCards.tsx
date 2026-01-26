import type { RegistrantStats } from "@/types/form-entries";

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
export function CompactStatsCards({ stats }: { stats: RegistrantStats }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
      <StatCard
        title="Total"
        value={stats.total}
        description=""
        colorClass="text-primary"
      />
      <StatCard
        title="Accepted"
        value={stats.accepted}
        description=""
        colorClass="text-green-600"
      />
      <StatCard
        title="Pending"
        value={stats.pending}
        description=""
        colorClass="text-yellow-600"
      />
      <StatCard
        title="Waitlisted"
        value={stats.waitlisted}
        description=""
        colorClass="text-purple-600"
      />
      <StatCard
        title="Rejected"
        value={stats.rejected}
        description=""
        colorClass="text-red-600"
      />
      <StatCard
        title="Checked In"
        value={stats.checkedIn}
        description=""
        colorClass="text-[#0f9dfe]"
      />
    </div>
  );
}
