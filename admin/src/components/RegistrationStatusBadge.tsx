"use client";

import { useEffect, useState } from "react";
import { Lock, LockOpen } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { getEventRegistrationStatus } from "@/lib/data";

export function RegistrationStatusBadge() {
  const [isEventClosed, setIsEventClosed] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEventStatus = async () => {
    try {
      setIsLoading(true);
      const status = await getEventRegistrationStatus();
      setIsEventClosed(status);
    } catch (error) {
      console.error("Error fetching event status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventStatus();
  }, []);

  if (isLoading) {
    return (
      <Badge variant="outline" className="animate-pulse">
        Loading...
      </Badge>
    );
  }

  return (
    <Badge
      variant={isEventClosed ? "destructive" : "default"}
      className={`flex items-center gap-1 w-fit ${
        isEventClosed 
          ? "bg-red-50 text-red-700 border border-red-200" 
          : "bg-[#0f9dfe]/10 text-[#0f9dfe] border border-[#0f9dfe]/30"
      }`}
    >
      {isEventClosed ? (
        <>
          <Lock className="w-3 h-3" />
          Registration Closed
        </>
      ) : (
        <>
          <LockOpen className="w-3 h-3" />
          Registration Open
        </>
      )}
    </Badge>
  );
}
