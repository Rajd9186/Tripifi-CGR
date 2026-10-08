"use client";

import Hero from "@/components/hero/Hero";
import JourneyMap from "@/components/journey/JourneyMap";
import CountUp from "@/components/journey/CountUp";
import { SearchBar } from "@/components/search/SearchBar";
import DestinationCard from "@/components/destination/DestinationCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, MapPin, Star, Users, Shield, Award } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { DESTINATIONS } from "@/lib/destinations";

const FEATURES = [
  {
    icon: Sparkles,
    title: "AI-Powered Planning",
    description: "Describe your dream trip in natural language. Our AI builds detailed itineraries with real-time pricing.",
  },
  {
    icon: MapPin,
    title: "250+ Destinations",
    description: "From Himalayan peaks to tropical islands, discover every corner of India with expert local insights.",
  },
  {
    icon: Shield,
    title: "Transparent Pricing",
    description: "No hidden fees. See exact breakdowns for flights, hotels, cabs, and activities before you book.",
  },
  {
    icon: Award,
    title: "Human Assistance",
    description: "When live booking isn't available, our travel team arranges everything for you end-to-end.",
  },
];

const STATS = [
  { value: 12, suffix: "K+", label: "Happy Travellers" },
  { value: 250, suffix: "+", label: "Destinations" },
  { value: 98, suffix: "%", label: "Satisfaction Rate" },
  { value: 24, suffix: "/7", label: "Support Available" },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Search Section */}
      <section className="relative -mt-20 z-20">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <SearchBar variant="page" />
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="saffron" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              Why Tripifi CGR
            </Badge>
            <h2 className="font-display text-display-xl font-semibold tracking-tight text-text mb-4">
              Everything you need for the perfect Indian journey
            </h2>
            <p className="text-body-lg text-text-muted">
              From inspiration to booking, we handle every detail so you can focus on the experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card variant="glass-hover" padding="lg" className="h-full">
                  <motion.div
                    className="p-3 rounded-xl bg-gradient-saffron w-fit mb-6"
                    whileHover={{ scale: 1.1, rotate: 3 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <feature.icon className="h-6 w-6 text-bg" />
                  </motion.div>
                  <h3 className="font-display text-heading-md font-semibold text-text mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-body text-text-muted">{feature.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Route map — self-contained section, no overlap with other content */}
      <JourneyMap />

      {/* Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 journey-band">
        <div className="max-w-8xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <CountUp to={stat.value} suffix={stat.suffix} label={stat.label} />
                <div className="text-body text-text-muted mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Destinations */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="saffron" className="mb-4">
                <Sparkles className="mr-1 h-3 w-3" />
                Trending Now
              </Badge>
              <h2 className="font-display text-display-xl font-semibold tracking-tight text-text">
                Popular destinations this season
              </h2>
            </div>
            <Link
              href="/destinations"
              className="inline-flex min-h-[44px] items-center gap-2 text-body font-medium text-cyan hover:text-saffron transition-colors"
            >
              View all destinations
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {DESTINATIONS.slice(0, 8).map((destination, index) => (
              <DestinationCard
                key={destination.slug}
                destination={destination}
                variant="default"
                priority={index < 4}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Curated Packages */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 journey-band">
        <div className="max-w-8xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <Badge variant="saffron" className="mb-4">
                <Sparkles className="mr-1 h-3 w-3" />
                Curated Packages
              </Badge>
              <h2 className="font-display text-display-xl font-semibold tracking-tight text-text">
                Handcrafted journeys for every traveler
              </h2>
            </div>
            <Link
              href="/packages"
              className="inline-flex min-h-[44px] items-center gap-2 text-body font-medium text-cyan hover:text-saffron transition-colors"
            >
              View all packages
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <ScrollArea className="pb-4">
            <div className="flex gap-6 min-w-max">
              {[
                {
                  slug: "sikkim-escape",
                  title: "Sikkim Escape",
                  destination: "Sikkim",
                  duration: "5 Nights / 6 Days",
                  route: "NJP → Gangtok → Pelling → NJP",
                  base_price: 69998,
                  tags: ["mountains", "honeymoon", "comfortable"],
                },
                {
                  slug: "kashmir-paradise",
                  title: "Kashmir Paradise",
                  destination: "Kashmir",
                  duration: "5 Nights / 6 Days",
                  route: "Srinagar → Gulmarg → Pahalgam",
                  base_price: 42999,
                  tags: ["lakes", "scenic", "luxury"],
                },
                {
                  slug: "kerala-backwaters",
                  title: "Kerala Backwaters",
                  destination: "Kerala",
                  duration: "5 Nights / 6 Days",
                  route: "Kochi → Munnar → Alleppey → Kovalam",
                  base_price: 54999,
                  tags: ["backwaters", "romantic", "wellness"],
                },
                {
                  slug: "goa-beach",
                  title: "Goa Beach Bliss",
                  destination: "Goa",
                  duration: "3 Nights / 4 Days",
                  route: "North Goa → South Goa",
                  base_price: 28999,
                  tags: ["beaches", "nightlife", "relaxing"],
                },
                {
                  slug: "rajasthan-royal",
                  title: "Rajasthan Royal",
                  destination: "Rajasthan",
                  duration: "6 Nights / 7 Days",
                  route: "Jaipur → Jodhpur → Udaipur → Jaisalmer",
                  base_price: 79999,
                  tags: ["heritage", "luxury", "culture"],
                },
              ].map((pkg, index) => (
                <motion.div
                  key={pkg.slug}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="w-80 sm:w-96 flex-shrink-0"
                >
                  <Link href={`/packages/${pkg.slug}`}>
                    <Card variant="glass-hover" padding="none" className="h-full overflow-hidden">
                      <div className="relative h-48 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-hero" />
                        <div className="absolute inset-0 bg-gradient-aurora opacity-30" />
                      </div>
                      <div className="p-6">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {pkg.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="default" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                        <h3 className="font-display text-lg font-semibold text-text mb-2">{pkg.title}</h3>
                        <p className="text-sm text-text-muted mb-2">{pkg.route}</p>
                        <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
                          <span>{pkg.duration}</span>
                        </div>
                        <div className="flex items-end justify-between pt-4 border-t border-border">
                          <div>
                            <div className="text-2xl font-semibold text-text">₹{pkg.base_price.toLocaleString("en-IN")}</div>
                            <div className="text-xs text-text-muted">per person</div>
                          </div>
                          <Button size="sm" variant="ghost">
                            View Details
                            <ArrowRight className="ml-1 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge variant="saffron" className="mb-4">
              <Sparkles className="mr-1 h-3 w-3" />
              Built for Indian Travelers
            </Badge>
            <h2 className="font-display text-display-xl font-semibold tracking-tight text-text mb-4">
              Why travelers choose Tripifi CGR
            </h2>
            <p className="text-body-lg text-text-muted">
              We understand Indian travel like no one else. Every feature is designed for your journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Local Expertise",
                items: [
                  "Permits for restricted areas (Nathula, Rohtang, Inner Line)",
                  "Festival calendars & best-time recommendations",
                  "Regional cuisine & hidden gem recommendations",
                  "Verified local operators & guides",
                ],
              },
              {
                icon: MapPin,
                title: "Seamless Logistics",
                items: [
                  "Multi-modal transport: flights, trains, cabs, ferries",
                  "Real-time pricing from multiple providers",
                  "Door-to-door transfers included",
                  "Dynamic re-routing for delays",
                ],
              },
              {
                icon: Shield,
                title: "Peace of Mind",
                items: [
                  "No hidden fees or surprise charges",
                  "24/7 WhatsApp support during travel",
                  "Assisted booking for unavailable inventory",
                  "Flexible cancellation & rescheduling",
                ],
              },
            ].map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Card variant="glass-hover" padding="lg" className="h-full">
                  <motion.div
                    className="p-3 rounded-xl bg-gradient-cyan w-fit mb-6"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <category.icon className="h-6 w-6 text-bg" />
                  </motion.div>
                  <h3 className="font-display text-heading-md font-semibold text-text mb-4">
                    {category.title}
                  </h3>
                  <ul className="space-y-3">
                    {category.items.map((item, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        className="flex items-start gap-3 text-body text-text-muted"
                      >
                        <div className="flex-shrink-0 mt-1.5 w-2 h-2 rounded-full bg-saffron" />
                        <span>{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-8xl mx-auto">
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 sm:p-20 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="absolute inset-0 bg-gradient-aurora opacity-30" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 256 256%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')] opacity-5" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <Badge variant="saffron" className="mb-6 inline-block">
                <Sparkles className="mr-1 h-3 w-3" />
                Ready to explore?
              </Badge>
              <h2 className="font-display text-display-xl font-semibold tracking-tight text-white mb-6">
                Your perfect Indian journey starts here
              </h2>
              <p className="text-body-lg text-white/80 mb-8 max-w-2xl mx-auto">
                Join thousands of travelers who've discovered India their way with Tripifi CGR.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="xl" variant="saffron" glow className="min-w-[200px]">
                  <Sparkles className="mr-2 h-5 w-5" />
                  Plan My Trip with AI
                </Button>
                <Link href="/destinations">
                  <Button size="xl" variant="outline" className="min-w-[200px] border-white/30 text-white hover:bg-white/10">
                    Browse Destinations
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}