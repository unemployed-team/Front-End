"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title: string;
  showBack?: boolean;
  right?: React.ReactNode;
  className?: string;
}

export function Header({ title, showBack, right, className }: HeaderProps) {
  const router = useRouter();

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex items-center gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur",
        className
      )}
    >
      {showBack && (
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg p-1 text-slate-600 hover:bg-slate-100"
          aria-label="뒤로가기"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="flex-1 truncate text-lg font-bold text-slate-900">{title}</h1>
      {right}
    </header>
  );
}
