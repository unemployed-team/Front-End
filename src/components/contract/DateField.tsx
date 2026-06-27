"use client";

import { useRef } from "react";
import { Calendar } from "lucide-react";

interface DateFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function DateField({ label, value, onChange, required }: DateFieldProps) {
  const pickerRef = useRef<HTMLInputElement>(null);

  const openPicker = () => {
    const el = pickerRef.current;
    if (!el) return;
    if (typeof el.showPicker === "function") {
      el.showPicker();
    } else {
      el.focus();
      el.click();
    }
  };

  const handleTextChange = (raw: string) => {
    onChange(raw);
  };

  const handleTextBlur = () => {
    if (!value) return;
    if (!DATE_PATTERN.test(value)) return;
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return;
    onChange(value.slice(0, 10));
  };

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => handleTextChange(e.target.value)}
          onBlur={handleTextBlur}
          placeholder="YYYY-MM-DD"
          required={required}
          inputMode="numeric"
          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={openPicker}
          className="flex shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-slate-600 hover:bg-slate-50"
          aria-label={`${label} 달력 열기`}
        >
          <Calendar className="h-4 w-4" />
        </button>
        <input
          ref={pickerRef}
          type="date"
          value={DATE_PATTERN.test(value) ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
          tabIndex={-1}
          aria-hidden
        />
      </div>
      <p className="text-[11px] text-slate-400">직접 입력 또는 달력 아이콘으로 선택</p>
    </div>
  );
}
