/** Tripifi AI contracts. Mirrors backend app/ai/schemas. */

export type AIIntent =
  | "PLAN_TRIP"
  | "SEARCH_DESTINATION"
  | "SEARCH_FLIGHT"
  | "SEARCH_TRAIN"
  | "SEARCH_CAB"
  | "SEARCH_HOTEL"
  | "BUILD_ITINERARY"
  | "CALCULATE_BUDGET"
  | "OPTIMIZE_BUDGET"
  | "MODIFY_TRIP"
  | "VIEW_TRIP"
  | "SAVE_WISHLIST"
  | "DESTINATION_QUESTION"
  | "BOOKING_ASSISTANCE"
  | "GENERAL_TRAVEL_QUESTION";

export type UIActionType =
  | "CREATE_TRIP"
  | "UPDATE_TRIP"
  | "ADD_TRANSPORT"
  | "ADD_HOTEL"
  | "ADD_CAB"
  | "ADD_ACTIVITY"
  | "REMOVE_ITEM"
  | "MOVE_ITEM"
  | "UPDATE_BUDGET"
  | "SAVE_WISHLIST"
  | "OPEN_SEARCH"
  | "OPEN_TRIP"
  | "REQUEST_BOOKING";

export interface UIAction {
  type: UIActionType | string;
  requires_confirmation: boolean;
  payload: Record<string, unknown>;
}

export type ResponseCardKind = "destination" | "hotel" | "transport" | "budget" | "itinerary" | "activity";

export interface ResponseCard {
  kind: ResponseCardKind;
  title: string;
  subtitle?: string | null;
  details: Record<string, unknown>;
  actions: UIAction[];
}

export interface AIResult {
  message: string;
  intent: AIIntent | string;
  actions: UIAction[];
  cards: ResponseCard[];
  trip_update?: Record<string, unknown> | null;
  sources: string[];
  requires_confirmation: boolean;
  pending_action?: UIAction | null;
  is_demo: boolean;
  request_id: string;
  prompt_version: string;
}

export type AIEventName =
  | "AI_STARTED"
  | "CONTEXT_LOADED"
  | "INTENT_DETECTED"
  | "PLANNING_STARTED"
  | "TOOL_STARTED"
  | "TOOL_COMPLETED"
  | "SEARCHING_DESTINATIONS"
  | "SEARCHING_TRANSPORT"
  | "SEARCHING_HOTELS"
  | "BUILDING_ITINERARY"
  | "CALCULATING_BUDGET"
  | "VALIDATING"
  | "ACTION_PROPOSED"
  | "ACTION_EXECUTED"
  | "AI_MESSAGE"
  | "AI_RESULT"
  | "AI_COMPLETED"
  | "AI_ERROR";

export interface AIEvent {
  event: AIEventName | string;
  data: Record<string, unknown>;
}
