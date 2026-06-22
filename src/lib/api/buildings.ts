import type { AddressSuggestion, Building, HRIReport } from "@/types";
import {
  MOCK_BUILDINGS,
  findBuildingById,
  searchBuildingsByAddress,
} from "@/lib/constants/mock-data";
import { generateMockHRIReport } from "@/ai/hri-score/calculator";

const USE_MOCK = true;

export async function searchAddress(query: string): Promise<AddressSuggestion[]> {
  if (query.length < 3) return [];

  if (USE_MOCK) {
    return searchBuildingsByAddress(query).map((b) => ({
      roadAddress: b.roadAddress,
      jibunAddress: b.jibunAddress,
      lat: b.lat,
      lng: b.lng,
      pnu: b.pnu,
      adminDong: b.adminDong,
    }));
  }

  // Kakao 주소 API → 백엔드 PNU 매핑
  return [];
}

export async function getBuilding(id: string): Promise<Building | null> {
  if (USE_MOCK) {
    return findBuildingById(id) ?? null;
  }
  return null;
}

export async function getBuildingReport(buildingId: string): Promise<HRIReport | null> {
  if (USE_MOCK) {
    const building = findBuildingById(buildingId);
    if (!building) return null;
    return generateMockHRIReport(building);
  }
  return null;
}

export async function getMapBuildings(bounds?: {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}): Promise<Building[]> {
  if (USE_MOCK) {
    if (!bounds) return MOCK_BUILDINGS;
    return MOCK_BUILDINGS.filter(
      (b) =>
        b.lat >= bounds.swLat &&
        b.lat <= bounds.neLat &&
        b.lng >= bounds.swLng &&
        b.lng <= bounds.neLng
    );
  }
  return [];
}

export async function submitFieldReport(data: {
  buildingId: string;
  type: string;
  description: string;
}): Promise<{ success: boolean }> {
  if (USE_MOCK) {
    console.info("[Mock] Field report submitted:", data);
    return { success: true };
  }
  return { success: false };
}
