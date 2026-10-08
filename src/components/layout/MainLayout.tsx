"use client";

import { ReactNode } from "react";
import { Providers } from "./Providers";
import Header from "./Header";
import BottomNavigation from "./BottomNavigation";
import Footer from "./Footer";
import GoldenHourSky from "@/components/scene/GoldenHourSky";
import { AITripPlanner } from "@/components/ai/AITripPlanner";
import { Toaster } from "@/components/ui/toast";
import ToastContainer from "@/components/ui/ToastContainer";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

/** Standalone layout mirror (the app actually uses `src/app/(app)/layout.tsx`). */
export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <Providers>
      <div className={cn("relative flex min-h-screen flex-col bg-bg font-body antialiased", className)}>
        <GoldenHourSky />
        <Header />
        <main
          className="relative z-10 min-h-screen flex-1 pt-16 pb-[var(--content-pb-mobile)] md:pt-[var(--header-h)] md:pb-0"
          id="main-content"
          role="main"
        >
          {children}
        </main>
        <Footer />
        <BottomNavigation />
        <AITripPlanner />
        <ToastContainer />
        <Toaster />
      </div>
    </Providers>
  );
}
