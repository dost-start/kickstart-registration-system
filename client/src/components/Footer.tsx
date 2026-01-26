"use client";

import {
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyRegistration } from "@/app/actions/verify-registration";

export default function Footer() {
  const [checkEmail, setCheckEmail] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<{
    success: boolean;
    message: string;
    registrationData?: {
      firstName: string;
      lastName: string;
      email: string | null;
      status: "pending" | "rejected" | "accepted" | "waitlisted";
      createdAt: string;
    } | null;
  } | null>(null);

  const handleStatusCheck = async () => {
    if (!checkEmail || !checkEmail.includes("@")) {
      setCheckResult({
        success: false,
        message: "Please enter a valid email address",
      });
      return;
    }

    setIsChecking(true);
    setCheckResult(null);

    try {
      // Encode email to base64 for verification
      const encodedEmail = Buffer.from(checkEmail).toString("base64");
      const result = await verifyRegistration(encodedEmail);

      setCheckResult(result);
    } catch {
      setCheckResult({
        success: false,
        message: "Failed to check registration status",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "waitlisted":
        return <Clock className="w-4 h-4 text-purple-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "accepted":
        return "text-green-400";
      case "rejected":
        return "text-red-400";
      case "waitlisted":
        return "text-purple-400";
      default:
        return "text-yellow-400";
    }
  };
  return (
    <footer className="bg-white text-gray-900 py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div className="max-w-4xl mx-auto text-center">
        {/* Registration Status Check Section */}
        <div className="mb-8 relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 overflow-hidden">
          <div className="relative">
            <h3 className="text-xl font-bold mb-6 text-[#0f9dfe]">
              Check Your Registration Status
            </h3>

            <div className="max-w-md mx-auto space-y-4" id="status-check">
              <div className="flex gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={checkEmail}
                  onChange={(e) => setCheckEmail(e.target.value)}
                  className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-[#0f9dfe] focus:ring-[#0f9dfe]/20"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleStatusCheck();
                    }
                  }}
                />
                <Button
                  onClick={handleStatusCheck}
                  disabled={isChecking}
                  className="px-6 bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white shadow-lg hover:shadow-[#0f9dfe]/25 transform hover:scale-105 transition-all duration-300 rounded-full"
                >
                  {isChecking ? "Checking..." : "Check"}
                </Button>
              </div>

              {checkResult && (
                <div
                  className={`p-4 rounded-xl border backdrop-blur-sm ${
                    checkResult.success
                      ? "bg-green-500/20 border-green-400/30"
                      : "bg-red-500/20 border-red-400/30"
                  }`}
                >
                  {checkResult.success && checkResult.registrationData ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-center gap-2">
                        {getStatusIcon(checkResult.registrationData.status)}
                        <span className="font-semibold text-gray-900">Registration Found</span>
                      </div>
                      <p className="text-sm text-gray-700">
                        Name: {checkResult.registrationData.firstName}{" "}
                        {checkResult.registrationData.lastName}
                      </p>
                      <p className="text-sm">
                        Status:{" "}
                        <span
                          className={`font-bold ${getStatusColor(
                            checkResult.registrationData.status
                          )}`}
                        >
                          {checkResult.registrationData.status
                            ?.charAt(0)
                            .toUpperCase() +
                            checkResult.registrationData.status?.slice(1)}
                        </span>
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-red-600">{checkResult.message}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <h3 className="text-2xl font-bold mb-8 text-[#0f9dfe]">
          For More Information, Contact Us
        </h3>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* LinkedIn */}
          <a
            href="https://linkedin.com/company/startdost"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white hover:bg-gray-50 transition-all duration-300 group border border-gray-200 hover:border-[#0f9dfe]/50 hover:shadow-[#0f9dfe]/25"
          >
            <Linkedin className="w-6 h-6 text-teal-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-gray-700">LinkedIn</span>
          </a>

          {/* Email */}
          <a
            href="mailto:dost.start@gmail.com"
            className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 group backdrop-blur-sm border border-white/20 hover:border-orange-400/50 hover:shadow-orange-500/25"
          >
            <Mail className="w-6 h-6 text-orange-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-gray-700">Email</span>
          </a>

          {/* Facebook */}
          <a
            href="https://facebook.com/STARTDOST"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 group backdrop-blur-sm border border-white/20 hover:border-blue-400/50 hover:shadow-blue-500/25"
          >
            <Facebook className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-gray-700">Facebook</span>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com/start_dost"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 group backdrop-blur-sm border border-white/20 hover:border-pink-400/50 hover:shadow-pink-500/25"
          >
            <Instagram className="w-6 h-6 text-pink-400 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-semibold text-gray-700">Instagram</span>
          </a>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <p className="text-sm text-gray-600">
            © 2025 DOST START. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
