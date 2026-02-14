'use client';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import KickStartBackground from "./KickStartBackground";

export default function HeroBanner() {
  return (
    <div className="relative w-full max-w-[100vw] min-h-screen h-screen overflow-x-hidden">
      {/* Electric blue background with grid and stars */}
      <KickStartBackground />
      {/* Subtle overlay for text contrast */}
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            {/* Secondary text - START GENERAL ASSEMBLY */}
            <p className="font-sans text-sm sm:text-base md:text-xl font-light tracking-[0.15em] sm:tracking-[0.2em] text-white/90 mb-3 sm:mb-4 [text-shadow:0_0_15px_rgba(147,197,253,0.8)] uppercase">
              START GENERAL ASSEMBLY
            </p>
            {/* Main Title - KickSTART in rounded glowing border */}
            <div
              className="inline-block px-4 sm:px-6 md:px-10 lg:px-14 py-3 sm:py-4 md:py-6 rounded-full border-2 border-white/90 mb-3 sm:mb-4"
              style={{
                boxShadow: "0 0 30px rgba(147,197,253,0.8), 0 0 60px rgba(147,197,253,0.5), inset 0 0 20px rgba(255,255,255,0.1)",
              }}
            >
              <h1
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black leading-none tracking-tight text-white"
                style={{
                  fontFamily: 'var(--font-kagitingan-bold), var(--font-monument), "Arial Black", system-ui, sans-serif',
                  textShadow: "0 0 20px rgba(147,197,253,0.9), 0 0 40px rgba(147,197,253,0.6), 0 0 60px rgba(147,197,253,0.4)",
                }}
              >
                KickSTART 2026
              </h1>
            </div>
            
            {/* Theme */}
            <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-[#fcea3f] font-light italic mb-6 sm:mb-8 max-w-5xl mx-auto leading-relaxed px-1">
              &quot;Empowering Scholars, Building Innovation, and Leading Change&quot;
            </p>
            
            {/* CTA Buttons - compact on mobile, larger on desktop */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 md:gap-6 justify-center items-stretch pointer-events-auto w-full max-w-[200px] sm:max-w-[260px] md:max-w-[380px] lg:max-w-[420px] mx-auto">
              <Link href="#registration-form" className="flex-1 min-w-0 h-12 md:h-14 lg:h-16">
                <Button
                  size="lg"
                  className="w-full h-12 md:h-14 lg:h-16 px-4 sm:px-6 md:px-8 py-0 text-sm sm:text-base md:text-lg font-bold bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white shadow-2xl hover:shadow-[#0f9dfe]/25 transform hover:scale-105 transition-all duration-300 rounded-full whitespace-nowrap"
                >
                  Register Now
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="flex-1 min-w-0 h-12 md:h-14 lg:h-16 w-full px-4 sm:px-6 md:px-8 py-0 text-sm sm:text-base md:text-lg font-bold border-2 border-white text-white hover:bg-transparent hover:text-white shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-full backdrop-blur-sm bg-transparent whitespace-nowrap"
              >
                <a href="/primer.pdf" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-full h-12 md:h-14 lg:h-16 text-center whitespace-nowrap">
                  View Event Primer
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section - Call to Action with Arrow */}
        <div className="flex flex-col items-center justify-center pb-8 sm:pb-12 px-4 sm:px-8">
          
          {/* Mouse Scroll Icon */}
          <div className="flex flex-col items-center animate-bounce">
            <div className="w-6 h-10 border-2 border-white/70 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
          
          {/* Scroll Indicator Text */}
          <p className="text-xs sm:text-sm text-white/60 font-light mt-4 tracking-wider uppercase text-center max-w-[90vw]">
          Join us in advancing technology and innovation for nation-building.
          </p>
        </div>
      </div>
    </div>
  );
}
