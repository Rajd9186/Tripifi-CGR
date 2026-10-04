"use client";

import Link from "next/link";

const promptExamples = [
  "5 days in Kashmir under ₹50,000",
  "Weekend trip from Kolkata",
  "Honeymoon in Kerala",
  "Family trip to Rajasthan",
  "Mountain trip under ₹30,000",
];

export default function AIAssistant() {
  return (
    <section className="mt-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-8xl mx-auto">
        <div className="card p-6 sm:p-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-ink-200 bg-white px-4 py-2 text-sm font-medium text-ink-700 mb-4">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-saffron-600"
              >
                <path d="M12 2L9.5 9.5H2L8 14L6 21L12 16L18 21L16 14L22 9.5H14.5L12 2Z" />
              </svg>
              Tripifi AI
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl font-semibold text-ink-900">
              Tell Tripifi where you want to go...
            </h2>
            <p className="mt-3 text-base text-ink-600">
              Let your personal travel concierge build the perfect itinerary for you
            </p>

            <div className="mt-6 relative">
              <input
                type="text"
                placeholder="e.g., I want to travel from Kolkata to Sikkim for 6 days with my partner, comfortable hotels, private cabs and a budget under ₹50,000"
                className="field pr-24 py-4 text-base"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  className="inline-flex items-center justify-center h-9 w-9 rounded-lg text-ink-500 hover:bg-ink-50 transition-colors"
                  aria-label="Voice input"
                >
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
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </button>
                <Link
                  href="/plan"
                  className="btn-primary px-4 py-2.5 text-sm"
                >
                  Plan with AI
                </Link>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {promptExamples.map((prompt) => (
                <button
                  key={prompt}
                  className="chip text-xs"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
