import { apiRequest, isBackendConfigured } from "./client";
import type { BookingEnquiry, EnquiryReceipt } from "./types";

const LOCAL_KEY = "tripifi_enquiries";

function idempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `idem-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function newIdempotencyKey(): string {
  return idempotencyKey();
}

function localReference(): string {
  const year = new Date().getFullYear();
  const n = Math.floor(100000 + Math.random() * 900000);
  return `TFC-${year}-${n}`;
}

interface StoredEnquiry extends EnquiryReceipt {
  phone: string;
  email: string;
  trip_snapshot?: Record<string, unknown> | null;
  special_requirements?: string | null;
  idempotency_key?: string;
}

function readLocal(): StoredEnquiry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    const parsed = raw ? (JSON.parse(raw) as StoredEnquiry[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLocal(rows: StoredEnquiry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
  } catch {
    // Persistence must never break the product.
  }
}

function normalizePhoneDigits(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
}

/** Local queue for the admin view when no backend is connected. */
export function listLocalEnquiries(): StoredEnquiry[] {
  return readLocal().sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export const enquiriesApi = {
  async create(body: BookingEnquiry, key = idempotencyKey()): Promise<EnquiryReceipt> {
    if (!isBackendConfigured()) {
      // Local demo receipt so the full flow works with no backend.
      // Clearly marked demo — never presented as a confirmed booking.
      // Stored locally so tracking and the admin queue keep working.
      await new Promise((r) => setTimeout(r, 600));
      const existing = readLocal().find((e) => e.idempotency_key === key);
      if (existing) return existing;
      const receipt: StoredEnquiry = {
        id: `local-${Date.now()}`,
        reference_number: localReference(),
        type: body.type,
        status: "NEW",
        customer_name: body.customer_name,
        origin: body.origin ?? null,
        destination: body.destination ?? null,
        travel_start_date: body.travel_start_date ?? null,
        travel_end_date: body.travel_end_date ?? null,
        traveller_count: body.traveller_count,
        created_at: new Date().toISOString(),
        phone: body.phone,
        email: body.email,
        trip_snapshot: body.trip_snapshot ?? null,
        special_requirements: body.special_requirements ?? null,
      };
      writeLocal([...readLocal(), { ...receipt, idempotency_key: key }]);
      return receipt;
    }
    return apiRequest<EnquiryReceipt>("/enquiries", {
      method: "POST",
      body: JSON.stringify({ ...body, idempotency_key: key }),
      idempotencyKey: key,
      auth: false,
    });
  },

  async lookup(reference: string, phone: string): Promise<EnquiryReceipt> {
    if (!isBackendConfigured()) {
      const want = normalizePhoneDigits(phone);
      const found = readLocal().find(
        (e) =>
          e.reference_number.toUpperCase() === reference.trim().toUpperCase() &&
          normalizePhoneDigits(e.phone) === want
      );
      if (!found) {
        const err = new Error("We couldn't find that enquiry. Check the reference and phone number.") as Error & { code: string };
        err.code = "NOT_FOUND";
        throw err;
      }
      return found;
    }
    return apiRequest<EnquiryReceipt>(
      `/enquiries/${encodeURIComponent(reference)}?phone=${encodeURIComponent(phone)}`,
      { auth: false }
    );
  },
};

export const adminEnquiriesApi = {
  async list(status?: string) {
    const q = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiRequest(`/admin/enquiries${q}`);
  },
  async get(id: string) {
    return apiRequest(`/admin/enquiries/${id}`);
  },
};
