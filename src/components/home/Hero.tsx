import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-900/70 to-navy-900/30"
          aria-hidden="true"
        />
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
            alt="Himalayan mountains - Tripifi CGR"
            className="h-full w-full object-cover object-center animate-image-zoom"
          />
          <div className="absolute inset-0 mix-blend-screen opacity-30 animate-parallax bg-gradient-to-b from-transparent via-saffron-400/20 to-transparent" style={{ animationDuration: '30s' }} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950/60 via-indigo-950/40 to-purple-950/30 mix-blend-overlay" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,122,0,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(27,154,170,0.15),transparent_70%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent" />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-semibold tracking-tight text-white leading-tight animate-fade-up">
            Your trip. <span className="bg-gradient-to-r from-saffron-400 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-lg">Your way.</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-white/90 leading-relaxed max-w-2xl animate-fade-up-delayed">
            Plan, personalize and book your entire Indian journey in one place.
            <span className="hidden sm:inline">
              {" "}
              Don't just book a ticket. Build the entire journey.
            </span>
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 animate-fade-up-delayed-2">
            <Link href="/plan" className="btn-primary shadow-glow bg-gradient-to-r from-saffron-500 to-orange-500 hover:from-saffron-600 hover:to-orange-600">
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
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Plan a Trip
            </Link>
            <Link href="/destinations" className="btn-ghost bg-white/90 backdrop-blur hover:bg-white">
              Explore India
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

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4 text-white/80 animate-fade-up-delayed-3">
            <div className="flex items-center gap-2 text-sm animate-float-soft">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
              Verified partners across India
            </div>
            <div className="flex items-center gap-2 text-sm animate-float-soft" style={{ animationDelay: '0.5s' }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              Real-time itinerary builder
            </div>
            <div className="flex items-center gap-2 text-sm animate-float-soft" style={{ animationDelay: '1s' }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
              Secure bookings & payments
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
