import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, FileText, XCircle } from "lucide-react";
import Link from "next/link";
import { verifyRegistration } from "@/app/actions/verify-registration";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Registration Successful - KickSTART 2026: START-DOST General Assembly",
  description:
    "Your registration for KickSTART 2026 has been successfully completed. We will contact you soon via email.",
  openGraph: {
    title: "Registration Successful - KickSTART 2026: START-DOST General Assembly",
    description:
      "Your registration for KickSTART 2026 has been successfully completed. We will contact you soon via email.",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dsz9ok0yq/image/upload/v1751719220/SUMMIT_cbyrru.png",
        width: 1200,
        height: 630,
        alt: "KickSTART 2026: START-DOST General Assembly",
      },
    ],
  },
};

interface SuccessPageProps {
  searchParams: Promise<{ e?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const encodedEmail = params.e;

  // If no email parameter, redirect to home
  if (!encodedEmail) {
    redirect("/");
  }

  // Verify the registration server-side
  const verificationResult = await verifyRegistration(encodedEmail);

  // If verification failed, show error state
  if (!verificationResult.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-950 to-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center relative bg-white/10 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl border border-white/20 overflow-hidden">
          {/* Glass gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-pink-500/10 to-red-500/5 rounded-2xl"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-2xl"></div>
          
          <div className="relative">
            {/* Error Icon */}
            <div className="flex justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-red-400/30">
                <XCircle className="w-12 h-12 text-red-400" />
              </div>
            </div>

            {/* Error Message */}
            <div className="mb-8">
              <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight bg-gradient-to-r from-white via-red-200 to-pink-300 bg-clip-text text-transparent">
                Registration Not Found
              </h1>
              <p className="text-xl text-white/70 mb-6">
                We couldn&apos;t verify your registration. Please try registering
                again.
              </p>
            </div>

            {/* Action Button */}
            <Button
              size="lg"
              asChild
              className="w-full max-w-[250px] font-bold px-8 py-4 text-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-300 rounded-full"
            >
              <Link href="/">Back to Registration</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { registrationData } = verificationResult;
  return (
    <div className="py-12 min-h-screen bg-gradient-to-br from-blue-900 via-blue-950 to-black flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto text-center relative bg-white/10 backdrop-blur-2xl rounded-2xl p-8 shadow-2xl border border-white/20 overflow-hidden">
        {/* Glass gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-yellow-500/10 to-orange-500/5 rounded-2xl"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-2xl"></div>
        
        <div className="relative">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-green-400/30">
              <CheckCircle className="w-12 h-12 text-green-400" />
            </div>
          </div>

          {/* Main Message */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4 leading-tight bg-gradient-to-r from-white via-orange-200 to-yellow-300 bg-clip-text text-transparent">
              Registration Successful!
            </h1>
            <p className="text-xl text-white/90 mb-2">
              Thank you,{" "}
              <strong className="text-orange-300">
                {registrationData?.firstName} {registrationData?.lastName}
              </strong>
              !
            </p>
            <p className="text-lg text-white/70">
              Your registration for KickSTART 2026: START-DOST General Assembly has been
              confirmed.
            </p>
          </div>

          {/* Registration Status */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-6">
            <div className="flex items-center justify-center mb-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm border ${
                  registrationData?.status === "accepted"
                    ? "bg-green-500/20 border-green-400/30"
                    : registrationData?.status === "rejected"
                    ? "bg-red-500/20 border-red-400/30"
                    : "bg-yellow-500/20 border-yellow-400/30"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    registrationData?.status === "accepted"
                      ? "bg-green-400"
                      : registrationData?.status === "rejected"
                      ? "bg-red-400"
                      : "bg-yellow-400"
                  }`}
                ></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Registration Status
            </h3>
            <p className="text-white/90">
              Status:{" "}
              <span className="font-bold capitalize text-orange-300">
                {registrationData?.status || "Pending"}
              </span>
            </p>
            <p className="text-sm text-white/70 mt-1">
              Email: {registrationData?.email}
            </p>
          </div>

          {/* Email Notification Card */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-blue-400/30">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-3">
              Check Your Email
            </h3>
            <p className="text-white/90 leading-relaxed">
              We will send you an email regarding the status of your registration.
              Please check your inbox (and spam folder) for updates about your
              application.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              asChild
              className="w-full max-w-[250px] font-bold px-8 py-4 text-lg bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white shadow-2xl hover:shadow-orange-500/25 transform hover:scale-105 transition-all duration-300 rounded-full"
            >
              <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer">
                <FileText className="w-5 h-5 mr-2" />
                View Primer
              </a>
            </Button>

            <Button
              variant="outline"
              size="lg"
              asChild
              className="w-full max-w-[250px] font-bold px-8 py-4 text-lg border-2 border-white/30 text-white hover:bg-white/10 hover:border-white/50 transform hover:scale-105 transition-all duration-300 rounded-full backdrop-blur-sm"
            >
              <Link href="/">Back to Home</Link>
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-12 text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <h4 className="font-bold text-white mb-2">
                What&apos;s Next?
              </h4>
              <p className="text-sm text-white/90">
                Our team will review your registration and send you confirmation
                details. Make sure to mark <strong className="text-orange-300">January 24, 2026</strong> on
                your calendar!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
