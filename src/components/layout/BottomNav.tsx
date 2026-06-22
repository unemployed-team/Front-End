"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, GitCompare, User } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "지도", icon: Home },
  { href: "/search", label: "검색", icon: Search },
  { href: "/compare", label: "비교", icon: GitCompare },
  { href: "/my", label: "마이", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  const hiddenPaths = ["/login", "/onboarding", "/report/qr"];
  if (hiddenPaths.some((p) => pathname.startsWith(p))) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 rounded-lg px-4 py-1.5 text-xs transition-colors",
                active ? "text-saferoom-600" : "text-slate-400"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span className={cn(active && "font-semibold")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
