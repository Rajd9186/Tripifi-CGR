export default function TripCanvas() {
  return (
    <div className="card h-full flex flex-col">
      <div className="border-b border-ink-100 px-4 sm:px-5 py-4">
        <h3 className="text-base font-semibold text-ink-900">Trip Canvas</h3>
        <p className="text-xs text-ink-600">
          Add destinations, activities, hotels & transport
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="h-16 w-16 mx-auto rounded-full bg-navy-50 flex items-center justify-center mb-4">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-navy-900"
            >
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <h4 className="text-base font-semibold text-ink-900 mb-2">
            Start building your trip
          </h4>
          <p className="text-sm text-ink-600 leading-relaxed mb-4">
            Search destinations, add hotels, activities, or transport to start
            crafting your complete journey.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button className="chip">Add Destination</button>
            <button className="chip">Add Hotel</button>
            <button className="chip">Add Activity</button>
            <button className="chip">Add Transport</button>
          </div>
        </div>
      </div>
    </div>
  );
}
