"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";
import { validateCabSearch, validateFlightSearch, validateHotelSearch, validateTrainSearch, type FieldErrors } from "@/lib/validation";
import { AIRPORTS } from "@/data/airports";
import { STATIONS } from "@/data/stations";
import {
  FlightIcon,
  TrainIcon,
  CabIcon,
  HotelIcon,
  PackageIcon,
  BuildIcon,
  AirplaneIcon,
  TrainStationIcon,
  CarIcon,
  MapPinIcon,
  CalendarIcon,
  DateTimeIcon,
  SwapIcon,
  ArrowRightIcon,
  PlusIcon,
  SparkleIcon,
  ChevronDownIcon,
} from "@/components/icons/BookingIcons";

type TabType = "flights" | "trains" | "cabs" | "hotels" | "packages" | "build";

const tabs: Array<{ id: TabType; label: string; icon: React.ReactNode }> = [
  { id: "flights", label: "Flights", icon: <FlightIcon /> },
  { id: "trains", label: "Trains", icon: <TrainIcon /> },
  { id: "cabs", label: "Private Cabs", icon: <CabIcon /> },
  { id: "hotels", label: "Hotels", icon: <HotelIcon /> },
  { id: "packages", label: "Packages", icon: <PackageIcon /> },
  { id: "build", label: "Build a Trip", icon: <BuildIcon /> },
];

function SearchInput({
  label,
  placeholder,
  type = "text",
  value,
  onChange,
  icon,
  className,
  autoComplete,
  list,
  error,
  id,
}: {
  label: string;
  placeholder: string;
  type?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon?: React.ReactNode;
  className?: string;
  autoComplete?: string;
  list?: string;
  error?: string;
  id?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={cn("relative", className)}>
      <label className="input-label" htmlFor={id}>{label}</label>
      <div className="relative">
        {icon && (
          <span
            className="input-icon-zone transition-colors duration-200"
            style={{ color: focused ? "rgb(242, 140, 40)" : "" }}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          autoComplete={autoComplete}
          list={list}
          aria-invalid={Boolean(error)}
          aria-describedby={error && id ? `${id}-error` : undefined}
          className={cn(
            "field transition-all duration-200",
            focused && "border-saffron-500 ring-2 ring-saffron-500/20",
            error && "border-red-500",
            icon ? "field-with-icon" : ""
          )}
        />
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-saffron-500 transform scale-x-0 origin-left transition-transform duration-300"
          style={{ transform: focused ? "scaleX(1)" : "scaleX(0)" }}
        />
      </div>
      {error && (
        <p id={id ? `${id}-error` : undefined} role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function SelectInput({
  label,
  value,
  onChange,
  children,
  className,
}: {
  label: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className={className}>
      <label className="input-label">{label}</label>
      <div className="relative">
        <select
          className={cn(
            "field transition-all duration-200 appearance-none bg-surface",
            focused && "border-saffron-500 ring-2 ring-saffron-500/20"
          )}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        >
          {children}
        </select>
        <div
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none"
          style={{ color: focused ? "rgb(242, 140, 40)" : "" }}
        >
          <ChevronDownIcon />
        </div>
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-saffron-500 transform scale-x-0 origin-left transition-transform duration-300"
          style={{ transform: focused ? "scaleX(1)" : "scaleX(0)" }}
        />
      </div>
    </div>
  );
}

function SwapButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-ink-50 text-ink-600 transition-all duration-200",
        "hover:bg-saffron-50 hover:text-saffron-600 active:scale-[0.95]",
        "disabled:opacity-50 disabled:hover:bg-ink-50"
      )}
      aria-label="Swap origin and destination"
    >
      <SwapIcon className="transition-transform duration-200" style={{ transform: hovered ? "rotate(180deg)" : "rotate(0deg)" }} />
    </button>
  );
}

function DateInput({
  label,
  placeholder,
  value,
  onChange,
  min,
  error,
  id,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string;
  error?: string;
  id?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <label className="input-label" htmlFor={id}>{label}</label>
      <div className="relative">
        <CalendarIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 transition-colors duration-200"
          style={{ color: focused ? "rgb(242, 140, 40)" : "" }}
        />
        <input
          id={id}
          type="date"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          min={min}
          aria-invalid={Boolean(error)}
          className="field pl-10 transition-all duration-200"
          style={{
            borderColor: error ? "#D64545" : focused ? "rgb(242, 140, 40)" : "",
            boxShadow: focused && !error ? "0 0 0 3px rgb(242 140 40 / 0.2)" : "",
          }}
        />
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-saffron-500 transform scale-x-0 origin-left transition-transform duration-300"
          style={{ transform: focused ? "scaleX(1)" : "scaleX(0)" }}
        />
      </div>
      {error && (
        <p role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

function DateTimeInput({
  label,
  placeholder,
  value,
  onChange,
  min,
}: {
  label: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative">
      <label className="input-label">{label}</label>
      <div className="relative">
        <DateTimeIcon
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 transition-colors duration-200"
          style={{ color: focused ? "rgb(242, 140, 40)" : "" }}
        />
        <input
          type="datetime-local"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          min={min}
          className="field pl-10 transition-all duration-200"
          style={{
            borderColor: focused ? "rgb(242, 140, 40)" : "",
            boxShadow: focused ? "0 0 0 3px rgb(242 140 40 / 0.2)" : "",
          }}
        />
        <div
          className="absolute bottom-0 left-0 h-0.5 bg-saffron-500 transform scale-x-0 origin-left transition-transform duration-300"
          style={{ transform: focused ? "scaleX(1)" : "scaleX(0)" }}
        />
      </div>
    </div>
  );
}

export default function BookingCommandCenter() {
  const [activeTab, setActiveTab] = useState<TabType>("flights");
  const tabRefs = useRef<Map<TabType, HTMLButtonElement>>(new Map());
  const indicatorRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0, opacity: 1 });

  const updateIndicator = () => {
    const activeBtn = tabRefs.current.get(activeTab);
    if (activeBtn && indicatorRef.current) {
      const rect = activeBtn.getBoundingClientRect();
      const containerRect = activeBtn.parentElement?.getBoundingClientRect();
      if (containerRect) {
        setIndicatorStyle({
          width: rect.width,
          left: rect.left - containerRect.left,
          opacity: 1,
        });
      }
    }
  };

  useEffect(() => {
    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  const handleTabClick = (tab: TabType) => {
    setActiveTab(tab);
    requestAnimationFrame(updateIndicator);
  };

  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const airportOptions = AIRPORTS.slice(0, 20).map((a) => (
    <option key={a.code} value={`${a.city} (${a.code})`} />
  ));
  const stationOptions = STATIONS.slice(0, 20).map((s) => (
    <option key={s.code} value={`${s.name} (${s.code})`} />
  ));

  return (
    <section className="relative -mt-20 sm:-mt-24 z-20 px-4 sm:px-6 lg:px-8 animate-slide-up">
      <div className="max-w-8xl mx-auto">
        <div className="card overflow-hidden hover:shadow-lift transition-shadow duration-300">
          <div className="relative px-4 sm:px-6 border-b border-ink-100">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2" role="tablist">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current.set(tab.id, el as HTMLButtonElement);
                  }}
                  onClick={() => handleTabClick(tab.id)}
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  className={cn(
                    "relative flex items-center gap-2 py-4 text-sm font-medium transition-colors",
                    activeTab === tab.id
                      ? "text-text"
                      : "text-ink-500 hover:text-ink-900"
                  )}
                >
                  <span
                    className="flex-shrink-0 transition-transform duration-200"
                    style={{ transform: activeTab === tab.id ? "scale(1.1)" : "scale(1)" }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
              <div
                ref={indicatorRef}
                className="absolute bottom-0 h-0.5 bg-gradient-to-r from-saffron-500 to-orange-500 transition-all duration-300 ease-out"
                style={indicatorStyle}
                role="presentation"
                aria-hidden="true"
              />
            </div>
          </div>

          <div className="p-4 sm:p-6">
            <div className="relative min-h-[280px]" role="tabpanel" aria-label={`${activeTab} search form`}>
              {activeTab === "flights" && <FlightForm airportOptions={airportOptions} today={today} />}
              {activeTab === "trains" && <TrainForm stationOptions={stationOptions} today={today} />}
              {activeTab === "cabs" && <CabForm today={today} />}
              {activeTab === "hotels" && <HotelForm today={today} tomorrow={tomorrow} />}
              {activeTab === "packages" && <PackageForm />}
              {activeTab === "build" && <BuildForm />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FlightForm({ airportOptions, today }: { airportOptions: React.ReactNode; today: string }) {
  const router = useRouter();
  const { updateSearchState } = useApp();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departure, setDeparture] = useState(today);
  const [travellers, setTravellers] = useState("1 Traveller, Economy");
  const [tripType, setTripType] = useState<"oneway" | "round">("oneway");
  const [returnDate, setReturnDate] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSwap = () => {
    const temp = from;
    setFrom(to);
    setTo(temp);
  };

  const travellerCount = parseInt(travellers, 10) || 1;
  const cabin = travellers.includes("Business") ? "Business" : "Economy";

  const handleSubmit = () => {
    const errs = validateFlightSearch({ from, to, departure, return: tripType === "round" ? returnDate : undefined, travellers: travellerCount });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    updateSearchState({ flights: { from, to, departure, return: tripType === "round" ? returnDate : undefined, travellers, class: cabin, tripType } });
    const params = new URLSearchParams({ from, to, date: departure, travellers: String(travellerCount), class: cabin, trip: tripType });
    if (tripType === "round" && returnDate) params.set("return", returnDate);
    router.push(`/flights/results?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 animate-form-morph">
      <div className="lg:col-span-3">
        <SearchInput
          label="From"
          placeholder="Delhi (DEL)"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          list="airports"
          autoComplete="off"
          icon={<AirplaneIcon />}
          error={errors.from}
          id="flight-from"
        />
        <datalist id="airports">{airportOptions}</datalist>
      </div>
      <div className="lg:col-span-3 relative">
        <SearchInput
          label="To"
          placeholder="Mumbai (BOM)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          list="airports"
          autoComplete="off"
          icon={<AirplaneIcon />}
          error={errors.to}
          id="flight-to"
        />
        <datalist id="airports">{airportOptions}</datalist>
        <SwapButton onClick={handleSwap} disabled={!from && !to} />
      </div>
      <div>
        <DateInput label="Departure" value={departure} onChange={(e) => setDeparture(e.target.value)} min={today} error={errors.departure} id="flight-departure" />
      </div>
      {tripType === "round" && (
        <div>
          <DateInput label="Return" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} min={departure} error={errors.return} id="flight-return" />
        </div>
      )}
      <div className="lg:col-span-2">
        <SelectInput
          label="Travellers & Class"
          value={travellers}
          onChange={(e) => setTravellers(e.target.value)}
        >
          <option>1 Traveller, Economy</option>
          <option>2 Travellers, Economy</option>
          <option>3 Travellers, Economy</option>
          <option>4 Travellers, Economy</option>
          <option>1 Traveller, Business</option>
          <option>2 Travellers, Business</option>
        </SelectInput>
      </div>
      <div>
        <SelectInput
          label="Trip Type"
          value={tripType}
          onChange={(e) => setTripType(e.target.value as "oneway" | "round")}
        >
          <option value="oneway">One Way</option>
          <option value="round">Round Trip</option>
        </SelectInput>
      </div>
      <div className="flex items-end">
        <button onClick={handleSubmit} className="btn-primary w-full justify-center group">
          Search Flights
          <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function TrainForm({ stationOptions, today }: { stationOptions: React.ReactNode; today: string }) {
  const router = useRouter();
  const { updateSearchState } = useApp();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departure, setDeparture] = useState(today);
  const [trainClass, setTrainClass] = useState("All Classes");
  const [quota, setQuota] = useState("General");
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSwap = () => {
    const t = from;
    setFrom(to);
    setTo(t);
  };

  const handleSubmit = () => {
    const errs = validateTrainSearch({ from, to, date: departure, travellers: 1 });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    updateSearchState({ trains: { from, to, date: departure, class: trainClass, quota } });
    const params = new URLSearchParams({ from, to, date: departure, class: trainClass, quota });
    router.push(`/trains/results?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 animate-form-morph">
      <div className="lg:col-span-2">
        <SearchInput
          label="From Station"
          placeholder="Howrah (HWH)"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          list="stations"
          autoComplete="off"
          icon={<TrainStationIcon />}
          error={errors.from}
          id="train-from"
        />
        <datalist id="stations">{stationOptions}</datalist>
      </div>
      <div className="lg:col-span-2 relative">
        <SearchInput
          label="To Station"
          placeholder="New Delhi (NDLS)"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          list="stations"
          autoComplete="off"
          icon={<TrainStationIcon />}
          error={errors.to}
          id="train-to"
        />
        <datalist id="stations">{stationOptions}</datalist>
        <SwapButton onClick={handleSwap} disabled={!from && !to} />
      </div>
      <div>
        <DateInput label="Departure Date" value={departure} onChange={(e) => setDeparture(e.target.value)} min={today} error={errors.date} id="train-date" />
      </div>
      <div>
        <SelectInput
          label="Class"
          value={trainClass}
          onChange={(e) => setTrainClass(e.target.value)}
        >
          <option>All Classes</option>
          <option>1A</option>
          <option>2A</option>
          <option>3A</option>
          <option>SL</option>
          <option>CC</option>
          <option>EC</option>
        </SelectInput>
      </div>
      <div>
        <SelectInput
          label="Quota"
          value={quota}
          onChange={(e) => setQuota(e.target.value)}
        >
          <option>General</option>
          <option>Tatkal</option>
          <option>Ladies</option>
          <option>Premium Tatkal</option>
        </SelectInput>
      </div>
      <div className="flex items-end">
        <button onClick={handleSubmit} className="btn-primary w-full justify-center group">
          Search Trains
          <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function CabForm({ today }: { today: string }) {
  const router = useRouter();
  const { updateSearchState } = useApp();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [tripType, setTripType] = useState<"oneway" | "round" | "local" | "multiday">("oneway");
  const [vehicle, setVehicle] = useState("All Vehicles");
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSwap = () => {
    const t = from;
    setFrom(to);
    setTo(t);
  };

  const handleSubmit = () => {
    const date = pickupTime ? pickupTime.slice(0, 10) : "";
    const errs = validateCabSearch({ pickup: from, drop: to, date });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    updateSearchState({ cabs: { pickup: from, drop: to, datetime: pickupTime, tripType, vehicle } });
    const params = new URLSearchParams({ pickup: from, drop: to, trip: tripType, vehicle });
    if (pickupTime) params.set("datetime", pickupTime);
    router.push(`/cabs/results?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 animate-form-morph">
      <div className="lg:col-span-3">
        <SearchInput
          label="Pickup Location"
          placeholder="Kolkata Airport"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          icon={<CarIcon />}
          error={errors.pickup}
          id="cab-pickup"
        />
      </div>
      <div className="lg:col-span-3 relative">
        <SearchInput
          label="Drop Location"
          placeholder="Park Street"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          icon={<CarIcon />}
          error={errors.drop}
          id="cab-drop"
        />
        <SwapButton onClick={handleSwap} disabled={!from && !to} />
      </div>
      <div>
        <DateTimeInput
          label="Pickup Date & Time"
          value={pickupTime}
          onChange={(e) => setPickupTime(e.target.value)}
          min={today}
        />
      </div>
      <div>
        <SelectInput
          label="Trip Type"
          value={tripType}
          onChange={(e) => setTripType(e.target.value as any)}
        >
          <option value="oneway">One Way</option>
          <option value="round">Round Trip</option>
          <option value="local">Local</option>
          <option value="multiday">Multi-Day</option>
        </SelectInput>
      </div>
      <div>
        <SelectInput
          label="Vehicle Type"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
        >
          <option>All Vehicles</option>
          <option>Sedan</option>
          <option>SUV</option>
          <option>Premium SUV</option>
          <option>Luxury</option>
        </SelectInput>
      </div>
      <div className="flex items-end">
        <button onClick={handleSubmit} className="btn-primary w-full justify-center group">
          Search Cabs
          <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function HotelForm({ today, tomorrow }: { today: string; tomorrow: string }) {
  const router = useRouter();
  const { updateSearchState } = useApp();
  const [destination, setDestination] = useState("");
  const [checkin, setCheckin] = useState(today);
  const [checkout, setCheckout] = useState(tomorrow);
  const [guests, setGuests] = useState("2 Guests, 1 Room");
  const [errors, setErrors] = useState<FieldErrors>({});

  const handleSubmit = () => {
    const errs = validateHotelSearch({ destination, checkin, checkout });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    updateSearchState({ hotels: { destination, checkin, checkout, guests, rooms: guests } });
    const params = new URLSearchParams({ destination, checkin, checkout, guests });
    router.push(`/hotels/results?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 animate-form-morph">
      <div className="lg:col-span-3">
        <SearchInput
          label="Destination"
          placeholder="Goa"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          icon={<MapPinIcon />}
          error={errors.destination}
          id="hotel-destination"
        />
      </div>
      <div>
        <DateInput label="Check-in" value={checkin} onChange={(e) => setCheckin(e.target.value)} min={today} error={errors.checkin} id="hotel-checkin" />
      </div>
      <div>
        <DateInput label="Check-out" value={checkout} onChange={(e) => setCheckout(e.target.value)} min={checkin} error={errors.checkout} id="hotel-checkout" />
      </div>
      <div>
        <SelectInput
          label="Guests & Rooms"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
        >
          <option>2 Guests, 1 Room</option>
          <option>3 Guests, 1 Room</option>
          <option>4 Guests, 2 Rooms</option>
          <option>5 Guests, 2 Rooms</option>
          <option>6 Guests, 3 Rooms</option>
        </SelectInput>
      </div>
      <div className="flex items-end">
        <button onClick={handleSubmit} className="btn-primary w-full justify-center group">
          Search Hotels
          <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function PackageForm() {
  const router = useRouter();
  const { updateSearchState } = useApp();
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("Under ₹20,000");

  const handlePackageSubmit = () => {
    updateSearchState({ packages: { destination, budget, duration: "" } });
    const params = new URLSearchParams();
    if (destination.trim()) params.set("destination", destination.trim());
    params.set("budget", budget);
    const qs = params.toString();
    router.push(qs ? `/packages?${qs}` : "/packages");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 animate-form-morph">
      <div className="lg:col-span-4">
        <SearchInput
          label="Destination"
          placeholder="Sikkim Escape"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          icon={<MapPinIcon />}
        />
      </div>
      <div>
        <SelectInput
          label="Budget"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        >
          <option>Under ₹20,000</option>
          <option>₹20,000 - ₹40,000</option>
          <option>₹40,000 - ₹60,000</option>
          <option>₹60,000 - ₹80,000</option>
          <option>Above ₹80,000</option>
        </SelectInput>
      </div>
      <div className="flex items-end">
        <button onClick={handlePackageSubmit} className="btn-primary w-full justify-center group">
          Explore Packages
          <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}

function BuildForm() {
  const router = useRouter();
  const { updateSearchState, setPendingPlan } = useApp();
  const [plan, setPlan] = useState("");

  const handleSubmit = () => {
    updateSearchState({ build: { plan } });
    if (plan.trim()) setPendingPlan(plan.trim());
    router.push("/plan");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 animate-form-morph">
      <div className="flex-1">
        <SearchInput
          label="Tell us your plan"
          placeholder="I want to travel from Kolkata to Sikkim for 6 days with my partner, budget under ₹50,000"
          value={plan}
          onChange={(e) => setPlan(e.target.value)}
          icon={<PlusIcon />}
          id="build-plan"
        />
      </div>
      <div className="flex items-end">
        <button onClick={handleSubmit} className="btn-primary w-full md:w-auto justify-center group">
          Build My Trip
          <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
  