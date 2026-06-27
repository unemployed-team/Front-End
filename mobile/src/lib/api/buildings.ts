import type { AddressSuggestion, Building, HRIReport } from "@/types";
import type { BuildingAnalysisResult } from "@/ai/types/analysis";
import { SafeRoomEngine } from "@/ai";
import {
  MOCK_BUILDINGS,
  findBuildingById,
  searchBuildingsByAddress,
} from "@/lib/constants/mock-data";
import { buildMockAnalysisInput } from "@/lib/constants/mock-analysis-data";
import { USE_MOCK } from "@/lib/config";
import { apiClient, ApiError } from "./client";
import {
  toAnalysisExplanations,
  toBuilding,
  toHRIReport,
  toRiskGrade,
} from "./mappers";
import { toApiReportType } from "@/lib/field-report-types";
import type {
  BuildingResponse,
  FieldReportResponse,
  HeatmapResponse,
  HriReportResponse,
} from "./types";

export const MIN_SEARCH_KEYWORD_LENGTH = 2;

function isApiBuildingId(id: string): boolean {
  return /^\d+$/.test(id);
}

export async function searchAddress(query: string): Promise<AddressSuggestion[]> {
  if (query.length < MIN_SEARCH_KEYWORD_LENGTH) return [];

  if (USE_MOCK) {
    return searchBuildingsByAddress(query).map((b) => ({
      id: b.id,
      buildingId: Number(b.id.replace(/\D/g, "")) || undefined,
      roadAddress: b.roadAddress,
      jibunAddress: b.jibunAddress,
      lat: b.lat,
      lng: b.lng,
      pnu: b.pnu,
      adminDong: b.adminDong,
    }));
  }

  const results = await apiClient<BuildingResponse[]>(
    `/buildings/search?keyword=${encodeURIComponent(query)}`,
    { auth: false }
  );

  return results.map((b) => ({
    buildingId: b.buildingId,
    id: String(b.buildingId),
    roadAddress: b.roadAddress,
    jibunAddress: b.jibunAddress,
    lat: b.latitude,
    lng: b.longitude,
    totalScore: b.totalScore ?? undefined,
    riskGrade: b.riskGrade ? toRiskGrade(b.riskGrade) : undefined,
  }));
}

function buildingResponsesToSuggestions(
  results: BuildingResponse[]
): AddressSuggestion[] {
  return results.map((b) => ({
    buildingId: b.buildingId,
    id: String(b.buildingId),
    roadAddress: b.roadAddress,
    jibunAddress: b.jibunAddress,
    lat: b.latitude,
    lng: b.longitude,
    totalScore: b.totalScore ?? undefined,
    riskGrade: b.riskGrade ? toRiskGrade(b.riskGrade) : undefined,
  }));
}

export async function searchNearby(
  lat: number,
  lng: number,
  radius = 500
): Promise<AddressSuggestion[]> {
  if (USE_MOCK) {
    return MOCK_BUILDINGS.filter((b) => {
      const dLat = ((b.lat - lat) * Math.PI) / 180;
      const dLng = ((b.lng - lng) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat * Math.PI) / 180) *
          Math.cos((b.lat * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const km = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return km * 1000 <= radius;
    }).map((b) => ({
      id: b.id,
      buildingId: Number(b.id.replace(/\D/g, "")) || undefined,
      roadAddress: b.roadAddress,
      jibunAddress: b.jibunAddress,
      lat: b.lat,
      lng: b.lng,
    }));
  }

  const q = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radius: String(radius),
  });
  const results = await apiClient<BuildingResponse[]>(
    `/buildings/nearby?${q}`,
    { auth: false }
  );
  return buildingResponsesToSuggestions(results);
}

export async function getBuilding(id: string): Promise<Building | null> {
  if (USE_MOCK) {
    return findBuildingById(id) ?? null;
  }

  if (!isApiBuildingId(id)) return null;

  try {
    const res = await apiClient<BuildingResponse>(`/buildings/${id}`, {
      auth: false,
    });
    return toBuilding(res);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400 || e.status === 500)) {
      return null;
    }
    throw e;
  }
}

async function getHriReportRaw(
  buildingId: string
): Promise<HriReportResponse | null> {
  if (USE_MOCK) return null;
  if (!isApiBuildingId(buildingId)) return null;

  try {
    return await apiClient<HriReportResponse>(`/hri/${buildingId}/report`, {
      auth: false,
    });
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 400 || e.status === 500)) {
      return null;
    }
    throw e;
  }
}

export async function getBuildingAnalysis(
  buildingId: string
): Promise<BuildingAnalysisResult | null> {
  if (USE_MOCK) {
    const building = findBuildingById(buildingId);
    if (!building) return null;
    return SafeRoomEngine.analyzeBuilding(buildMockAnalysisInput(building));
  }

  const [building, hriRes] = await Promise.all([
    getBuilding(buildingId),
    getHriReportRaw(buildingId),
  ]);

  if (!building || !hriRes) return null;

  const report = toHRIReport(hriRes);

  return {
    report,
    features: {
      jeonseRatio: report.jeonseRatio,
      districtDeviation: report.jeonseRatio - report.districtAvgJeonseRatio,
      ltv: 0,
      seniorLtv: 0,
      hasActiveAuction: hriRes.auctions.length > 0 ? 1 : 0,
      fieldReportCount: 0,
      priceTrend: 0,
      priceVolatility: 0,
      contractYears: 0,
      tradeLiquidity: 0,
    },
    riskExplanation: toAnalysisExplanations(hriRes),
  };
}

export async function getBuildingReport(
  buildingId: string
): Promise<HRIReport | null> {
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

  if (!bounds) return [];
  const heatmap = await fetchHeatmap(bounds);
  return heatmapPointsToBuildings(heatmap.points);
}

export const DEFAULT_MAP_BOUNDS = {
  swLat: 35.8,
  swLng: 128.45,
  neLat: 35.95,
  neLng: 128.72,
};

export async function fetchHeatmap(bounds: {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}): Promise<HeatmapResponse> {
  if (USE_MOCK) {
    const buildings = await getMapBuildings(bounds);
    return {
      points: buildings.map((b) => {
        const { report } = SafeRoomEngine.analyzeBuilding(buildMockAnalysisInput(b));
        return {
          buildingId: Number(b.id.replace(/\D/g, "")) || 0,
          lat: b.lat,
          lng: b.lng,
          score: report.totalScore,
          riskGrade: report.grade.toUpperCase(),
        };
      }),
    };
  }

  const q = new URLSearchParams({
    swLat: String(bounds.swLat),
    swLng: String(bounds.swLng),
    neLat: String(bounds.neLat),
    neLng: String(bounds.neLng),
  });
  return apiClient<HeatmapResponse>(`/buildings/heatmap?${q}`, { auth: false });
}

export function heatmapPointsToBuildings(
  points: HeatmapResponse["points"]
): Building[] {
  return points.map((p) => ({
    id: String(p.buildingId),
    pnu: "",
    roadAddress: `건물 #${p.buildingId}`,
    jibunAddress: "",
    lat: p.lat,
    lng: p.lng,
    buildingType: "oneroom" as const,
    buildYear: 0,
    floors: 0,
    householdCount: 0,
    isViolation: false,
    adminDong: "",
  }));
}

export function heatmapToScoreMap(
  points: HeatmapResponse["points"]
): Map<string, { score: number; grade: HRIReport["grade"] }> {
  const map = new Map<string, { score: number; grade: HRIReport["grade"] }>();
  for (const p of points) {
    map.set(String(p.buildingId), {
      score: p.score,
      grade: toRiskGrade(p.riskGrade),
    });
  }
  return map;
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

  if (!isApiBuildingId(data.buildingId)) {
    throw new ApiError(400, "유효하지 않은 건물 ID입니다.");
  }

  await apiClient<FieldReportResponse>(
    `/field-reports/${data.buildingId}/submit`,
    {
      method: "POST",
      auth: false,
      body: JSON.stringify({
        reportType: toApiReportType(data.type),
        description: data.description,
      }),
    }
  );
  return { success: true };
}

export function getBuildingScores(
  buildings: Building[],
  externalScores?: Map<string, { score: number; grade: HRIReport["grade"] }>
): Map<string, { score: number; grade: HRIReport["grade"] }> {
  if (externalScores) return externalScores;

  const map = new Map<string, { score: number; grade: HRIReport["grade"] }>();
  for (const b of buildings) {
    if (USE_MOCK) {
      const { report } = SafeRoomEngine.analyzeBuilding(buildMockAnalysisInput(b));
      map.set(b.id, { score: report.totalScore, grade: report.grade });
    }
  }
  return map;
}
