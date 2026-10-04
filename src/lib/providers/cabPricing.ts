/** Deterministic cab pricing. UI never hardcodes totals. */

export type CabTripType = "local" | "airport" | "oneway" | "roundtrip" | "multiday";
export type CabVehicle = "sedan" | "suv" | "premium" | "luxury";

const VEHICLES: Record<CabVehicle, { base: number; includedKm: number; perKm: number }> = {
  sedan: { base: 1800, includedKm: 100, perKm: 12 },
  suv: { base: 2600, includedKm: 150, perKm: 15 },
  premium: { base: 4500, includedKm: 150, perKm: 22 },
  luxury: { base: 8000, includedKm: 120, perKm: 35 },
};

const TAX_RATE = 0.05;

export interface CabFare {
  baseFare: number;
  includedKm: number;
  extraKm: number;
  extraKmCharge: number;
  tollEstimate: number;
  taxes: number;
  total: number;
}

export function estimateTolls(distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  if (distanceKm < 60) return 0;
  if (distanceKm < 200) return 150;
  return 350;
}

export function calculateCabFare(distanceKm: number, vehicle: CabVehicle, tripType: CabTripType, tolls?: number): CabFare {
  const v = VEHICLES[vehicle] ?? VEHICLES.sedan;
  const distance = Math.max(0, tripType === "roundtrip" ? distanceKm * 2 : distanceKm);
  const extraKm = Math.max(0, Math.round(distance - v.includedKm));
  const extraKmCharge = extraKm * v.perKm;
  const tollEstimate = tolls ?? estimateTolls(distance);
  const taxes = Math.round((v.base + extraKmCharge + tollEstimate) * TAX_RATE);
  return {
    baseFare: v.base,
    includedKm: v.includedKm,
    extraKm,
    extraKmCharge,
    tollEstimate,
    taxes,
    total: v.base + extraKmCharge + tollEstimate + taxes,
  };
}
