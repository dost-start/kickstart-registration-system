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
    <footer className="bg-gradient-to-b from-gray-50 to-white text-gray-900 py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
      <div className="max-w-4xl mx-auto">
        {/* Registration Status Check Section */}
        <div
          id="status-check"
          className="mb-10 sm:mb-12 relative rounded-2xl p-5 sm:p-6 md:p-8 shadow-lg overflow-hidden border border-gray-200/80 bg-white"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0f9dfe] to-[#0d8ae8]" />
          <div className="relative">
            <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 text-[#0f9dfe] text-center">
              Check Your Registration Status
            </h3>
            <p className="text-sm text-gray-500 mb-4 sm:mb-5 text-center">
              Enter your email to see your registration status
            </p>

            <div className="max-w-md mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  type="email"
                  placeholder="Enter your email address"
                  value={checkEmail}
                  onChange={(e) => setCheckEmail(e.target.value)}
                  className="h-11 sm:h-12 bg-gray-50/80 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:bg-white focus:border-[#0f9dfe] focus:ring-[#0f9dfe]/20 rounded-xl"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleStatusCheck();
                    }
                  }}
                />
                <Button
                  onClick={handleStatusCheck}
                  disabled={isChecking}
                  className="h-11 sm:h-12 px-6 sm:px-8 bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white font-semibold shadow-lg hover:shadow-[#0f9dfe]/30 transition-all duration-300 rounded-xl shrink-0"
                >
                  {isChecking ? "Checking..." : "Check"}
                </Button>
              </div>

              {checkResult && (
                <div
                  className={`p-4 sm:p-5 rounded-xl border ${
                    checkResult.success
                      ? "bg-green-50/90 border-green-200"
                      : "bg-red-50/90 border-red-200"
                  }`}
                >
                  {checkResult.success && checkResult.registrationData ? (
                    <div className="space-y-2 text-left sm:text-center">
                      <div className="flex items-center justify-center sm:justify-center gap-2">
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

        {/* Contact Section */}
        <h3 className="text-xl sm:text-2xl font-bold mb-6 sm:mb-8 text-[#0f9dfe] text-center">
          For More Information, Contact Us
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-12">
          <a
            href="https://linkedin.com/company/startdost"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-4 sm:p-5 rounded-xl bg-white hover:bg-gray-50 transition-all duration-300 group border border-gray-200 hover:border-[#0f9dfe]/40 hover:shadow-md active:scale-[0.98]"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#0a66c2]/10 flex items-center justify-center group-hover:bg-[#0a66c2]/20 transition-colors">
              <Linkedin className="w-5 h-5 sm:w-6 sm:h-6 text-[#0a66c2]" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-700">LinkedIn</span>
          </a>

          <a
            href="mailto:dost.start@gmail.com"
            className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-4 sm:p-5 rounded-xl bg-white hover:bg-gray-50 transition-all duration-300 group border border-gray-200 hover:border-orange-400/50 hover:shadow-md active:scale-[0.98]"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
              <Mail className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Email</span>
          </a>

          <a
            href="https://facebook.com/STARTDOST"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-4 sm:p-5 rounded-xl bg-white hover:bg-gray-50 transition-all duration-300 group border border-gray-200 hover:border-blue-500/50 hover:shadow-md active:scale-[0.98]"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
              <Facebook className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Facebook</span>
          </a>

          <a
            href="https://instagram.com/start_dost"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-4 sm:p-5 rounded-xl bg-white hover:bg-gray-50 transition-all duration-300 group border border-gray-200 hover:border-pink-500/50 hover:shadow-md active:scale-[0.98]"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
              <Instagram className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500" />
            </div>
            <span className="text-xs sm:text-sm font-semibold text-gray-700">Instagram</span>
          </a>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 pt-6 sm:pt-8">
          <p className="text-xs sm:text-sm text-gray-500 text-center">
            © 2026 DOST START. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
