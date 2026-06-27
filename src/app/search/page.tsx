"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Header } from "@/components/layout/Header";
import { MIN_SEARCH_KEYWORD_LENGTH, searchAddress, searchNearby } from "@/lib/api/buildings";
import { ApiError } from "@/lib/api/client";
import type { AddressSuggestion } from "@/types";
import { Search as SearchIcon, MapPin, Navigation } from "lucide-react";

const NEARBY_RADIUS_OPTIONS = [500, 1000, 2000] as const;

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [nearbyRadius, setNearbyRadius] = useState<(typeof NEARBY_RADIUS_OPTIONS)[number]>(500);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  const handleNearbySearch = useCallback(async () => {
    setSearchError(null);
    setNearbyLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("이 브라우저는 위치 정보를 지원하지 않습니다."));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        });
      });
      const results = await searchNearby(
        position.coords.latitude,
        position.coords.longitude,
        nearbyRadius
      );
      setQuery(`내 주변 ${nearbyRadius}m`);
      setSuggestions(results);
    } catch (e) {
      setSuggestions([]);
      setSearchError(
        e instanceof ApiError
          ? e.message
          : e instanceof Error
            ? e.message
            : "주변 검색에 실패했습니다."
      );
    } finally {
      setNearbyLoading(false);
    }
  }, [nearbyRadius]);

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);
    setSearchError(null);
    if (value.length < MIN_SEARCH_KEYWORD_LENGTH) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchAddress(value);
      setSuggestions(results);
    } catch (e) {
      setSuggestions([]);
      setSearchError(
        e instanceof ApiError ? e.message : "검색 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = (suggestion: AddressSuggestion) => {
    const targetId = suggestion.id ?? suggestion.buildingId?.toString();
    if (!targetId) return;
    router.push(`/building/${targetId}`);
  };

  return (
    <MobileLayout>
      <Header title="주소 검색" showBack />
      <div className="p-4">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="도로명·지번 주소 입력 (2글자 이상)"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-saferoom-500 focus:ring-2 focus:ring-saferoom-500/20"
            autoFocus
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleNearbySearch}
            disabled={nearbyLoading}
            className="flex items-center gap-1.5 rounded-xl border border-saferoom-200 bg-saferoom-50 px-3 py-2 text-xs font-semibold text-saferoom-700 disabled:opacity-50"
          >
            <Navigation className="h-3.5 w-3.5" />
            {nearbyLoading ? "주변 검색 중..." : "내 주변 건물"}
          </button>
          {NEARBY_RADIUS_OPTIONS.map((radius) => (
            <button
              key={radius}
              type="button"
              onClick={() => setNearbyRadius(radius)}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium ${
                nearbyRadius === radius
                  ? "bg-saferoom-600 text-white"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {radius >= 1000 ? `${radius / 1000}km` : `${radius}m`}
            </button>
          ))}
        </div>

        {query.length > 0 && query.length < MIN_SEARCH_KEYWORD_LENGTH && (
          <p className="mt-2 text-xs text-slate-400">2글자 이상 입력해 주세요</p>
        )}

        {loading && (
          <p className="mt-4 text-center text-sm text-slate-500">검색 중...</p>
        )}

        {searchError && (
          <p className="mt-4 text-center text-sm text-risk-danger">{searchError}</p>
        )}

        {!loading &&
          !searchError &&
          query.length >= MIN_SEARCH_KEYWORD_LENGTH &&
          suggestions.length === 0 && (
          <p className="mt-4 text-center text-sm text-slate-500">
            검색 결과가 없습니다.
          </p>
        )}

        <ul className="mt-4 space-y-2">
          {suggestions.map((s) => (
            <li key={s.id ?? s.buildingId ?? s.roadAddress}>
              <button
                type="button"
                onClick={() => handleSelect(s)}
                disabled={!s.id && s.buildingId == null}
                className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-saferoom-300 disabled:opacity-50"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saferoom-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{s.roadAddress}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{s.jibunAddress}</p>
                  {s.totalScore != null && (
                    <p className="mt-1 text-xs text-saferoom-600">
                      HRI {s.totalScore}점
                      {s.riskGrade &&
                        ` · ${s.riskGrade === "safe" ? "안전" : s.riskGrade === "danger" ? "위험" : "주의"}`}
                    </p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </MobileLayout>
  );
}
