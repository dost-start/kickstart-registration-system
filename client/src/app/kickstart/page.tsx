import { Metadata } from "next";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import EventDetails from "@/components/EventDetails";
import RegistrationForm from "@/components/registration-form/RegistrationForm";
import RegistrationClosed from "@/components/RegistrationClosed";
import Footer from "@/components/Footer";
import { getEventRegistrationStatus } from "@/app/actions/event-status";

// Disable caching to ensure real-time status updates
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "KickSTART 2026",
  description: "KickSTART 2026 is the official General Assembly of START-DOST, uniting DOST-SEI scholars across Luzon, Visayas, and Mindanao. A nationwide convergence of innovation, collaboration, and leadership for nation-building.",
  keywords: "kickstart, DOST, scholars, assembly, START, technology, innovation, nation-building, Philippines, Luzon, Visayas, Mindanao",
  openGraph: {
    title: "KickSTART 2026",
    description: "KickSTART 2026 is the official General Assembly of START-DOST, uniting DOST-SEI scholars across Luzon, Visayas, and Mindanao for innovation and nation-building.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KickSTART 2026",
      },
    ],
  },
};

export default async function Home() {
  // Check if registration is closed (no caching to ensure real-time status)
  const isRegistrationClosed = await getEventRegistrationStatus();

  return (
    <div className="relative">
      {/* Navbar */}
      <Navbar />
      {/* Hero Section */}
      <HeroBanner />

      {/* Event Details Section */}
      <EventDetails />

      {/* Registration Form Section - Conditional */}
      {isRegistrationClosed ? <RegistrationClosed /> : <RegistrationForm />}

      {/* Footer */}
      <Footer />
    </div>
  );
}
