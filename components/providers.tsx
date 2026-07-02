"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/sonner";
import { ScrollProvider } from "@/components/providers/ScrollProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ScrollProvider>
        {children}
        <Toaster position="top-center" richColors />
      </ScrollProvider>
    </SessionProvider>
  );
}
