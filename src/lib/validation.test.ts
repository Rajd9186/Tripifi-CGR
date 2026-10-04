import { describe, expect, it } from "vitest";
import {
  normalizeIndianPhone,
  validateCabSearch,
  validateEnquiry,
  validateFlightSearch,
  validateHotelSearch,
  validateTrainSearch,
} from "./validation";

describe("flight search validation", () => {
  it("accepts a valid search", () => {
    expect(
      validateFlightSearch({ from: "Kolkata (CCU)", to: "Delhi (DEL)", departure: "2099-11-10", travellers: 2 })
    ).toEqual({});
  });

  it("rejects same origin and destination", () => {
    const errs = validateFlightSearch({ from: "Delhi", to: "delhi", departure: "2099-11-10", travellers: 1 });
    expect(errs.to).toBeDefined();
  });

  it("rejects past departure and bad return order", () => {
    const errs = validateFlightSearch({ from: "A", to: "B", departure: "2000-01-01", return: "1999-12-31", travellers: 0 });
    expect(errs.departure).toBeDefined();
    expect(errs.return).toBeDefined();
    expect(errs.travellers).toBeDefined();
  });

  it("requires origin and destination", () => {
    const errs = validateFlightSearch({ from: "", to: "", departure: "2099-01-01", travellers: 1 });
    expect(errs.from).toBeDefined();
    expect(errs.to).toBeDefined();
  });
});

describe("train search validation", () => {
  it("rejects past dates", () => {
    expect(validateTrainSearch({ from: "HWH", to: "NDLS", date: "2000-01-01", travellers: 1 }).date).toBeDefined();
  });
});

describe("cab search validation", () => {
  it("requires pickup and drop", () => {
    const errs = validateCabSearch({ pickup: "", drop: "", date: "" });
    expect(errs.pickup).toBeDefined();
    expect(errs.drop).toBeDefined();
  });
});

describe("hotel search validation", () => {
  it("requires checkout after checkin", () => {
    const errs = validateHotelSearch({ destination: "Goa", checkin: "2099-05-10", checkout: "2099-05-10" });
    expect(errs.checkout).toBeDefined();
  });
});

describe("phone normalization", () => {
  it("normalizes Indian numbers", () => {
    expect(normalizeIndianPhone("9876543210")).toBe("+919876543210");
    expect(normalizeIndianPhone("+91 98765 43210")).toBe("+919876543210");
    expect(normalizeIndianPhone("12345")).toBeNull();
  });
});

describe("enquiry validation", () => {
  it("requires name, phone, consent", () => {
    const errs = validateEnquiry({ name: "", phone: "123", travellers: 0, consent: false });
    expect(errs.name).toBeDefined();
    expect(errs.phone).toBeDefined();
    expect(errs.travellers).toBeDefined();
    expect(errs.consent).toBeDefined();
  });
});
