"use client";

import { ReactNode } from "react";
import { Providers } from "./Providers";
import Header from "./Header";
import BottomNavigation from "./BottomNavigation";
import { Toaster } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: ReactNode;
  className?: string;
}

export function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <Providers>
      <div className={cn("min-h-screen bg-bg font-body antialiased", className)}>
        <Header />
        <main className="pt-16 pb-24 md:pb-16 min-h-screen" id="main-content" role="main">
          {children}
        </main>
        <BottomNavigation />
        <Toaster />
      </div>
    </Providers>
  );
}