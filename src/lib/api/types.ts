/** Shared backend contracts. Mirrors backend/app/schemas/schemas.py. Never add vendor shapes here. */

export interface FlightOffer {
  id: string;
  provider: string;
  airline: string;
  flight_number: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration_minutes: number;
  stops: number;
  baggage_kg: number;
  /** Null when the provider does not know the fare — UI shows "Price on request". */
  fare: number | null;
  currency: string;
  refundable?: boolean | null;
  seat_available: boolean;
  is_demo: boolean;
}

export interface TrainOffer {
  id: string;
  provider: string;
  train_number: string;
  train_name: string;
  origin: string;
  destination: string;
  departure: string;
  arrival: string;
  duration_minutes: number;
  travel_class: string;
  /** Null when unknown — UI shows "Price on request". */
  fare: number | null;
  currency: string;
  availability: string;
  running_days: string[];
  is_demo: boolean;
}

export interface HotelOffer {
  id: string;
  provider: string;
  name: string;
  destination: string;
  location: string;
  /** Null when unknown (e.g. map discovery) — never rendered when null. */
  rating: number | null;
  room_type?: string | null;
  amenities: string[];
  /** Null when unknown — UI shows "Price on request". */
  price_per_night: number | null;
  total_price: number | null;
  currency: string;
  cancellation_policy?: string | null;
  meal_plan?: string | null;
  is_demo: boolean;
}

export interface CabOffer {
  id: string;
  provider: string;
  vehicle_type: string;
  vehicle_model: string;
  capacity: number;
  luggage: number;
  included_km: number;
  extra_km_price: number;
  driver_rating?: number | null;
  price: number;
  currency: string;
  cancellation_policy: string;
  is_demo: boolean;
}

export interface TripDTO {
  id: string;
  name: string;
  origin?: string | null;
  start_date?: string | null;
  end_date?: string | null;
  travellers: number;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
}

export interface PricingSnapshot {
  subtotal: number;
  taxes: number;
  discounts: number;
  addons: number;
  total: number;
  per_traveller: number;
  currency: string;
  calculated_at: string;
}

export interface AIAction {
  type:
    | "ADD_DESTINATION"
    | "ADD_HOTEL"
    | "ADD_FLIGHT"
    | "ADD_CAB"
    | "ADD_ACTIVITY"
    | "CHANGE_DATE"
    | "CHANGE_BUDGET"
    | "REMOVE_ITEM"
    | "OPTIMIZE_TRIP";
  payload: Record<string, unknown>;
}

export interface AIChatOut {
  message: string;
  trip_plan?: Record<string, unknown> | null;
  actions: AIAction[];
  is_demo: boolean;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  request_id: string;
}

/** Normalized frontend result types. Mirror backend contracts; UI uses only these. */

export interface ResultProvenance {
  source: "demo" | "tripifi-catalog" | "live";
  provider: string;
  status: "LIVE" | "DEMO" | "UNAVAILABLE";
  retrieved_at?: string;
}

export interface FlightResult extends FlightOffer {
  status: "LIVE" | "DEMO" | "UNAVAILABLE";
  cabin: string;
  price: number | null;
}

export interface TrainResult extends TrainOffer {
  status: "LIVE" | "DEMO" | "UNAVAILABLE";
  price: number | null;
}

export interface HotelResult extends HotelOffer {
  status: "LIVE" | "DEMO" | "UNAVAILABLE";
  nightly_price: number | null;
  breakfast?: boolean | null;
  cancellation?: string | null;
}

export interface CabResult extends CabOffer {
  status: "LIVE" | "DEMO" | "UNAVAILABLE";
  vehicle: string;
  category: string;
  seats: number;
  base_fare: number;
  toll_estimate: number;
  taxes: number;
  total_price: number;
}

export interface ActivityResult {
  id: string;
  provider: string;
  status: "LIVE" | "DEMO" | "UNAVAILABLE";
  title: string;
  destination: string;
  duration: string;
  description?: string | null;
  price: number | null;
  currency: string;
  is_demo: boolean;
}

export interface DestinationResult {
  slug: string;
  name: string;
  state: string;
  region: string;
  score: number;
  source: string;
  status: "LIVE" | "DEMO" | "UNAVAILABLE";
}

export interface SearchMetadata {
  provider: { name: string; status: string };
  requestId: string;
  mode?: SearchMode;
  source?: string;
  fetched_at?: string;
}

export type SearchMode = "LIVE" | "ESTIMATE" | "SCHEDULE_ONLY" | "DISCOVERY" | "ASSISTED";

export interface ProviderStatus {
  provider: string;
  mode: string;
  state: string;
  bookable: boolean;
}

export interface SearchHistoryEntry {
  type: "flight" | "train" | "hotel" | "cab";
  label: string;
  params: Record<string, string>;
  created_at: string;
}

export type ProviderState =
  | "SUCCESS"
  | "NO_RESULTS"
  | "UNAVAILABLE"
  | "RATE_LIMITED"
  | "AUTH_ERROR"
  | "TIMEOUT"
  | "NOT_SUPPORTED"
  | "BOOKING_UNAVAILABLE"
  | "NOT_CONFIGURED";

export interface ProviderStatus {
  provider: string;
  mode: string;
  state: string;
  bookable: boolean;
}

export interface BookingCapability {
  mode: "LIVE_RESULTS" | "ASSISTED_BOOKING";
  bookable: boolean;
  enquiry: boolean;
}

export type DataSourceState = "LIVE" | "ESTIMATED" | "DEMO" | "SIMULATED" | "ASSISTED_BOOKING";

export type EnquiryType =
  | "FLIGHT"
  | "TRAIN"
  | "HOTEL"
  | "CAB"
  | "PACKAGE"
  | "CUSTOM_TRIP"
  | "MULTI_SERVICE";

export type EnquiryStatus =
  | "NEW"
  | "CONTACTED"
  | "QUOTED"
  | "AWAITING_CUSTOMER"
  | "CONFIRMED"
  | "CLOSED"
  | "CANCELLED"
  | "LOST";

export interface BookingEnquiry {
  type: EnquiryType;
  customer_name: string;
  phone: string;
  email?: string;
  preferred_contact_time?: string;
  /** Honeypot: hidden from real users; bots fill it. Never logged. */
  website?: string;
  origin?: string;
  destination?: string;
  travel_start_date?: string;
  travel_end_date?: string;
  traveller_count: number;
  budget?: number;
  service_details?: Record<string, unknown>;
  selected_option?: Record<string, unknown>;
  special_requirements?: string;
  source?: string;
  trip_snapshot?: Record<string, unknown>;
  consent: boolean;
  idempotency_key?: string;
}

export interface EnquiryReceipt {
  id: string;
  reference_number: string;
  type: string;
  status: string;
  customer_name: string;
  origin?: string | null;
  destination?: string | null;
  travel_start_date?: string | null;
  travel_end_date?: string | null;
  traveller_count: number;
  created_at: string;
}

export interface RouteResult {
  distance_km: number;
  duration_minutes: number;
  provider: string;
  is_demo: boolean;
}

export interface PackageOffer {
  id: string;
  provider: string;
  status: string;
  slug: string;
  title: string;
  destination: string;
  duration: string;
  route: string;
  base_price: number;
  currency: string;
  tags: string[];
  inclusions: string[];
  is_demo: boolean;
}

export interface CabFareEstimate {
  vehicle: string;
  trip_type: string;
  distance_km: number;
  included_km: number;
  extra_km: number;
  base_fare: number;
  extra_km_charge: number;
  driver_allowance: number;
  night_charge: number;
  toll_estimate: number;
  taxes: number;
  total: number;
  currency: string;
  label: string;
  is_demo: boolean;
}
