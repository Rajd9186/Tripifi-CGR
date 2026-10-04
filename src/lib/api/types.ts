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
  fare: number;
  currency: string;
  refundable: boolean;
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
  fare: number;
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
  rating: number;
  room_type: string;
  amenities: string[];
  price_per_night: number;
  total_price: number;
  currency: string;
  cancellation_policy: string;
  meal_plan: string;
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
  driver_rating: number;
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
