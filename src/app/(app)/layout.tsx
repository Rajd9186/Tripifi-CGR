import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import Footer from "@/components/layout/Footer";
import GoldenHourSky from "@/components/scene/GoldenHourSky";
import { AITripPlanner } from "@/components/ai/AITripPlanner";
import { PageTransition } from "@/components/ui/PageTransition";
import { Toaster } from "@/components/ui/toast";
import ToastContainer from "@/components/ui/ToastContainer";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col">
      <GoldenHourSky />
      <Header />
      <main
        id="main-content"
        className="relative z-10 flex-1 pt-16 pb-[var(--content-pb-mobile)] md:pt-[var(--header-h)] md:pb-0"
      >
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <BottomNavigation />
      <AITripPlanner />
      <ToastContainer />
      <Toaster />
    </div>
  );
}
