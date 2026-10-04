"use client";

import { useState } from "react";
import Link from "next/link";

type TabType = "flights" | "trains" | "cabs" | "hotels" | "packages" | "build";

const tabs: Array<{ id: TabType; label: string }> = [
  { id: "flights", label: "Flights" },
  { id: "trains", label: "Trains" },
  { id: "cabs", label: "Private Cabs" },
  { id: "hotels", label: "Hotels" },
  { id: "packages", label: "Packages" },
  { id: "build", label: "Build a Trip" },
];

export default function BookingCommandCenter() {
  const [activeTab, setActiveTab] = useState<TabType>("flights");

  return (
    <section className="relative -mt-20 sm:-mt-24 z-20 px-4 sm:px-6 lg:px-8 animate-slide-up">
      <div className="max-w-8xl mx-auto">
        <div className="card overflow-hidden hover:shadow-lift transition-shadow duration-300">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 sm:px-6 border-b border-ink-100">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative py-4 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-navy-900"
                    : "text-ink-500 hover:text-ink-900"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-saffron-500" />
                )}
              </button>
            ))}
          </div>

          <div className="p-4 sm:p-6">
            {activeTab === "flights" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <label className="input-label">From</label>
                  <input
                    type="text"
                    placeholder="Delhi (DEL)"
                    className="field"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="input-label">To</label>
                  <input
                    type="text"
                    placeholder="Mumbai (BOM)"
                    className="field"
                  />
                </div>
                <div>
                  <label className="input-label">Departure</label>
                  <input type="date" className="field" />
                </div>
                <div className="lg:col-span-2">
                  <label className="input-label">Travellers</label>
                  <select className="field">
                    <option>1 Traveller, Economy</option>
                    <option>2 Travellers, Economy</option>
                    <option>3 Travellers, Economy</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Link
                    href="/flights"
                    className="btn-primary w-full justify-center"
                  >
                    Search Flights
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "trains" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="input-label">From Station</label>
                  <input
                    type="text"
                    placeholder="Howrah (HWH)"
                    className="field"
                  />
                </div>
                <div>
                  <label className="input-label">To Station</label>
                  <input
                    type="text"
                    placeholder="New Delhi (NDLS)"
                    className="field"
                  />
                </div>
                <div>
                  <label className="input-label">Departure Date</label>
                  <input type="date" className="field" />
                </div>
                <div>
                  <label className="input-label">Class</label>
                  <select className="field">
                    <option>All Classes</option>
                    <option>1A</option>
                    <option>2A</option>
                    <option>3A</option>
                    <option>SL</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Link
                    href="/trains"
                    className="btn-primary w-full justify-center"
                  >
                    Search Trains
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "cabs" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <label className="input-label">Pickup Location</label>
                  <input
                    type="text"
                    placeholder="Kolkata Airport"
                    className="field"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className="input-label">Drop Location</label>
                  <input
                    type="text"
                    placeholder="Park Street"
                    className="field"
                  />
                </div>
                <div>
                  <label className="input-label">Pickup Date & Time</label>
                  <input type="datetime-local" className="field" />
                </div>
                <div className="flex items-end">
                  <Link href="/cabs" className="btn-primary w-full justify-center">
                    Search Cabs
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "hotels" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <label className="input-label">Destination</label>
                  <input type="text" placeholder="Goa" className="field" />
                </div>
                <div>
                  <label className="input-label">Check-in</label>
                  <input type="date" className="field" />
                </div>
                <div>
                  <label className="input-label">Check-out</label>
                  <input type="date" className="field" />
                </div>
                <div>
                  <label className="input-label">Guests</label>
                  <select className="field">
                    <option>2 Guests, 1 Room</option>
                    <option>3 Guests, 1 Room</option>
                    <option>4 Guests, 2 Rooms</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Link href="/hotels" className="btn-primary w-full justify-center">
                    Search Hotels
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "packages" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-2">
                  <label className="input-label">Destination</label>
                  <input
                    type="text"
                    placeholder="Sikkim Escape"
                    className="field"
                  />
                </div>
                <div>
                  <label className="input-label">Budget</label>
                  <select className="field">
                    <option>Under ₹20,000</option>
                    <option>₹20,000 - ₹40,000</option>
                    <option>₹40,000 - ₹60,000</option>
                    <option>Above ₹60,000</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Link href="/packages" className="btn-primary w-full justify-center">
                    Explore Packages
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "build" && (
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="input-label">Tell us your plan</label>
                  <input
                    type="text"
                    placeholder="I want to travel from Kolkata to Sikkim for 6 days with my partner, budget under ₹50,000"
                    className="field"
                  />
                </div>
                <div className="flex items-end">
                  <Link href="/plan" className="btn-primary w-full md:w-auto justify-center">
                    Build My Trip
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
