"use client";

import { useEffect, useRef, useState } from "react";
import type { Building, HRIReport } from "@/types";
import { getRiskGradeLabel } from "@/lib/utils";
import { getBuildingScores } from "@/lib/api/buildings";
import Link from "next/link";

declare global {
  interface Window {
    kakao: typeof kakao;
  }
}

interface KakaoMapProps {
  buildings: Building[];
  center?: { lat: number; lng: number };
  zoom?: number;
  showHeatmap?: boolean;
  showUniversityLayer?: boolean;
  buildingScores?: Map<string, { score: number; grade: HRIReport["grade"] }>;
  mapLoading?: boolean;
  onBuildingClick?: (building: Building) => void;
}

function scoreToColor(score: number): string {
  if (score < 35) return "#22c55e";
  if (score < 65) return "#f59e0b";
  return "#ef4444";
}

export function KakaoMap({
  buildings,
  center = { lat: 35.8719, lng: 128.6016 },
  zoom = 5,
  showHeatmap = true,
  showUniversityLayer = false,
  buildingScores,
  mapLoading = false,
  onBuildingClick,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const mapInstance = useRef<kakao.maps.Map | null>(null);
  const overlaysRef = useRef<kakao.maps.CustomOverlay[]>([]);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
    if (!key || key === "your_kakao_javascript_key") {
      setMapReady(false);
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => setMapReady(true));
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    const map = new window.kakao.maps.Map(mapRef.current, {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: zoom,
    });
    mapInstance.current = map;

    return () => {
      mapInstance.current = null;
    };
  }, [mapReady, center.lat, center.lng, zoom]);

  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    const map = mapInstance.current;

    overlaysRef.current.forEach((overlay) => overlay.setMap(null));
    overlaysRef.current = [];

    const scores = getBuildingScores(buildings, buildingScores);
    buildings.forEach((building) => {
      const data = scores.get(building.id);
      const score = data?.score ?? 50;
      const grade = data?.grade ?? "caution";

      const el = document.createElement("a");
      el.href = `/building/${building.id}`;
      el.className =
        "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-white shadow-md";
      el.style.backgroundColor = showHeatmap ? scoreToColor(score) : "#0d9488";
      el.textContent = `${getRiskGradeLabel(grade)} ${score}`;
      el.onclick = (e) => {
        if (onBuildingClick) {
          e.preventDefault();
          onBuildingClick(building);
        }
      };

      const overlay = new window.kakao.maps.CustomOverlay({
        map,
        position: new window.kakao.maps.LatLng(building.lat, building.lng),
        content: el,
      });
      overlaysRef.current.push(overlay);
    });
  }, [mapReady, buildings, buildingScores, onBuildingClick, showHeatmap]);

  if (
    !process.env.NEXT_PUBLIC_KAKAO_APP_KEY ||
    process.env.NEXT_PUBLIC_KAKAO_APP_KEY === "your_kakao_javascript_key"
  ) {
    return (
      <FallbackMap
        buildings={buildings}
        showHeatmap={showHeatmap}
        buildingScores={buildingScores}
        mapLoading={mapLoading}
      />
    );
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      {mapLoading && (
        <div className="absolute inset-x-0 top-3 flex justify-center">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs text-slate-600 shadow">
            지도 데이터 불러오는 중...
          </span>
        </div>
      )}
      {showHeatmap && (
        <div className="absolute right-3 top-3 flex flex-col gap-1 rounded-lg bg-white/90 p-2 text-xs shadow">
          <span className="font-semibold text-slate-700">HRI 위험도</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-risk-safe" /> 안전 0~34
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-risk-caution" /> 주의 35~64
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-risk-danger" /> 위험 65~100
          </span>
        </div>
      )}
      {showUniversityLayer && (
        <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-saferoom-700 shadow">
          대학가 레이어 ON
        </div>
      )}
    </div>
  );
}

function FallbackMap({
  buildings,
  showHeatmap,
  buildingScores,
  mapLoading,
}: {
  buildings: Building[];
  showHeatmap: boolean;
  buildingScores?: Map<string, { score: number; grade: HRIReport["grade"] }>;
  mapLoading?: boolean;
}) {
  const scores = getBuildingScores(buildings, buildingScores);

  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-200">
      <div className="absolute inset-0 bg-gradient-to-br from-saferoom-100 to-slate-300" />
      <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-600 shadow">
        카카오맵 API 키 설정 시 지도가 표시됩니다
      </div>
      {mapLoading && (
        <div className="absolute inset-x-0 top-12 flex justify-center text-xs text-slate-500">
          불러오는 중...
        </div>
      )}
      {showHeatmap && (
        <div className="absolute right-3 top-3 flex flex-col gap-1 rounded-lg bg-white/90 p-2 text-xs shadow">
          <span className="font-semibold text-slate-700">HRI 위험도</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-risk-safe" /> 안전 0~34
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-risk-caution" /> 주의 35~64
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-risk-danger" /> 위험 65~100
          </span>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center overflow-y-auto p-4">
        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          {buildings.slice(0, 4).map((b) => {
            const data = scores.get(b.id);
            const score = data?.score ?? 50;
            return (
              <Link
                key={b.id}
                href={`/building/${b.id}`}
                className="rounded-xl border border-white/50 bg-white/80 p-3 shadow backdrop-blur transition hover:scale-105"
              >
                <div
                  className="mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: scoreToColor(score) }}
                >
                  HRI {score}
                </div>
                <p className="text-xs font-medium text-slate-800 line-clamp-2">
                  {b.roadAddress}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
