import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0B1026] px-6 text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(120%_55%_at_50%_108%,rgba(255,180,84,0.28),transparent_70%)]"
      />
      <p className="relative font-display text-7xl font-bold text-cyan sm:text-8xl">404</p>
      <h1 className="relative mt-4 font-display text-2xl font-semibold text-white">This route isn&apos;t on the map</h1>
      <p className="relative mt-2 max-w-sm text-white/70">The page you&apos;re looking for has moved or never existed. Let&apos;s get you back on the journey.</p>
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="inline-flex min-h-[48px] items-center rounded-full bg-saffron px-6 font-medium text-[#0B1026]">
          Back home
        </Link>
        <Link href="/destinations" className="inline-flex min-h-[48px] items-center rounded-full border border-white/20 px-6 font-medium text-white">
          Explore destinations
        </Link>
      </div>
    </main>
  );
}
