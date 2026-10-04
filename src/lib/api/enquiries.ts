import { apiRequest, isBackendConfigured } from "./client";
import type { BookingEnquiry, EnquiryReceipt } from "./types";

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

export const enquiriesApi = {
  async create(body: BookingEnquiry, key = idempotencyKey()): Promise<EnquiryReceipt> {
    if (!isBackendConfigured()) {
      // Local demo receipt so the full flow works with no backend.
      // Clearly marked demo — never presented as a confirmed booking.
      await new Promise((r) => setTimeout(r, 600));
      return {
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
      };
    }
    return apiRequest<EnquiryReceipt>("/enquiries", {
      method: "POST",
      body: JSON.stringify({ ...body, idempotency_key: key }),
      idempotencyKey: key,
      auth: false,
    });
  },

  async lookup(reference: string, phone: string): Promise<EnquiryReceipt> {
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
