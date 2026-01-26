import Link from "next/link";
import { Users, Download, ScanLine } from "lucide-react";

import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onExportCSV: () => void;
}

export function QuickActions({ onExportCSV }: QuickActionsProps) {
  return (
    <div className="mt-12">
      <h2 className="text-3xl font-bold mb-8 text-[#0f9dfe]">
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 overflow-hidden">
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#0f9dfe]/10 rounded-xl flex items-center justify-center border border-[#0f9dfe]/30">
                <Users className="w-6 h-6 text-[#0f9dfe]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Registrant Management
              </h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              View, approve, reject, and manage all event registrations. Update
              registrant status and handle check-ins.
            </p>
            <Link href="/kickstart/manage">
              <Button className="w-full bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full">
                <Users className="w-4 h-4 mr-2" />
                Manage Registrants
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 overflow-hidden">
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#0f9dfe]/10 rounded-xl flex items-center justify-center border border-[#0f9dfe]/30">
                <ScanLine className="w-6 h-6 text-[#0f9dfe]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                QR Check-in
              </h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Generate UIDs and scan participant QR codes on-site to auto check them in and surface their seat assignments instantly.
            </p>
            <Link href="/kickstart/check-in">
              <Button className="w-full bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full">
                <ScanLine className="w-4 h-4 mr-2" />
                Open Check-in Console
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 overflow-hidden">
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#0f9dfe]/10 rounded-xl flex items-center justify-center border border-[#0f9dfe]/30">
                <Download className="w-6 h-6 text-[#0f9dfe]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Data Export
              </h3>
            </div>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Export registrant data in various formats for external analysis
              and reporting.
            </p>
            <Button 
              onClick={onExportCSV} 
              className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 rounded-full"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
