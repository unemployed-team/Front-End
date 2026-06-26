import type { AddressSuggestion, Building, HRIReport } from "@/types";
import type { BuildingAnalysisResult } from "@/ai/types/analysis";
import { SafeRoomEngine } from "@/ai";
import {
  MOCK_BUILDINGS,
  findBuildingById,
  searchBuildingsByAddress,
} from "@/lib/constants/mock-data";
import { buildMockAnalysisInput } from "@/lib/constants/mock-analysis-data";

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

  return [];
}

export async function getBuilding(id: string): Promise<Building | null> {
  if (USE_MOCK) {
    return findBuildingById(id) ?? null;
  }
  return null;
}

/** AI 엔진 종합 분석 (HRI + ML 위험 예측 + 경매 시뮬레이션) */
export async function getBuildingAnalysis(
  buildingId: string
): Promise<BuildingAnalysisResult | null> {
  if (USE_MOCK) {
    const building = findBuildingById(buildingId);
    if (!building) return null;
    return SafeRoomEngine.analyzeBuilding(buildMockAnalysisInput(building));
  }
  return null;
}

export async function getBuildingReport(buildingId: string): Promise<HRIReport | null> {
  const analysis = await getBuildingAnalysis(buildingId);
  return analysis?.report ?? null;
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

/** 지도용 건물별 HRI 점수 일괄 산출 */
export function getBuildingScores(
  buildings: Building[]
): Map<string, { score: number; grade: HRIReport["grade"] }> {
  const map = new Map<string, { score: number; grade: HRIReport["grade"] }>();
  for (const b of buildings) {
    const { report } = SafeRoomEngine.analyzeBuilding(buildMockAnalysisInput(b));
    map.set(b.id, { score: report.totalScore, grade: report.grade });
  }
  return map;
}
