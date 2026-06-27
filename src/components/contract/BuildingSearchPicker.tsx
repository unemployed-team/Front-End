"use client";

import { useCallback, useState } from "react";
import { Search, MapPin, X } from "lucide-react";
import { MIN_SEARCH_KEYWORD_LENGTH, searchAddress } from "@/lib/api/buildings";
import { ApiError } from "@/lib/api/client";
import type { AddressSuggestion } from "@/types";

export interface SelectedBuilding {
  buildingId: number;
  label: string;
}

interface BuildingSearchPickerProps {
  value: SelectedBuilding | null;
  onChange: (value: SelectedBuilding | null) => void;
}

function resolveBuildingId(suggestion: AddressSuggestion): number | null {
  if (suggestion.buildingId != null) return suggestion.buildingId;
  if (suggestion.id && /^\d+$/.test(suggestion.id)) return Number(suggestion.id);
  return null;
}

export function BuildingSearchPicker({
  value,
  onChange,
}: BuildingSearchPickerProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (keyword: string) => {
    setQuery(keyword);
    setError(null);
    if (keyword.length < MIN_SEARCH_KEYWORD_LENGTH) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchAddress(keyword);
      setSuggestions(results);
    } catch (e) {
      setSuggestions([]);
      setError(e instanceof ApiError ? e.message : "건물 검색에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = (suggestion: AddressSuggestion) => {
    const buildingId = resolveBuildingId(suggestion);
    if (buildingId == null) {
      setError("선택한 건물 ID를 확인할 수 없습니다.");
      return;
    }
    onChange({
      buildingId,
      label: suggestion.roadAddress || suggestion.jibunAddress,
    });
    setQuery("");
    setSuggestions([]);
    setError(null);
  };

  return (
    <div className="space-y-2">
      <label className="text-xs font-medium text-slate-600">건물 검색</label>

      {value ? (
        <div className="flex items-start gap-2 rounded-lg border border-saferoom-200 bg-saferoom-50 px-3 py-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saferoom-600" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-slate-900">{value.label}</p>
            <p className="text-xs text-slate-500">건물 ID {value.buildingId}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="rounded p-1 text-slate-400 hover:bg-white hover:text-slate-600"
            aria-label="건물 선택 해제"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="도로명·지번·동 이름 검색 (2글자 이상)"
              className="w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm"
            />
          </div>
          {query.length > 0 && query.length < MIN_SEARCH_KEYWORD_LENGTH && (
            <p className="text-xs text-slate-400">2글자 이상 입력해 주세요.</p>
          )}
          {loading && (
            <p className="text-xs text-slate-400">검색 중...</p>
          )}
          {error && <p className="text-xs text-risk-danger">{error}</p>}
          {suggestions.length > 0 && (
            <ul className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white">
              {suggestions.map((s, i) => {
                const id = resolveBuildingId(s);
                return (
                  <li key={`${s.roadAddress}-${i}`}>
                    <button
                      type="button"
                      onClick={() => handleSelect(s)}
                      disabled={id == null}
                      className="w-full border-b border-slate-100 px-3 py-2 text-left last:border-0 hover:bg-slate-50 disabled:opacity-50"
                    >
                      <p className="text-sm text-slate-900">{s.roadAddress}</p>
                      {s.jibunAddress && (
                        <p className="text-xs text-slate-500">{s.jibunAddress}</p>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
