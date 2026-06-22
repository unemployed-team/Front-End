"use client";

import { BottomNav } from "./BottomNav";

interface MobileLayoutProps {
  children: React.ReactNode;
  hideNav?: boolean;
}

export function MobileLayout({ children, hideNav }: MobileLayoutProps) {
  return (
    <div className="mx-auto min-h-screen max-w-lg bg-slate-50 pb-20">
      {children}
      {!hideNav && <BottomNav />}
    </div>
  );
}
