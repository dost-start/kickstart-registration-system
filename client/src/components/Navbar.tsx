'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CircleCheckBig, UserPlus } from "lucide-react";

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className="fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-7xl px-4">
      <div className={`relative backdrop-blur-2xl shadow-2xl rounded-full px-4 sm:px-8 lg:px-12 py-3 sm:py-4 w-full overflow-hidden transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 border border-gray-200' 
          : 'bg-white/10 border border-white/20'
      }`}>
        {/* Liquid glass gradient overlay */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isScrolled
            ? 'bg-gradient-to-r from-gray-50/50 via-white/30 to-gray-50/50'
            : 'bg-gradient-to-r from-white/5 via-white/10 to-white/5'
        }`}></div>
        {/* Subtle inner glow */}
        <div className={`absolute inset-0 rounded-full transition-all duration-300 ${
          isScrolled
            ? 'bg-gradient-to-b from-gray-100/30 to-transparent'
            : 'bg-gradient-to-b from-white/20 to-transparent'
        }`}></div>
        
        <div className="relative flex items-center justify-between w-full">
          <div className="flex items-center">
            <Image
              src="/logo-s.png"
              alt="START Logo"
              width={120}
              height={40}
              priority
              className="h-6 sm:h-8 lg:h-10 w-auto drop-shadow-lg"
            />
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6">
            <Link href="#status-check">
              <button
                style={{
                  '--button-text-color': isScrolled ? '#111827' : '#ffffff',
                } as React.CSSProperties}
                className={`px-3 sm:px-4 lg:px-6 py-2 font-bold border-2 backdrop-blur-sm transition-all duration-300 rounded-full text-xs sm:text-sm shadow-lg inline-flex items-center justify-center gap-2 whitespace-nowrap ${
                  isScrolled
                    ? 'border-gray-300 bg-white hover:bg-gray-100 hover:border-gray-400 text-gray-900'
                    : 'border-white/30 bg-transparent hover:bg-white/10 hover:border-white/50 text-white'
                }`}
              >
                <span className={`hidden md:inline ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                  Check Registration Status
                </span>
                <span className={`sm:inline md:hidden ${isScrolled ? 'text-gray-900' : 'text-white'}`}>
                  Check Status
                </span>
                <CircleCheckBig className={`inline sm:hidden w-4 h-4 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
              </button>
            </Link>
            <Link href="#registration-form">
              <Button className="font-bold px-4 sm:px-6 lg:px-8 py-2 bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white shadow-xl hover:shadow-[#0f9dfe]/30 transform hover:scale-105 transition-all duration-300 rounded-full text-xs sm:text-sm backdrop-blur-sm border border-[#0f9dfe]/20">
                <span className="hidden sm:inline">Register Now</span>
                <span className="sm:hidden">Register</span>
                <UserPlus className="inline sm:hidden w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
