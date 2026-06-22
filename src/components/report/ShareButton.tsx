"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { generateShareToken } from "@/lib/utils";

interface ShareButtonProps {
  buildingId: string;
}

export function ShareButton({ buildingId }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const token = generateShareToken(buildingId);
    const url = `${window.location.origin}/report/share/${token}?building=${buildingId}`;

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("리포트 링크를 복사하세요:", url);
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-risk-safe" />
          링크 복사됨
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          리포트 공유
        </>
      )}
    </button>
  );
}
