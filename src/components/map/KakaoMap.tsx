"use client";

import { useEffect, useRef, useState } from "react";
import type { Building, MapCluster } from "@/types";
import { getRiskGrade, getRiskGradeLabel } from "@/lib/utils";
import { MOCK_CLUSTERS } from "@/lib/constants/mock-data";
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
  onBuildingClick,
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const mapInstance = useRef<kakao.maps.Map | null>(null);

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_KAKAO_APP_KEY;
    if (!key || key === "your_kakao_javascript_key") {
      setMapReady(false);
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&autoload=false&libraries=clusterer`;
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

    window.kakao.maps.event.addListener(map, "zoom_changed", () => {
      setCurrentZoom(map.getLevel());
    });

    return () => {
      mapInstance.current = null;
    };
  }, [mapReady, center.lat, center.lng, zoom]);

  useEffect(() => {
    if (!mapInstance.current || !mapReady) return;
    const map = mapInstance.current;

    if (currentZoom > 6) {
      renderClusters(map, MOCK_CLUSTERS);
    } else {
      renderBuildingPins(map, buildings, onBuildingClick);
    }
  }, [mapReady, currentZoom, buildings, onBuildingClick]);

  if (!process.env.NEXT_PUBLIC_KAKAO_APP_KEY ||
      process.env.NEXT_PUBLIC_KAKAO_APP_KEY === "your_kakao_javascript_key") {
    return <FallbackMap buildings={buildings} showHeatmap={showHeatmap} />;
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />
      {showUniversityLayer && (
        <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-saferoom-700 shadow">
          대학가 레이어 ON
        </div>
      )}
    </div>
  );
}

function renderClusters(map: kakao.maps.Map, clusters: MapCluster[]) {
  clusters.forEach((cluster) => {
    const content = document.createElement("div");
    content.className =
      "flex h-10 w-10 items-center justify-center rounded-full bg-saferoom-600 text-xs font-bold text-white shadow-lg";
    content.textContent = String(cluster.count);

    new window.kakao.maps.CustomOverlay({
      map,
      position: new window.kakao.maps.LatLng(cluster.lat, cluster.lng),
      content,
    });
  });
}

function renderBuildingPins(
  map: kakao.maps.Map,
  buildings: Building[],
  onBuildingClick?: (building: Building) => void
) {
  buildings.forEach((building, i) => {
    const seed = building.id.charCodeAt(building.id.length - 1);
    const score = 30 + seed * 7 + (building.isViolation ? 20 : 0);
    const grade = getRiskGrade(score);

    const el = document.createElement("a");
    el.href = `/building/${building.id}`;
    el.className =
      "flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-white shadow-md";
    el.style.backgroundColor = scoreToColor(score);
    el.textContent = getRiskGradeLabel(grade);
    el.onclick = (e) => {
      if (onBuildingClick) {
        e.preventDefault();
        onBuildingClick(building);
      }
    };

    new window.kakao.maps.CustomOverlay({
      map,
      position: new window.kakao.maps.LatLng(building.lat, building.lng),
      content: el,
    });
  });
}

function FallbackMap({
  buildings,
  showHeatmap,
}: {
  buildings: Building[];
  showHeatmap: boolean;
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-slate-200">
      <div className="absolute inset-0 bg-gradient-to-br from-saferoom-100 to-slate-300" />
      <div className="absolute left-3 top-3 rounded-lg bg-white/90 px-3 py-2 text-xs text-slate-600 shadow">
        카카오맵 API 키 설정 시 실제 지도가 표시됩니다
      </div>
      {showHeatmap && (
        <div className="absolute right-3 top-3 flex flex-col gap-1 rounded-lg bg-white/90 p-2 text-xs shadow">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-risk-safe" /> 안전
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-risk-caution" /> 주의
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-risk-danger" /> 위험
          </span>
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-3 p-4">
          {buildings.slice(0, 4).map((b, i) => {
            const seed = b.id.charCodeAt(b.id.length - 1);
            const score = 30 + seed * 7;
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
