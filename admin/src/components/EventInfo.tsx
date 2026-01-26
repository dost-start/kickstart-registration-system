import { Calendar, Clock, MapPin, Trophy, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function EventInfo() {
  return (
    <div className="mb-8">
      <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Image Section */}
        <div className="relative h-48 bg-gradient-to-r from-[#0f9dfe]/10 via-[#0f9dfe]/15 to-[#0f9dfe]/10 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-[#0f9dfe] mb-2">
                KickSTART 2026
              </h1>
              <p className="text-gray-700 text-lg font-medium">
                START-DOST General Assembly
              </p>
              <p className="text-gray-600 text-sm mt-1">
                &quot;From Scholars to Innovators: Advancing Together and Shaping the Future&quot;
              </p>
            </div>
          </div>
        </div>
        
        {/* Content Section */}
        <div className="relative p-8">
          <div className="relative">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Date & Time */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#0f9dfe]/10 rounded-xl flex items-center justify-center border border-[#0f9dfe]/30">
                    <Calendar className="w-6 h-6 text-[#0f9dfe]" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Date & Time</h3>
                  <p className="text-sm text-gray-700 font-medium">January 24, 2026</p>
                  <p className="text-sm text-gray-600">
                    8:00 AM - 8:00 PM
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#0f9dfe]/10 rounded-xl flex items-center justify-center border border-[#0f9dfe]/30">
                    <MapPin className="w-6 h-6 text-[#0f9dfe]" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Location</h3>
                  <p className="text-sm text-gray-700 font-medium">
                    Batangas State University
                  </p>
                  <p className="text-sm text-gray-600">Leonardo da Vinci Amphitheater, Alangilan</p>
                  <p className="text-xs text-gray-500 italic">or DOST CALABARZON Regional Office</p>
                </div>
              </div>

              {/* Eligibility */}
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#0f9dfe]/10 rounded-xl flex items-center justify-center border border-[#0f9dfe]/30">
                    <Users className="w-6 h-6 text-[#0f9dfe]" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Participants</h3>
                  <Badge className="mt-1 bg-[#0f9dfe]/10 text-[#0d8ae8] border border-[#0f9dfe]/30 hover:bg-[#0f9dfe]/20">
                    150 DOST Scholars (Region IV-A, Luzon)
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EventDescription() {
  return (
    <div className="mb-8">
      <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 overflow-hidden">
        <div className="relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-[#0f9dfe]/10 rounded-xl flex items-center justify-center border border-[#0f9dfe]/30">
              <Trophy className="w-6 h-6 text-[#0f9dfe]" />
            </div>
            <h2 className="text-2xl font-bold text-[#0f9dfe]">
              About KickSTART 2026
            </h2>
          </div>
          
          <p className="text-gray-700 leading-relaxed mb-6 text-lg">
            KickSTART 2026 is the official regional leg of the START-DOST General Assembly. 
            It aims to unite DOST scholars, strengthen collaboration, and empower youth leaders in 
            technology and innovation for nation-building. The event focuses on combining technical 
            skill development, leadership, and patriotism to address real-world challenges faced by 
            scholars and communities.
          </p>
          
          <div className="grid md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-[#0f9dfe]/10 rounded-lg flex items-center justify-center border border-[#0f9dfe]/30">
                <Clock className="w-5 h-5 text-[#0f9dfe]" />
              </div>
              <span className="text-gray-700 font-medium">TechTalks & Workshop</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-[#0f9dfe]/10 rounded-lg flex items-center justify-center border border-[#0f9dfe]/30">
                <Trophy className="w-5 h-5 text-[#0f9dfe]" />
              </div>
              <span className="text-gray-700 font-medium">KickSTART Hack</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-[#0f9dfe]/10 rounded-lg flex items-center justify-center border border-[#0f9dfe]/30">
                <Users className="w-5 h-5 text-[#0f9dfe]" />
              </div>
              <span className="text-gray-700 font-medium">Networking & Fireside Chat</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="w-10 h-10 bg-[#0f9dfe]/10 rounded-lg flex items-center justify-center border border-[#0f9dfe]/30">
                <Trophy className="w-5 h-5 text-[#0f9dfe]" />
              </div>
              <span className="text-gray-700 font-medium">Patriotech Sessions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
