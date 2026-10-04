import Navbar from "@/components/layout/Navbar";
import MobileNav from "@/components/layout/MobileNav";
import Footer from "@/components/layout/Footer";
import ToastContainer from "@/components/ui/ToastContainer";
import AIChatButton from "@/components/ai/AIChatButton";
import { PageTransition } from "@/components/ui/PageTransition";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-[var(--header-h)]">
        <PageTransition>{children}</PageTransition>
      </main>
      <MobileNav />
      <Footer />
      <ToastContainer />
      <AIChatButton />
    </>
  );
}
