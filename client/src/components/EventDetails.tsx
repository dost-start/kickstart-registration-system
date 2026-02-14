import { Calendar, Clock, MapPin, Trophy, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const REGIONAL_EVENTS = [
  {
    island: "Luzon",
    date: "February 28, 2026",
    day: "Saturday",
    time: "12:00 PM - 5:00 PM",
    location: "Batangas State University - The National Engineering University - Alangilan Campus",
    locationAlt: null,
    participants: "DOST Scholars (Luzon)",
    badgeColor: "bg-[#0f9dfe]/10 text-[#0d8ae8] border-[#0f9dfe]/30 hover:bg-[#0f9dfe]/20",
  },
  {
    island: "Visayas",
    date: "February 28, 2026",
    day: "Saturday",
    time: "12:00 PM - 5:00 PM",
    location: "University of Southern Philippines Foundation",
    locationAlt: null,
    participants: "DOST Scholars (Visayas)",
    badgeColor: "bg-[#0f9dfe]/10 text-[#0d8ae8] border-[#0f9dfe]/30 hover:bg-[#0f9dfe]/20",
  },
  {
    island: "Mindanao",
    date: "March 14, 2026",
    day: "Saturday",
    time: "12:00 PM - 5:00 PM",
    location: "University of Mindanao - Main Campus",
    locationAlt: null,
    participants: "DOST Scholars (Mindanao)",
    badgeColor: "bg-[#0f9dfe]/10 text-[#0d8ae8] border-[#0f9dfe]/30 hover:bg-[#0f9dfe]/20",
  },
];

export default function EventDetails() {
  return (
    <main className="bg-white min-h-[calc(100vh-200px)] flex items-center py-4 md:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        {/* Event Info Card */}
        <div className="relative bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Image Section */}
          <div className="relative h-40 sm:h-48 bg-gradient-to-r from-[#0f9dfe]/10 via-[#0f9dfe]/15 to-[#0f9dfe]/10 overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#0f9dfe] mb-2">
                  KickSTART 2026
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  &quot;Empowering Scholars, Building Innovation, and Leading Change&quot;
                </p>
              </div>
            </div>
          </div>
          
          {/* Regional Events Section */}
          <div className="relative p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Regional Events</h2>
            <div className="space-y-6">
              {REGIONAL_EVENTS.map((event) => (
                <div
                  key={event.island}
                  className="rounded-xl border border-gray-200 p-4 sm:p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <Badge
                      variant="outline"
                      className={`font-semibold border ${event.badgeColor}`}
                    >
                      KickSTART {event.island} 2026
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-[#0f9dfe]/10 rounded-lg flex items-center justify-center border border-[#0f9dfe]/30">
                          <Calendar className="w-5 h-5 text-[#0f9dfe]" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Date & Time</h3>
                        <p className="text-sm text-gray-700 font-medium">{event.date}{event.day ? ` (${event.day})` : ""}</p>
                        <p className="text-sm text-gray-600">{event.time}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-[#0f9dfe]/10 rounded-lg flex items-center justify-center border border-[#0f9dfe]/30">
                          <MapPin className="w-5 h-5 text-[#0f9dfe]" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Location</h3>
                        <p className="text-sm text-gray-700 font-medium">{event.location}</p>
                        {event.locationAlt && (
                          <p className="text-xs text-gray-500 italic">{event.locationAlt}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-[#0f9dfe]/10 rounded-lg flex items-center justify-center border border-[#0f9dfe]/30">
                          <Users className="w-5 h-5 text-[#0f9dfe]" />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Participants</h3>
                        <Badge className={`mt-1 border ${event.badgeColor}`}>
                          {event.participants}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Event Description Card */}
        <div className="relative bg-white rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg border border-gray-200 overflow-hidden">
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
              KickSTART is the official General Assembly of START-DOST, uniting scholars and officers 
              from across the Philippines in a nationwide convergence of innovation, collaboration, 
              and leadership. The program begins with an Online National Launch, followed by regional 
              face-to-face assemblies in Batangas (Luzon), Cebu (Visayas), and Davao (Mindanao) to 
              ensure inclusivity for scholars from all islands.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
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
                <span className="text-gray-700 font-medium">KickSTART Ideathon</span>
              </div>
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="w-10 h-10 bg-[#0f9dfe]/10 rounded-lg flex items-center justify-center border border-[#0f9dfe]/30">
                  <Users className="w-5 h-5 text-[#0f9dfe]" />
                </div>
                <span className="text-gray-700 font-medium">Networking & Fireside Chat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
