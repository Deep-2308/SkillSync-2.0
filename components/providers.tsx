"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { SmoothScrollProvider } from "@/components/shared/smooth-scroll";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SmoothScrollProvider>
        {children}
        <Toaster position="top-center" richColors />
      </SmoothScrollProvider>
    </SessionProvider>
  );
}
