import Link from "next/link";

const packages = [
  {
    slug: "sikkim-escape",
    title: "Sikkim Escape",
    route: "Gangtok → Pelling → Darjeeling",
    duration: "5 Nights / 6 Days",
    price: 49999,
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=80",
    tags: ["Mountains", "Honeymoon", "Comfortable"],
  },
  {
    slug: "kashmir-paradise",
    title: "Kashmir Paradise",
    route: "Srinagar → Gulmarg → Pahalgam",
    duration: "5 Nights / 6 Days",
    price: 42999,
    image: "https://images.unsplash.com/photo-1584285405429-136bf988919c?w=1200&q=80",
    tags: ["Lakes", "Scenic", "Luxury"],
  },
  {
    slug: "kerala-backwaters",
    title: "Kerala Backwaters",
    route: "Kochi → Munnar → Alleppey",
    duration: "4 Nights / 5 Days",
    price: 34999,
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&q=80",
    tags: ["Relax", "Nature", "Food"],
  },
  {
    slug: "rajasthan-royal",
    title: "Rajasthan Royal Trail",
    route: "Jaipur → Jodhpur → Udaipur",
    duration: "5 Nights / 6 Days",
    price: 39999,
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&q=80",
    tags: ["Heritage", "Culture", "Fort & Palaces"],
  },
];

export default function CuratedPackages() {
  return (
    <section className="mt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
              Curated Packages
            </h2>
            <p className="mt-1 text-base text-ink-600">
              Handcrafted itineraries for every kind of traveler
            </p>
          </div>
          <Link
            href="/packages"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-navy-900 hover:gap-3 transition-all"
          >
            View all packages
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
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {packages.map((pkg) => (
            <Link
              key={pkg.slug}
              href={`/packages/${pkg.slug}`}
              className="card group overflow-hidden flex flex-col h-full"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={pkg.image}
                  alt={pkg.title}
                  className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-display text-lg font-semibold text-ink-900">
                  {pkg.title}
                </h3>
                <p className="text-sm text-ink-600 mt-1">{pkg.route}</p>
                <div className="mt-2 text-sm text-ink-600">{pkg.duration}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {pkg.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex rounded-full bg-ink-50 px-2.5 py-1 text-xs font-medium text-ink-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-auto pt-4 flex items-end justify-between">
                  <div>
                    <span className="text-xs text-ink-500">Starting from</span>
                    <div className="text-xl font-semibold text-ink-900">
                      ₹{pkg.price.toLocaleString("en-IN")}
                    </div>
                  </div>
                  <span className="btn-ghost px-3 py-2 text-sm group-hover:border-navy-300 group-hover:bg-navy-50">
                    View
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
