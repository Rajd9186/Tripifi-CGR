/** Field-level search validation. Errors render next to fields — never alert(). */

export interface FieldErrors {
  [field: string]: string | undefined;
}

export function isValidDateISO(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const d = new Date(s + "T00:00:00");
  return !Number.isNaN(d.getTime());
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function validateFlightSearch(input: {
  from: string;
  to: string;
  departure: string;
  return?: string;
  travellers: number;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.from.trim()) errors.from = "Origin is required.";
  if (!input.to.trim()) errors.to = "Destination is required.";
  if (input.from.trim() && input.to.trim() && input.from.trim().toLowerCase() === input.to.trim().toLowerCase()) {
    errors.to = "Destination must differ from origin.";
  }
  if (!isValidDateISO(input.departure)) errors.departure = "Enter a valid departure date.";
  else if (input.departure < todayISO()) errors.departure = "Departure date cannot be in the past.";
  if (input.return) {
    if (!isValidDateISO(input.return)) errors.return = "Enter a valid return date.";
    else if (input.return < input.departure) errors.return = "Return date cannot precede departure.";
  }
  if (!Number.isFinite(input.travellers) || input.travellers < 1) {
    errors.travellers = "At least 1 traveller is required.";
  }
  return errors;
}

export function validateTrainSearch(input: { from: string; to: string; date: string; travellers: number }): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.from.trim()) errors.from = "Origin station is required.";
  if (!input.to.trim()) errors.to = "Destination station is required.";
  if (input.from.trim() && input.to.trim() && input.from.trim().toLowerCase() === input.to.trim().toLowerCase()) {
    errors.to = "Destination must differ from origin.";
  }
  if (!isValidDateISO(input.date)) errors.date = "Enter a valid travel date.";
  else if (input.date < todayISO()) errors.date = "Travel date cannot be in the past.";
  if (!Number.isFinite(input.travellers) || input.travellers < 1) {
    errors.travellers = "At least 1 traveller is required.";
  }
  return errors;
}

export function validateCabSearch(input: { pickup: string; drop: string; date: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.pickup.trim()) errors.pickup = "Pickup location is required.";
  if (!input.drop.trim()) errors.drop = "Drop location is required.";
  if (input.date && !isValidDateISO(input.date)) errors.date = "Enter a valid date.";
  else if (input.date && input.date < todayISO()) errors.date = "Date cannot be in the past.";
  return errors;
}

export function validateHotelSearch(input: { destination: string; checkin: string; checkout: string }): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.destination.trim()) errors.destination = "Destination is required.";
  if (!isValidDateISO(input.checkin)) errors.checkin = "Enter a valid check-in date.";
  else if (input.checkin < todayISO()) errors.checkin = "Check-in cannot be in the past.";
  if (!isValidDateISO(input.checkout)) errors.checkout = "Enter a valid check-out date.";
  else if (isValidDateISO(input.checkin) && input.checkout <= input.checkin) {
    errors.checkout = "Check-out must be after check-in.";
  }
  return errors;
}

const INDIAN_PHONE_RE = /^(?:\+91[\s-]?)?[6-9]\d{9}$/;

export function normalizeIndianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  const ten = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(ten)) return null;
  return `+91${ten}`;
}

export function validateEnquiry(input: {
  name: string;
  phone: string;
  email?: string;
  travellers: number;
  consent: boolean;
}): FieldErrors {
  const errors: FieldErrors = {};
  if (!input.name.trim()) errors.name = "Full name is required.";
  if (!normalizeIndianPhone(input.phone)) errors.phone = "Enter a valid 10-digit Indian mobile number.";
  if (input.email && input.email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!Number.isFinite(input.travellers) || input.travellers < 1) {
    errors.travellers = "At least 1 traveller is required.";
  }
  if (!input.consent) errors.consent = "Please agree to be contacted about this enquiry.";
  return errors;
}
