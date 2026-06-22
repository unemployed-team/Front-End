"use client";

import { useState } from "react";
import Link from "next/link";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/store/auth-store";
import { useAppStore } from "@/store/app-store";
import { simulateAuctionRecovery, getContractExpiryAlerts } from "@/ai/simulator/auction-recovery";
import { cn, formatCurrency, getDaysUntil } from "@/lib/utils";
import {
  Bookmark,
  FileText,
  LogIn,
  Settings,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";

export default function MyPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { bookmarks, contracts } = useAppStore();
  const [showContractForm, setShowContractForm] = useState(false);

  const expiryAlerts = contracts.flatMap((c) =>
    getContractExpiryAlerts(c.endDate).map((msg) => ({
      id: `${c.id}-alert`,
      message: msg,
      buildingId: c.buildingId,
    }))
  );

  if (!isAuthenticated) {
    return (
      <MobileLayout>
        <Header title="마이페이지" />
        <div className="flex flex-col items-center px-4 py-16">
          <div className="rounded-full bg-saferoom-100 p-4">
            <LogIn className="h-8 w-8 text-saferoom-600" />
          </div>
          <p className="mt-4 text-center text-sm text-slate-600">
            로그인하고 관심 건물·계약 정보를 관리하세요
          </p>
          <Link
            href="/login"
            className="mt-6 rounded-xl bg-saferoom-600 px-8 py-3 text-sm font-bold text-white"
          >
            로그인 / 회원가입
          </Link>
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
      <Header
        title="마이페이지"
        right={
          <Link href="/my/settings" className="rounded-lg p-1 text-slate-500">
            <Settings className="h-5 w-5" />
          </Link>
        }
      />

      <div className="space-y-4 p-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-lg font-bold text-slate-900">{user?.nickname}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          {user?.interestRegion && (
            <p className="mt-1 text-xs text-saferoom-600">
              관심 지역: {user.interestRegion.city} {user.interestRegion.district}
            </p>
          )}
        </div>

        {expiryAlerts.length > 0 && (
          <div className="rounded-xl border border-risk-caution/30 bg-risk-caution/5 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-risk-caution">
              <AlertTriangle className="h-4 w-4" />
              계약 만기 알림
            </div>
            <ul className="mt-2 space-y-1">
              {expiryAlerts.map((alert) => (
                <li key={alert.id} className="text-xs text-slate-700">
                  · {alert.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link
          href="/my/bookmarks"
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="flex items-center gap-3">
            <Bookmark className="h-5 w-5 text-saferoom-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">관심 건물</p>
              <p className="text-xs text-slate-500">{bookmarks.length}개 저장됨</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </Link>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-saferoom-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">내 계약 관리</p>
                <p className="text-xs text-slate-500">{contracts.length}건 등록</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowContractForm(!showContractForm)}
              className="text-xs font-medium text-saferoom-600"
            >
              {showContractForm ? "닫기" : "+ 등록"}
            </button>
          </div>

          {showContractForm && <ContractForm onClose={() => setShowContractForm(false)} />}

          {contracts.map((contract) => {
            const simulation = simulateAuctionRecovery({
              deposit: contract.deposit,
              officialPrice: contract.deposit * 1.6,
              seniorMortgage: contract.deposit * 0.4,
              auctionBidRate: 0,
              region: "대구",
              moveInDate: contract.startDate,
              contractDate: contract.startDate,
            });
            const daysLeft = getDaysUntil(contract.endDate);

            return (
              <div
                key={contract.id}
                className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
              >
                <p className="text-xs font-semibold text-slate-900">
                  {contract.building.roadAddress}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  보증금 {formatCurrency(contract.deposit)} · D-{daysLeft}
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-slate-500">예상 회수율</span>
                  <span
                    className={cn(
                      "text-sm font-bold",
                      simulation.depositRecoveryRate >= 80
                        ? "text-risk-safe"
                        : simulation.depositRecoveryRate >= 50
                          ? "text-risk-caution"
                          : "text-risk-danger"
                    )}
                  >
                    {simulation.depositRecoveryRate}%
                  </span>
                </div>
                {simulation.expectedLoss > 0 && (
                  <p className="mt-1 text-xs text-risk-danger">
                    예상 손실 {formatCurrency(simulation.expectedLoss)}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={logout}
          className="w-full rounded-xl border border-slate-200 py-3 text-sm text-slate-500"
        >
          로그아웃
        </button>
      </div>
    </MobileLayout>
  );
}

function ContractForm({ onClose }: { onClose: () => void }) {
  const { addContract } = useAppStore();
  const [deposit, setDeposit] = useState("");
  const [address, setAddress] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addContract({
      id: `contract-${Date.now()}`,
      buildingId: "bld-001",
      building: {
        id: "bld-001",
        pnu: "",
        roadAddress: address,
        jibunAddress: address,
        lat: 35.87,
        lng: 128.6,
        buildingType: "oneroom",
        buildYear: 2000,
        floors: 5,
        householdCount: 10,
        isViolation: false,
        adminDong: "",
      },
      deposit: Number(deposit.replace(/,/g, "")),
      monthlyRent: 0,
      startDate: new Date().toISOString().split("T")[0],
      endDate,
      hasMonthlyRent: false,
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t border-slate-100 pt-3">
      <input
        type="text"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="건물 주소"
        required
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <input
        type="text"
        value={deposit}
        onChange={(e) => setDeposit(e.target.value)}
        placeholder="보증금 (원)"
        required
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        required
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="w-full rounded-lg bg-saferoom-600 py-2 text-sm font-semibold text-white"
      >
        계약 등록
      </button>
    </form>
  );
}
