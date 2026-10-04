import { apiRequest, isBackendConfigured } from "./client";
import type { PackageOffer } from "@/lib/api/types";

export interface PackageListResponse {
  results: PackageOffer[];
}

export async function listPackages(): Promise<PackageListResponse> {
  if (!isBackendConfigured()) return { results: [] };
  const res = await apiRequest<PackageListResponse>("/packages", { auth: false });
  return res;
}

export async function getPackage(slug: string): Promise<PackageOffer | null> {
  if (!isBackendConfigured()) return null;
  try {
    return await apiRequest<PackageOffer>(`/packages/${slug}`, { auth: false });
  } catch {
    return null;
  }
}