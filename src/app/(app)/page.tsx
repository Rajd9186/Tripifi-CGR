import Hero from "@/components/home/Hero";
import BookingCommandCenter from "@/components/home/BookingCommandCenter";
import AIAssistant from "@/components/home/AIAssistant";
import TrendingDestinations from "@/components/home/TrendingDestinations";
import CuratedPackages from "@/components/home/CuratedPackages";
import WhyUs from "@/components/home/WhyUs";
import Statistics from "@/components/home/Statistics";
import { SectionReveal } from "@/components/ui/Motion";

export default function HomePage() {
  return (
    <>
      <Hero />
      <BookingCommandCenter />
      <SectionReveal>
        <AIAssistant />
      </SectionReveal>
      <SectionReveal>
        <Statistics />
      </SectionReveal>
      <SectionReveal>
        <TrendingDestinations />
      </SectionReveal>
      <SectionReveal>
        <CuratedPackages />
      </SectionReveal>
      <SectionReveal>
        <WhyUs />
      </SectionReveal>
    </>
  );
}
