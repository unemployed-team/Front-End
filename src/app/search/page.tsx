"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Header } from "@/components/layout/Header";
import { searchAddress } from "@/lib/api/buildings";
import type { AddressSuggestion } from "@/types";
import { Search as SearchIcon, MapPin } from "lucide-react";

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async (value: string) => {
    setQuery(value);
    if (value.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const results = await searchAddress(value);
      setSuggestions(results);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSelect = (suggestion: AddressSuggestion) => {
    const matched = suggestions.find((s) => s.roadAddress === suggestion.roadAddress);
    if (matched) {
      router.push(`/search?q=${encodeURIComponent(suggestion.roadAddress)}`);
    }
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
            placeholder="도로명·지번 주소 입력 (3글자 이상)"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-saferoom-500 focus:ring-2 focus:ring-saferoom-500/20"
            autoFocus
          />
        </div>

        {query.length > 0 && query.length < 3 && (
          <p className="mt-2 text-xs text-slate-400">3글자 이상 입력해 주세요</p>
        )}

        {loading && (
          <p className="mt-4 text-center text-sm text-slate-500">검색 중...</p>
        )}

        <ul className="mt-4 space-y-2">
          {suggestions.map((s) => (
            <li key={s.roadAddress}>
              <button
                type="button"
                onClick={() => {
                  const building = suggestions.indexOf(s);
                  router.push(`/building/bld-00${building + 1}`);
                }}
                className="flex w-full items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-saferoom-300"
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-saferoom-600" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">{s.roadAddress}</p>
                  <p className="mt-0.5 text-xs text-slate-500">{s.jibunAddress}</p>
                  {s.adminDong && (
                    <p className="mt-1 text-xs text-saferoom-600">{s.adminDong}</p>
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
