"use client";

import { useState, useEffect } from "react";
import { Lock, LockOpen, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  getEventRegistrationStatus,
  toggleEventRegistrationStatus,
} from "@/lib/data";

interface EventRegistrationToggleSheetProps {
  onStatusChange?: () => void;
}

export function EventRegistrationToggleSheet({
  onStatusChange,
}: EventRegistrationToggleSheetProps) {
  const [open, setOpen] = useState(false);
  const [isEventClosed, setIsEventClosed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleToggleRegistration = async () => {
    try {
      setIsUpdating(true);
      const newStatus = !isEventClosed;
      await toggleEventRegistrationStatus(newStatus);
      setIsEventClosed(newStatus);
      onStatusChange?.();
      setOpen(false);
    } catch (error) {
      console.error("Error updating event status:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchEventStatus();
    }
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400">
          <Settings className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Event Settings</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="p-4 w-full bg-white">
        <SheetHeader>
          <SheetTitle className="text-gray-900">Event Registration Settings</SheetTitle>
          <SheetDescription className="text-gray-600">
            Manage the registration status for KickSTART 2026
          </SheetDescription>
        </SheetHeader>

        <div className="py-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {isEventClosed ? (
                  <Lock className="w-5 h-5 text-red-500" />
                ) : (
                  <LockOpen className="w-5 h-5 text-green-500" />
                )}
                Registration Status
              </CardTitle>
              <CardDescription>
                {isLoading
                  ? "Loading current status..."
                  : isEventClosed
                  ? "Registration is currently closed. New participants cannot register for the event."
                  : "Registration is currently open. Participants can register for the event."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-medium mb-2">Current Status</h4>
                  <div className="flex items-center gap-2">
                    {isEventClosed ? (
                      <>
                        <Lock className="w-4 h-4 text-red-500" />
                        <span className="text-red-600 font-medium">
                          Registration Closed
                        </span>
                      </>
                    ) : (
                      <>
                        <LockOpen className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 font-medium">
                          Registration Open
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={() => setOpen(false)} className="border-gray-300 text-gray-700 hover:bg-gray-50">
            Cancel
          </Button>
          <Button
            onClick={handleToggleRegistration}
            disabled={isLoading || isUpdating}
            className={isEventClosed ? "bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white" : "bg-red-600 hover:bg-red-700 text-white"}
          >
            {isUpdating ? (
              "Updating..."
            ) : isEventClosed ? (
              <>
                <LockOpen className="w-4 h-4 mr-2" />
                Open Registration
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Close Registration
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
