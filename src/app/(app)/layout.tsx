import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import Footer from "@/components/layout/Footer";
import { JourneyBackdrop } from "@/components/layout/JourneyBackdrop";
import { AITripPlanner } from "@/components/ai/AITripPlanner";
import { PageTransition } from "@/components/ui/PageTransition";
import { Toaster } from "@/components/ui/toast";
import ToastContainer from "@/components/ui/ToastContainer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <JourneyBackdrop />
      <Header />
      <main id="main-content" className="relative z-10 flex-1 pt-16 md:pt-[var(--header-h)]">
        <PageTransition>{children}</PageTransition>
      </main>
      {/* pb-nav = bottom-nav height + safe area on mobile, 0 on desktop (already in globals.css) */}
      <div className="relative z-10 pb-nav">
        <Footer />
      </div>
      <BottomNavigation />
      <AITripPlanner />
      <Toaster />
      <ToastContainer />
    </div>
  );
}
