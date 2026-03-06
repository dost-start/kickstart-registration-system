import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail, FileText, XCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { verifyRegistration } from "@/app/actions/verify-registration";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Event dates per island (matches EventDetails)
const ISLAND_EVENT_DATES: Record<string, string> = {
  Luzon: "February 28, 2026",
  Visayas: "March 7, 2026",
  Mindanao: "March 14, 2026",
};

export const metadata: Metadata = {
  title: "Registration Successful - KickSTART 2026",
  description:
    "Your registration for KickSTART 2026 has been successfully completed. We will contact you soon via email.",
  openGraph: {
    title: "Registration Successful - KickSTART 2026",
    description:
      "Your registration for KickSTART 2026 has been successfully completed. We will contact you soon via email.",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dsz9ok0yq/image/upload/v1751719220/SUMMIT_cbyrru.png",
        width: 1200,
        height: 630,
        alt: "KickSTART 2026",
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
      <div className="min-h-screen bg-gradient-to-b from-[#e0f3ff] via-white to-white">
        <Navbar />
        <div className="pt-32 pb-16 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto text-center relative bg-white rounded-2xl p-8 sm:p-10 shadow-2xl border border-gray-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent rounded-2xl" />
            <div className="relative">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-100 border border-red-200 flex items-center justify-center">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                Registration Not Found
              </h1>
              <p className="text-gray-600 mb-8">
                We couldn&apos;t verify your registration. Please try registering again.
              </p>
              <Button size="lg" asChild className="font-semibold rounded-full">
                <Link href="/kickstart#registration-form">Back to Registration</Link>
              </Button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const { registrationData } = verificationResult;
  const eventDate = registrationData?.island
    ? ISLAND_EVENT_DATES[registrationData.island]
    : null;
  const hasEventDate = eventDate && eventDate !== "TBA";

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e0f3ff] via-white to-white">
      <Navbar />
      <div className="pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="relative bg-white rounded-2xl p-8 sm:p-10 shadow-2xl border border-gray-200 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0f9dfe]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#fcea3f]/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-emerald-100 border border-emerald-200 mb-6">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Registration Successful!
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Thank you,{" "}
                <span className="font-semibold text-[#0f9dfe]">
                  {registrationData?.firstName} {registrationData?.lastName}
                </span>
                ! Your registration for KickSTART 2026 has been confirmed.
              </p>

              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-8 ${
                  registrationData?.status === "accepted"
                    ? "bg-emerald-100 text-emerald-800"
                    : registrationData?.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    registrationData?.status === "accepted"
                      ? "bg-emerald-500"
                      : registrationData?.status === "rejected"
                      ? "bg-red-500"
                      : "bg-amber-500"
                  }`}
                />
                Status: {registrationData?.status || "Pending"}
              </div>
            </div>

            <div className={`grid gap-4 mb-8 ${hasEventDate ? "sm:grid-cols-2" : ""}`}>
              <div className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#0f9dfe]/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-[#0f9dfe]" />
                </div>
                <div className="text-left min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1">Check Your Email</h3>
                  <p className="text-sm text-gray-600">
                    We&apos;ll send updates to {registrationData?.email}
                  </p>
                </div>
              </div>

              {hasEventDate && (
                <div className="flex gap-4 p-4 rounded-xl bg-[#fcea3f]/10 border border-[#fcea3f]/30">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#fcea3f]/20 flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-amber-700" />
                  </div>
                  <div className="text-left min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">Mark Your Calendar</h3>
                    <p className="text-sm text-gray-700 font-medium">{eventDate}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl p-6 bg-gray-50 border border-gray-100 mb-8">
              <h4 className="font-semibold text-gray-900 mb-2">What&apos;s Next?</h4>
              <p className="text-sm text-gray-600">
                Our team will review your registration and send you confirmation details.
                {hasEventDate ? (
                  <> KickSTART {registrationData?.island} is on{" "}
                    <strong className="text-[#0f9dfe]">{eventDate}</strong>. Add it to your calendar!
                  </>
                ) : (
                  <> We will notify you of the event date once confirmed.</>
                )}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                asChild
                className="w-full sm:w-auto font-semibold rounded-full shadow-lg bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white"
              >
                <a href="/primer.pdf" target="_blank" rel="noopener noreferrer">
                  <FileText className="w-5 h-5 mr-2" />
                  View Primer
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="w-full sm:w-auto font-semibold rounded-full border-2"
              >
                <Link href="/kickstart">Back to Home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
