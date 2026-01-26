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
  title: "KickSTART 2026: START-DOST General Assembly",
  description: "KickSTART 2026 is the official regional leg of the START-DOST General Assembly. It aims to unite DOST scholars, strengthen collaboration, and empower youth leaders in technology and innovation for nation-building.",
  keywords: "kickstart, DOST, scholars, assembly, START, technology, innovation, nation-building, Philippines, Region IV-A",
  openGraph: {
    title: "KickSTART 2026: START-DOST General Assembly",
    description: "KickSTART 2026 is the official regional leg of the START-DOST General Assembly. It aims to unite DOST scholars, strengthen collaboration, and empower youth leaders in technology and innovation for nation-building.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KickSTART 2026: START-DOST General Assembly",
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
