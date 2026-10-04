"use client";

import { useState } from "react";

export default function MapBudgetPanel() {
  const [budget, setBudget] = useState({
    flights: 0,
    hotels: 0,
    cabs: 0,
    activities: 0,
    food: 0,
    taxes: 0,
    other: 0,
  });

  const total = Object.values(budget).reduce((sum, val) => sum + val, 0);

  return (
    <div className="card h-full flex flex-col">
      <div className="border-b border-ink-100 px-4 sm:px-5 py-4">
        <h3 className="text-base font-semibold text-ink-900">Map & Budget</h3>
        <p className="text-xs text-ink-600">Route overview & cost breakdown</p>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="h-48 bg-gradient-to-br from-navy-50 to-cream-100 border-b border-ink-100 flex items-center justify-center">
          <div className="text-center">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mx-auto text-ink-500 mb-2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <p className="text-xs text-ink-600">Simulated map visualization</p>
            <p className="text-[10px] text-ink-500">Route will appear as you add destinations</p>
          </div>
        </div>

        <div className="flex-1 p-4 overflow-auto thin-scrollbar">
          <h4 className="text-sm font-semibold text-ink-900 mb-3">Live Budget</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-ink-600">Flights</span>
              <span className="font-medium text-ink-900">
                ₹{budget.flights.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-600">Hotels</span>
              <span className="font-medium text-ink-900">
                ₹{budget.hotels.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-600">Private Cabs</span>
              <span className="font-medium text-ink-900">
                ₹{budget.cabs.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-600">Activities</span>
              <span className="font-medium text-ink-900">
                ₹{budget.activities.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-600">Food</span>
              <span className="font-medium text-ink-900">
                ₹{budget.food.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-600">Taxes</span>
              <span className="font-medium text-ink-900">
                ₹{budget.taxes.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-600">Other</span>
              <span className="font-medium text-ink-900">
                ₹{budget.other.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="border-t border-ink-100 pt-2 mt-3 flex items-center justify-between">
              <span className="font-semibold text-ink-900">Total</span>
              <span className="text-lg font-semibold text-ink-900">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="text-xs text-ink-500 mt-1">
              Per traveller: ₹{Math.round(total / 2 || 0).toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        <div className="border-t border-ink-100 p-4 space-y-2">
          <button className="btn-primary w-full justify-center text-sm">
            Proceed to Checkout
          </button>
          <button className="btn-ghost w-full justify-center text-sm">
            Surprise Me
          </button>
        </div>
      </div>
    </div>
  );
}
