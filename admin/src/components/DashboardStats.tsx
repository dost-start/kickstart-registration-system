"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardStats {
  totalRegistrations: number;
  pendingReviews: number;
  checkedIn: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRegistrations: 0,
    pendingReviews: 0,
    checkedIn: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient();

        // Get total registrations
        const { count: totalRegistrations } = await supabase
          .from("kickstart_form_entries")
          .select("*", { count: "exact", head: true });

        // Get pending reviews
        const { count: pendingReviews } = await supabase
          .from("kickstart_form_entries")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        // Get checked in
        const { count: checkedIn } = await supabase
          .from("kickstart_form_entries")
          .select("*", { count: "exact", head: true })
          .eq("is_checked_in", true);

        setStats({
          totalRegistrations: totalRegistrations || 0,
          pendingReviews: pendingReviews || 0,
          checkedIn: checkedIn || 0,
        });
      } catch (err) {
        console.error("Error fetching stats:", err);
        setError("Failed to load statistics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {i === 0
                  ? "Total Registrations"
                  : i === 1
                  ? "Pending Reviews"
                  : "Checked In"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">-</div>
              <p className="text-xs text-muted-foreground">Unable to load</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Registrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {stats.totalRegistrations}
          </div>
          <p className="text-xs text-muted-foreground">
            All time registrations
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pending Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {stats.pendingReviews}
          </div>
          <p className="text-xs text-muted-foreground">Awaiting approval</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Checked In
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            {stats.checkedIn}
          </div>
          <p className="text-xs text-muted-foreground">Present at event</p>
        </CardContent>
      </Card>
    </div>
  );
}
