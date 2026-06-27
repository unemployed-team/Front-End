"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { Header } from "@/components/layout/Header";
import { useAuthStore } from "@/store/auth-store";
import { logoutApi } from "@/lib/api/auth";
import { getMyBookmarks } from "@/lib/api/bookmarks";
import {
  getMyContracts,
  registerContract,
  updateContract,
  deleteContract,
  simulateContract,
} from "@/lib/api/contracts";
import type { ContractResponse, SimulationResponse } from "@/lib/api/types";
import { cn, formatCurrency, getDaysUntil } from "@/lib/utils";
import {
  Bookmark,
  FileText,
  LogIn,
  Settings,
  ChevronRight,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  BuildingSearchPicker,
  type SelectedBuilding,
} from "@/components/contract/BuildingSearchPicker";
import { DateField } from "@/components/contract/DateField";

export default function MyPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [contracts, setContracts] = useState<ContractResponse[]>([]);
  const [simulations, setSimulations] = useState<Record<number, SimulationResponse>>({});
  const [showContractForm, setShowContractForm] = useState(false);
  const [editingContract, setEditingContract] = useState<ContractResponse | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [bookmarks, contractList] = await Promise.all([
        getMyBookmarks(),
        getMyContracts(),
      ]);
      setBookmarkCount(bookmarks.length);
      setContracts(contractList);

      const simEntries = await Promise.all(
        contractList.map(async (c) => {
          try {
            const sim = await simulateContract(c.contractId);
            return [c.contractId, sim] as const;
          } catch {
            return null;
          }
        })
      );
      const simMap: Record<number, SimulationResponse> = {};
      for (const entry of simEntries) {
        if (entry) simMap[entry[0]] = entry[1];
      }
      setSimulations(simMap);
    } catch {
      setBookmarkCount(0);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) loadData();
  }, [isAuthenticated, loadData]);

  const handleDeleteContract = async (contractId: number) => {
    if (!confirm("이 계약을 삭제할까요?")) return;
    try {
      await deleteContract(contractId);
      if (editingContract?.contractId === contractId) {
        setEditingContract(null);
        setShowContractForm(false);
      }
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "계약 삭제에 실패했습니다.");
    }
  };

  const openCreateForm = () => {
    setEditingContract(null);
    setShowContractForm(true);
  };

  const openEditForm = (contract: ContractResponse) => {
    setEditingContract(contract);
    setShowContractForm(true);
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    }
    logout();
  };

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
              관심 지역: {user.interestRegion}
            </p>
          )}
        </div>

        <Link
          href="/my/bookmarks"
          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4"
        >
          <div className="flex items-center gap-3">
            <Bookmark className="h-5 w-5 text-saferoom-600" />
            <div>
              <p className="text-sm font-semibold text-slate-900">관심 건물</p>
              <p className="text-xs text-slate-500">{bookmarkCount}개 저장됨</p>
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
              onClick={() => {
                if (showContractForm) {
                  setShowContractForm(false);
                  setEditingContract(null);
                } else {
                  openCreateForm();
                }
              }}
              className="text-xs font-medium text-saferoom-600"
            >
              {showContractForm ? "닫기" : "+ 등록"}
            </button>
          </div>

          {showContractForm && (
            <ContractForm
              key={editingContract?.contractId ?? "new"}
              initialContract={editingContract}
              onClose={() => {
                setShowContractForm(false);
                setEditingContract(null);
              }}
              onSuccess={loadData}
            />
          )}

          {loading && contracts.length === 0 && (
            <p className="mt-3 text-xs text-slate-400">계약 정보 불러오는 중...</p>
          )}

          {contracts.map((contract) => {
            const simulation = simulations[contract.contractId];
            const daysLeft = contract.daysUntilExpiry ?? getDaysUntil(contract.contractEnd);
            const recoveryRate = simulation
              ? simulation.recoveryRate <= 1
                ? Math.round(simulation.recoveryRate * 100)
                : Math.round(simulation.recoveryRate)
              : null;

            return (
              <div
                key={contract.contractId}
                className="mt-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="flex-1 text-xs font-semibold text-slate-900">
                    {contract.roadAddress}
                  </p>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => openEditForm(contract)}
                      className="rounded p-1 text-slate-400 hover:bg-white hover:text-saferoom-600"
                      aria-label="계약 수정"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteContract(contract.contractId)}
                      className="rounded p-1 text-slate-400 hover:bg-white hover:text-risk-danger"
                      aria-label="계약 삭제"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  보증금 {formatCurrency(contract.deposit)} · D-{daysLeft}
                </p>
                {contract.expiryAlert && (
                  <p className="mt-1 text-xs font-medium text-risk-caution">
                    {contract.expiryAlert}
                  </p>
                )}
                {recoveryRate != null && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-slate-500">예상 회수율</span>
                    <span
                      className={cn(
                        "text-sm font-bold",
                        recoveryRate >= 80
                          ? "text-risk-safe"
                          : recoveryRate >= 50
                            ? "text-risk-caution"
                            : "text-risk-danger"
                      )}
                    >
                      {recoveryRate}%
                    </span>
                  </div>
                )}
                {simulation && simulation.expectedLoss > 0 && (
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
          onClick={handleLogout}
          className="w-full rounded-xl border border-slate-200 py-3 text-sm text-slate-500"
        >
          로그아웃
        </button>
      </div>
    </MobileLayout>
  );
}

function ContractForm({
  initialContract,
  onClose,
  onSuccess,
}: {
  initialContract?: ContractResponse | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = initialContract != null;
  const [selectedBuilding, setSelectedBuilding] = useState<SelectedBuilding | null>(
    initialContract
      ? {
          buildingId: initialContract.buildingId,
          label: initialContract.roadAddress,
        }
      : null
  );
  const [deposit, setDeposit] = useState(
    initialContract ? String(initialContract.deposit) : ""
  );
  const [contractStart, setContractStart] = useState(
    initialContract?.contractStart ?? ""
  );
  const [contractEnd, setContractEnd] = useState(
    initialContract?.contractEnd ?? ""
  );
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBuilding) {
      alert("건물을 검색해서 선택해 주세요.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        buildingId: selectedBuilding.buildingId,
        deposit: Number(deposit.replace(/,/g, "")),
        monthlyRent: initialContract?.monthlyRent ?? 0,
        contractStart,
        contractEnd,
      };
      if (isEdit && initialContract) {
        await updateContract(initialContract.contractId, payload);
      } else {
        await registerContract(payload);
      }
      onSuccess();
      onClose();
    } catch (err) {
      alert(
        err instanceof Error
          ? err.message
          : isEdit
            ? "계약 수정에 실패했습니다."
            : "계약 등록에 실패했습니다."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-3 border-t border-slate-100 pt-3">
      <BuildingSearchPicker
        value={selectedBuilding}
        onChange={setSelectedBuilding}
      />
      <input
        type="text"
        value={deposit}
        onChange={(e) => setDeposit(e.target.value)}
        placeholder="보증금 (원)"
        required
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      <DateField
        label="계약 시작일"
        value={contractStart}
        onChange={setContractStart}
        required
      />
      <DateField
        label="만기일"
        value={contractEnd}
        onChange={setContractEnd}
        required
      />
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-saferoom-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {submitting
          ? isEdit
            ? "수정 중..."
            : "등록 중..."
          : isEdit
            ? "계약 수정"
            : "계약 등록"}
      </button>
    </form>
  );
}
