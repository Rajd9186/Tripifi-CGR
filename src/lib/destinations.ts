import {
  DESTINATIONS as rawDestinations,
  type Destination,
  findDestination as findDest,
  searchDestinations as searchDest,
} from "@/data/destinations";

export type { Destination };
export const DESTINATIONS = rawDestinations;
export const findDestination = findDest;
export const searchDestinations = searchDest;
