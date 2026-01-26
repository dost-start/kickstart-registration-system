"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

// Add a back button styled like a secondary Button
function BackButton() {
  return (
    <div className="mb-4">
      <Link href="/kickstart/manage">
        <Button variant="secondary" className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50">
          ← Back
        </Button>
      </Link>
    </div>
  );
}


type ResultRow = {
  university: string;
  isMinorityUniversity: boolean;
  registrantCount: number;
  allocatedSlots: number;
  acceptedCount: number;
  waitlistedCount: number;
};

export default function AllocationPage() {
  const [day, setDay] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<null | { results: ResultRow[]; accepted: any[]; waitlisted: any[] }>(null);
  const [message, setMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  async function handlePreview() {
    if (!day) return;
    setLoading(true);
    setMessage("");
    setSuccessMessage("");
    try {
      const res = await fetch("/api/admin/allocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, dryRun: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Preview failed");
      setPreview(data);
    } catch (e: any) {
      setMessage(e?.message || "Failed to preview allocation");
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!day) return;
    setLoading(true);
    setMessage("");
    setSuccessMessage("");
    try {
      const res = await fetch("/api/admin/allocations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, dryRun: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Run failed");
      setSuccessMessage(`Allocation executed successfully! Run ID: ${data.runId}`);
      setPreview(null);
    } catch (e: any) {
      setMessage(e?.message || "Failed to run allocation");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white p-6 space-y-6">
      <BackButton />
      <Card className="bg-white border border-gray-200 shadow-lg">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-[#0f9dfe] text-2xl font-bold">Slot Allocation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-wrap items-center gap-4">
            <Select value={day} onValueChange={setDay}>
              <SelectTrigger className="w-[240px] bg-white border-gray-300 text-gray-900 focus:border-[#0f9dfe] focus:ring-[#0f9dfe]/20">
                <SelectValue placeholder="Select day (preferred_date)" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="December 13" className="text-gray-900 hover:bg-gray-100">December 13</SelectItem>
                <SelectItem value="December 14" className="text-gray-900 hover:bg-gray-100">December 14</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              disabled={!day || loading} 
              onClick={handlePreview}
              className="bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Loading..." : "Preview Allocation"}
            </Button>
            <Button 
              variant="secondary" 
              disabled={!day || loading || !preview} 
              onClick={handleConfirm}
              className="bg-[#fcea3f] hover:bg-[#e0c938] text-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirm & Execute
            </Button>
          </div>
          {message && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{message}</p>
            </div>
          )}
          {successMessage && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-700 font-semibold">{successMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {preview && (
        <Card className="bg-white border border-gray-200 shadow-lg">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="text-[#0f9dfe] text-2xl font-bold">Preview Results</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-md">
              <h3 className="font-semibold mb-3 text-[#0f9dfe]">Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-gray-600">Day</span>
                  <span className="font-bold text-gray-900">{day}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600">Total Pending</span>
                  <span className="font-bold text-gray-900">{preview.accepted.length + preview.waitlisted.length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600">Total to Accept</span>
                  <span className="font-bold text-green-600">{preview.accepted.length}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-600">Total to Waitlist</span>
                  <span className="font-bold text-yellow-600">{preview.waitlisted.length}</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto border border-gray-200 rounded-md">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">University</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Minority</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Registrants</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Allocated</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Accepted</th>
                    <th className="py-3 px-4 text-left font-semibold text-gray-700">Waitlisted</th>
                  </tr>
                </thead>
                <tbody>
                  {[...preview.results]
                    .sort((a, b) => b.registrantCount - a.registrantCount)
                    .map((r, index) => (
                      <tr 
                        key={r.university} 
                        className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}
                      >
                        <td className="py-3 px-4 text-gray-900 font-medium">{r.university}</td>
                        <td className="py-3 px-4 text-gray-700">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            r.isMinorityUniversity 
                              ? 'bg-[#fcea3f]/20 text-yellow-800' 
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {r.isMinorityUniversity ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-900">{r.registrantCount}</td>
                        <td className="py-3 px-4 text-gray-900 font-semibold">{r.allocatedSlots}</td>
                        <td className="py-3 px-4 text-green-600 font-semibold">{r.acceptedCount}</td>
                        <td className="py-3 px-4 text-yellow-600 font-semibold">{r.waitlistedCount}</td>
                      </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


