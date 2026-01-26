"use client";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import Image from "next/image";

import { signIn } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { redirect } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button 
      type="submit" 
      className="w-full font-bold px-8 py-4 text-lg bg-[#0f9dfe] hover:bg-[#0d8ae8] text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-full disabled:opacity-50 disabled:transform-none" 
      disabled={pending}
    >
      {pending ? "Signing in..." : "Sign In"}
    </Button>
  );
}

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setError(null);
    const result = await signIn(formData);

    if (result?.error) {
      setError(result.error);
    } else {
      redirect("/kickstart");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md relative bg-white rounded-2xl p-8 shadow-lg border border-gray-200 overflow-hidden">
        <div className="relative">
          {/* Header */}
          <div className="space-y-6 text-center mb-8">
            <div className="flex justify-center">
              <Image
                src="/logo-s.png"
                alt="NADS Logo"
                width={80}
                height={10}
                priority
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2 text-[#0f9dfe]">
                START Admin Portal
              </h1>
              <p className="text-gray-600">
                Sign in to access the KickSTART 2026 management dashboard
              </p>
            </div>
          </div>

          {/* Login Form */}
          <form action={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-semibold">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-[#0f9dfe] focus:ring-[#0f9dfe]/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-semibold">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                required
                minLength={6}
                className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-[#0f9dfe] focus:ring-[#0f9dfe]/20"
              />
            </div>

            <SubmitButton />
          </form>
        </div>
      </div>
    </div>
  );
}
