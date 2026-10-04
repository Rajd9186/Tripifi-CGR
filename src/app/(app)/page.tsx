import Hero from "@/components/home/Hero";
import BookingCommandCenter from "@/components/home/BookingCommandCenter";
import AIAssistant from "@/components/home/AIAssistant";
import TrendingDestinations from "@/components/home/TrendingDestinations";
import CuratedPackages from "@/components/home/CuratedPackages";
import WhyUs from "@/components/home/WhyUs";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BookingCommandCenter />
      <AIAssistant />
      <TrendingDestinations />
      <CuratedPackages />
      <WhyUs />
    </>
  );
}
