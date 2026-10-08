const features = [
  {
    title: "Your trip. Your way.",
    description:
      "Build your entire journey from flights, trains, cabs, hotels and experiences - all in one place.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3"></circle>
        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
      </svg>
    ),
  },
  {
    title: "AI-Powered Planning",
    description:
      "Tell Tripifi CGR what you want and get a personalized itinerary tailored to your budget and preferences.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2L9.5 9.5H2L8 14L6 21L12 16L18 21L16 14L22 9.5H14.5L12 2Z" />
      </svg>
    ),
  },
  {
    title: "Complete Journey View",
    description:
      "See flights, transfers, stays, activities and costs in one unified view - never lose track again.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="9 11 12 14 22 4"></polyline>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
      </svg>
    ),
  },
  {
    title: "Premium Indian Travel",
    description:
      "Curated for Indian travelers with verified partners, transparent pricing and trusted support.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
  },
];

export default function WhyUs() {
  return (
    <section className="mt-16 mb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold text-ink-900">
            Why Tripifi CGR
          </h2>
          <p className="mt-3 text-base text-ink-600">
            One platform. Every journey. Built for the way Indians travel.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <div key={feature.title} className="card p-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-text mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-ink-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-ink-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
