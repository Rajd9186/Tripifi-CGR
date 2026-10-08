import Link from "next/link";

const footerLinks = {
  Explore: [
    { label: "Destinations", href: "/destinations" },
    { label: "Packages", href: "/packages" },
    { label: "Flights", href: "/flights" },
    { label: "Trains", href: "/trains" },
    { label: "Hotels", href: "/hotels" },
    { label: "Cabs", href: "/cabs" },
  ],
  Plan: [
    { label: "Trip Builder", href: "/plan" },
    { label: "AI Planner", href: "/ai" },
    { label: "Map", href: "/map" },
    { label: "Wishlist", href: "/wishlist" },
    { label: "Get Assistance", href: "/assistance" },
    { label: "Help & FAQs", href: "/help" },
  ],
  Popular: [
    { label: "Kashmir", href: "/destinations/kashmir" },
    { label: "Goa", href: "/destinations/goa" },
    { label: "Kerala", href: "/destinations/kerala" },
    { label: "Rajasthan", href: "/destinations/rajasthan" },
    { label: "Sikkim", href: "/destinations/sikkim" },
    { label: "Ladakh", href: "/destinations/ladakh" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-text">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-surface text-text shadow-soft">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
                </svg>
              </div>
              <div className="font-display text-xl font-semibold text-white">
                Tripifi CGR
              </div>
            </div>
            <p className="text-text-muted text-sm leading-relaxed max-w-md mb-6">
              Your trip. Your way. Plan, personalize and book your entire Indian
              journey in one place. Don't just book a ticket. Build the entire
              journey.
            </p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold mb-4 text-sm">
                {category}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-text-muted hover:text-white text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-navy-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-text-muted text-sm">
              © {new Date().getFullYear()} Tripifi CGR. All rights reserved.
            </p>
            <p className="text-text-muted text-sm">
              Made with care for Indian travelers
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
