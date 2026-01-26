'use client';
import Particles from "./ui/particles";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroBanner() {
  return (
    <div className="relative w-screen h-screen bg-gradient-to-b from-blue-900 via-blue-950 to-black">
      <div className="absolute inset-0">
        <Particles
          particleColors={['#0f9dfe', '#fcea3f']}
          particleCount={600}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
      <div className="absolute inset-0 flex flex-col pointer-events-none">
        {/* Main Content - Centered */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
          <div className="max-w-6xl mx-auto">
            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-none tracking-tight">
              <div className="bg-gradient-to-r from-white via-[#0f9dfe] to-[#fcea3f] bg-clip-text text-transparent">
                KickSTART 2026
              </div>
              <div className="text-3xl md:text-5xl lg:text-6xl font-bold text-white/90 mt-2">
                START-DOST General Assembly
              </div>
            </h1>
            
            {/* Theme */}
            <p className="text-1xl md:text-2xl lg:text-1xl text-[#fcea3f] font-light italic mb-8 max-w-5xl mx-auto leading-relaxed">
              &quot;From Scholars to Innovators: Advancing Together and Shaping the Future&quot;
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pointer-events-auto">
              <Link href="#registration-form">
                <Button
                  size="lg"
                  className="px-12 py-6 text-xl font-bold bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white shadow-2xl hover:shadow-[#0f9dfe]/25 transform hover:scale-105 transition-all duration-300 rounded-full"
                >
                  Register Now
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                asChild
                className="px-12 py-6 text-xl font-bold border-2 border-white text-white hover:bg-transparent hover:text-white shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-full backdrop-blur-sm bg-transparent"
              >
                <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" target="_blank" rel="noopener noreferrer">
                  Learn More
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Section - Call to Action with Arrow */}
        <div className="flex flex-col items-center justify-center pb-12 px-8">
          
          {/* Mouse Scroll Icon */}
          <div className="flex flex-col items-center animate-bounce">
            <div className="w-6 h-10 border-2 border-white/70 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/70 rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
          
          {/* Scroll Indicator Text */}
          <p className="text-sm text-white/60 font-light mt-4 tracking-wider uppercase">
          Join us in advancing technology and innovation for nation-building.
          </p>
        </div>
      </div>
    </div>
  );
}
