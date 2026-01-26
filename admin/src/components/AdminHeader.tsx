"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";

import { signOut } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
  showTitle?: boolean;
  children?: React.ReactNode;
}

export function AdminHeader({
  title,
  subtitle = "KickSTART 2026: START-DOST General Assembly",
  showBackButton = false,
  backButtonText,
  backButtonHref,
  showTitle = true,
  children,
}: AdminHeaderProps) {
  const pathname = usePathname();
  
  // Auto-detect back button destination based on current route
  let defaultBackHref = "/kickstart";
  let defaultBackText = "Back to Dashboard";
  
  if (pathname?.includes("/check-in")) {
    defaultBackHref = "/kickstart/manage";
    defaultBackText = "Back to Manage";
  } else if (pathname?.includes("/allocations")) {
    defaultBackHref = "/kickstart/manage";
    defaultBackText = "Back to Manage";
  }
  
  // Use provided values or defaults
  const finalBackHref = backButtonHref || defaultBackHref;
  const finalBackText = backButtonText || defaultBackText;
  return (
    <header className="fixed top-4 sm:top-6 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-7xl px-4">
      <div className="relative bg-white shadow-lg border border-gray-200 rounded-full px-4 sm:px-8 lg:px-12 py-3 sm:py-4 w-full overflow-hidden">
        <div className="relative flex items-center justify-between w-full">
          <div className="flex items-center space-x-2 sm:space-x-4">
            {showBackButton && (
              <>
                <Link href={finalBackHref}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 rounded-full text-xs sm:text-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">{finalBackText}</span>
                    <span className="sm:hidden">Back</span>
                  </Button>
                </Link>
                <div className="h-6 border-l border-gray-300"></div>
              </>
            )}
            <Link href="/">
              <Image
                src="/logo-s.png"
                alt="NADS Logo"
                width={120}
                height={40}
                priority
                className="h-6 sm:h-8 lg:h-10 w-auto"
              />
            </Link>
            {showTitle && title && (
            <div className="hidden md:block">
                <h1 className="text-lg sm:text-xl font-bold text-[#0f9dfe]">
                {title}
              </h1>
                {subtitle && (
                  <p className="text-xs sm:text-sm text-gray-600">{subtitle}</p>
                )}
            </div>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            {children}
            <form action={signOut}>
              <Button 
                variant="outline" 
                type="submit" 
                size="sm"
                className="px-3 sm:px-4 py-2 font-bold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 rounded-full text-xs sm:text-sm"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </form>
          </div>
        </div>
      </div>
    </header>
  );
}
