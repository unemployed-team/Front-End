import { useEffect, useState } from "react";
import type { Building, HRIReport } from "@/types";
import { USE_MOCK } from "@/lib/config";
import {
  DEFAULT_MAP_BOUNDS,
  fetchHeatmap,
  heatmapPointsToBuildings,
  heatmapToScoreMap,
} from "@/lib/api/buildings";

/** 홈 지도: 대구권 고정 영역 히트맵 1회 로드 */
export function useHomeMapData() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [scoreMap, setScoreMap] = useState<
    Map<string, { score: number; grade: HRIReport["grade"] }>
  >(new Map());
  const [loading, setLoading] = useState(!USE_MOCK);

  useEffect(() => {
    if (USE_MOCK) return;

    let cancelled = false;
    (async () => {
      try {
        const heatmap = await fetchHeatmap(DEFAULT_MAP_BOUNDS);
        if (cancelled) return;
        setBuildings(heatmapPointsToBuildings(heatmap.points));
        setScoreMap(heatmapToScoreMap(heatmap.points));
      } catch {
        if (!cancelled) {
          setBuildings([]);
          setScoreMap(new Map());
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { buildings, scoreMap, loading };
}
