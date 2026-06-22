"use client";

import { useState } from "react";
import type { TermsAgreement } from "@/types";
import { cn } from "@/lib/utils";

interface TermsModalProps {
  open: boolean;
  onAgree: (terms: TermsAgreement) => void;
}

export function TermsModal({ open, onAgree }: TermsModalProps) {
  const [terms, setTerms] = useState<TermsAgreement>({
    service: false,
    privacy: false,
    location: false,
  });

  if (!open) return null;

  const allRequired = terms.service && terms.privacy;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-t-2xl bg-white p-6 safe-bottom">
        <h2 className="text-lg font-bold text-slate-900">약관 동의</h2>
        <p className="mt-1 text-sm text-slate-500">
          SafeRoom AI 서비스 이용을 위해 약관에 동의해 주세요.
        </p>

        <div className="mt-4 space-y-3">
          {[
            { key: "service" as const, label: "서비스 이용약관 (필수)", required: true },
            { key: "privacy" as const, label: "개인정보 처리방침 (필수)", required: true },
            { key: "location" as const, label: "위치정보 이용 (선택)", required: false },
          ].map(({ key, label, required }) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-3"
            >
              <input
                type="checkbox"
                checked={terms[key]}
                onChange={(e) =>
                  setTerms((prev) => ({ ...prev, [key]: e.target.checked }))
                }
                className="h-4 w-4 rounded border-slate-300 text-saferoom-600"
              />
              <span className="text-sm text-slate-700">
                {label}
                {!required && (
                  <span className="ml-1 text-slate-400">선택</span>
                )}
              </span>
            </label>
          ))}
        </div>

        <button
          type="button"
          disabled={!allRequired}
          onClick={() => onAgree(terms)}
          className={cn(
            "mt-6 w-full rounded-xl py-3.5 text-sm font-bold transition",
            allRequired
              ? "bg-saferoom-600 text-white hover:bg-saferoom-700"
              : "bg-slate-200 text-slate-400"
          )}
        >
          동의하고 계속
        </button>
      </div>
    </div>
  );
}
