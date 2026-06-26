import type { Building, MapCluster } from "@/types";
import { getRiskGrade } from "@/lib/utils";
import type { HRIReport } from "@/types";

interface ClusterPoint {
  building: Building;
  report: HRIReport;
}

/**
 * 지도 축소 시 클러스터링 (PostGIS ST_ClusterKMeans 대체용 클라이언트 헬퍼)
 * 백엔드 PostGIS GIST 인덱스 연동 시 이 인터페이스 유지
 */
export function clusterBuildings(
  points: ClusterPoint[],
  zoomLevel: number
): MapCluster[] {
  if (!points.length) return [];

  const cellSize = zoomLevel < 12 ? 0.02 : zoomLevel < 14 ? 0.008 : 0.003;
  const grid = new Map<string, ClusterPoint[]>();

  for (const point of points) {
    const cellLat = Math.floor(point.building.lat / cellSize) * cellSize;
    const cellLng = Math.floor(point.building.lng / cellSize) * cellSize;
    const key = `${cellLat.toFixed(4)},${cellLng.toFixed(4)}`;
    const bucket = grid.get(key) ?? [];
    bucket.push(point);
    grid.set(key, bucket);
  }

  const clusters: MapCluster[] = [];
  let idx = 0;

  for (const [, bucket] of grid) {
    const avgLat =
      bucket.reduce((s, p) => s + p.building.lat, 0) / bucket.length;
    const avgLng =
      bucket.reduce((s, p) => s + p.building.lng, 0) / bucket.length;
    const avgScore =
      bucket.reduce((s, p) => s + p.report.totalScore, 0) / bucket.length;

    clusters.push({
      id: `cluster-${idx++}`,
      lat: avgLat,
      lng: avgLng,
      count: bucket.length,
      avgScore: Math.round(avgScore),
    });
  }

  return clusters;
}

/** HRI Score → 히트맵 색상 등급 */
export function scoreToHeatmapGrade(score: number): "safe" | "caution" | "danger" {
  return getRiskGrade(score);
}

/** 대학가 반경 필터 (계명대·경북대·영남대 MVP 엣지) */
export const UNIVERSITY_ZONES = {
  keimyung: { name: "계명대", lat: 35.8531, lng: 128.4856, radiusKm: 2 },
  kyungpook: { name: "경북대", lat: 35.8903, lng: 128.6124, radiusKm: 2.5 },
  yeungnam: { name: "영남대", lat: 35.8714, lng: 128.6014, radiusKm: 2 },
} as const;

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function filterByUniversityZone(
  buildings: Building[],
  zone: keyof typeof UNIVERSITY_ZONES
): Building[] {
  const { lat, lng, radiusKm } = UNIVERSITY_ZONES[zone];
  return buildings.filter(
    (b) => haversineKm(b.lat, b.lng, lat, lng) <= radiusKm
  );
}
