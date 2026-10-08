export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center" role="status" aria-label="Loading">
      <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="animate-spin text-cyan [animation-duration:2.4s]" aria-hidden="true">
        <circle cx="24" cy="24" r="18" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
        <path d="M24 6 L28 24 L24 42 L20 24 Z" fill="#FFB454" />
      </svg>
      <span className="sr-only">Loading</span>
    </div>
  );
}
