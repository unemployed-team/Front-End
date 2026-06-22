import type { AddressSuggestion, Building, HRIReport } from "@/types";
import {
  findBuildingById,
  searchBuildingsByAddress,
} from "@/lib/constants/mock-data";
import { generateMockHRIReport } from "@/ai/hri-score/calculator";

export async function searchAddress(query: string): Promise<AddressSuggestion[]> {
  if (query.length < 3) return [];
  return searchBuildingsByAddress(query).map((b) => ({
    roadAddress: b.roadAddress,
    jibunAddress: b.jibunAddress,
    lat: b.lat,
    lng: b.lng,
    pnu: b.pnu,
    adminDong: b.adminDong,
  }));
}

export async function getBuilding(id: string): Promise<Building | null> {
  return findBuildingById(id) ?? null;
}

export async function getBuildingReport(buildingId: string): Promise<HRIReport | null> {
  const building = findBuildingById(buildingId);
  if (!building) return null;
  return generateMockHRIReport(building);
}

export async function submitFieldReport(data: {
  buildingId: string;
  type: string;
  description: string;
}): Promise<{ success: boolean }> {
  console.info("[Mock] Field report submitted:", data);
  return { success: true };
}
