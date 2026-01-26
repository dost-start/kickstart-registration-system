"use client";

import { Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getIslandRegistrationStatus, type IslandStatus } from "@/app/actions/island-status";

export default function RegistrationClosed() {
  const [islandStatus, setIslandStatus] = useState<Record<string, IslandStatus> | null>(null);

  useEffect(() => {
    async function fetchIslandStatus() {
      try {
        const status = await getIslandRegistrationStatus();
        setIslandStatus(status);
      } catch (error) {
        console.error("Failed to fetch island status:", error);
      }
    }
    fetchIslandStatus();
  }, []);

  const fullIslands = islandStatus
    ? Object.values(islandStatus).filter((status) => status.isClosed || status.isFull)
    : [];

  return (
    <section
      id="registration-form"
      className="py-16 sm:py-20 lg:py-24 bg-black"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl backdrop-blur-sm border border-red-400/30">
              <Lock className="w-10 h-10 text-red-400" />
            </div>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-white via-red-200 to-pink-300 bg-clip-text text-transparent">
            Registration Closed
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto">
            Thank you for your interest in KickSTART 2026: START-DOST General Assembly.
            Registration for this event has been closed.
          </p>
        </div>

        <div className="max-w-2xl mx-auto relative bg-white/10 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl border border-white/20 overflow-hidden">
          {/* Glass gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-pink-500/10 to-red-500/5 rounded-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-2xl"></div>
          
          <div className="relative text-center">
            <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white via-red-200 to-pink-300 bg-clip-text text-transparent">
              KickSTART 2026: START-DOST General Assembly
            </h3>
            <p className="text-lg text-white/60 mb-8">
              Registration Period Has Ended
            </p>
            
            <div className="space-y-6">
              <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <Lock className="w-6 h-6 text-red-400 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-white mb-3 text-lg">
                      Registration Status
                    </h4>
                    <p className="text-white/90 mb-3">
                      Registration for KickSTART 2026: START-DOST General Assembly is
                      now closed. We are no longer accepting new applications for
                      this event.
                    </p>
                    {fullIslands.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-white/80 text-sm font-semibold">
                          Island Registration Status:
                        </p>
                        <ul className="space-y-1">
                          {fullIslands.map((status) => (
                            <li key={status.island} className="text-white/70 text-sm">
                              • <span className="font-semibold">{status.island}</span>: Full ({status.currentCount}/150 participants)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="text-center space-y-6">
                <p className="text-white/70">
                  Stay updated on future events and opportunities from START.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a href="mailto:rc.nads.sei@gmail.com">
                    <Button
                      className="flex items-center gap-3 px-8 py-3 bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white shadow-lg hover:shadow-[#0f9dfe]/25 transform hover:scale-105 transition-all duration-300 rounded-full"
                    >
                      <Mail className="w-5 h-5" />
                      Contact Us
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
