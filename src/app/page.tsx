"use client";

import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { KakaoMap } from "@/components/map/KakaoMap";
import { MOCK_BUILDINGS } from "@/lib/constants/mock-data";
import { Layers, MapPin } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [showUniversity, setShowUniversity] = useState(false);

  return (
    <MobileLayout>
      <div className="flex h-[calc(100vh-5rem)] flex-col">
        <div className="border-b border-slate-200 bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black text-saferoom-700">SafeRoom AI</h1>
              <p className="text-xs text-slate-500">
                계약 전에, AI가 위험한 방을 먼저 잡아낸다
              </p>
            </div>
            <Link
              href="/search"
              className="rounded-xl bg-saferoom-600 px-3 py-2 text-xs font-semibold text-white"
            >
              주소 검색
            </Link>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                showHeatmap
                  ? "bg-saferoom-100 text-saferoom-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              위험도 히트맵
            </button>
            <button
              type="button"
              onClick={() => setShowUniversity(!showUniversity)}
              className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                showUniversity
                  ? "bg-saferoom-100 text-saferoom-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <MapPin className="h-3.5 w-3.5" />
              대학가 레이어
            </button>
          </div>
        </div>

        <div className="flex-1">
          <KakaoMap
            buildings={MOCK_BUILDINGS}
            showHeatmap={showHeatmap}
            showUniversityLayer={showUniversity}
          />
        </div>
      </div>
    </MobileLayout>
  );
}
