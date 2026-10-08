import Link from "next/link";

export default function EnquirySuccess({ reference }: { reference: string }) {
  return (
    <div className="card mx-auto max-w-xl px-6 py-10 text-center animate-scale-in">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-leaf-100 text-leaf-700" aria-hidden="true">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <p className="micro-meta text-[11px] text-ink-400">REQUEST RECEIVED</p>
      <h2 className="mt-1 font-display text-2xl font-semibold text-ink-900">Thank you!</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-600">
        We&apos;ve received your travel request. Our team will get back to you with your booking
        details, or a customer representative may call you shortly.
      </p>
      <div className="mx-auto mt-6 max-w-xs rounded-2xl border border-ink-100 bg-cream-100 px-5 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">Reference Number</p>
        <p className="mt-1 font-mono text-xl font-bold tracking-wide text-text">{reference}</p>
        <p className="mt-1 text-[11px] text-ink-500">Please keep this reference for future communication.</p>
      </div>
      <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
        <Link href={`/assistance/track?ref=${encodeURIComponent(reference)}`} className="btn-navy inline-flex min-h-[48px]">
          View My Enquiry
        </Link>
        <Link href="/" className="btn-ghost inline-flex min-h-[48px]">
          Continue Exploring
        </Link>
      </div>
      <p className="mt-4 text-xs text-ink-400">This is a request for assistance — not a confirmed booking.</p>
    </div>
  );
}
