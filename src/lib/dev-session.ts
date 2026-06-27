import type {
  BookmarkResponse,
  BuildingResponse,
  ContractRequest,
  ContractResponse,
  SimulationResponse,
  UserRequest,
  UserResponse,
} from "./api/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api-proxy";

const STORAGE_KEY = "saferoom-dev-session";

interface DevSessionState {
  nickname: string;
  interestRegion: string | null;
  bookmarks: BookmarkResponse[];
  contracts: ContractResponse[];
  nextBookmarkId: number;
  nextContractId: number;
}

const DEFAULT_STATE: DevSessionState = {
  nickname: "개발 테스트",
  interestRegion: null,
  bookmarks: [],
  contracts: [],
  nextBookmarkId: 1,
  nextContractId: 1,
};

function loadState(): DevSessionState {
  if (typeof window === "undefined") return { ...DEFAULT_STATE };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

function saveState(state: DevSessionState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearDevSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

function toUserResponse(state: DevSessionState): UserResponse {
  const now = new Date().toISOString();
  return {
    userId: 0,
    email: "dev@saferoom.local",
    nickname: state.nickname,
    interestRegion: state.interestRegion,
    oauthProvider: "DEV",
    createdAt: now,
    updatedAt: now,
  };
}

async function fetchBuilding(buildingId: number): Promise<BuildingResponse> {
  const res = await fetch(`${API_BASE}/buildings/${buildingId}`, {
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error("건물 정보를 불러오지 못했습니다.");
  }
  return res.json() as Promise<BuildingResponse>;
}

export function devSessionGetUser(): UserResponse {
  return toUserResponse(loadState());
}

export function devSessionUpdateUser(data: UserRequest): UserResponse {
  const state = loadState();
  if (data.nickname !== undefined) state.nickname = data.nickname;
  if (data.interestRegion !== undefined) state.interestRegion = data.interestRegion;
  saveState(state);
  return toUserResponse(state);
}

export function devSessionDeleteUser() {
  clearDevSession();
}

export function devSessionGetBookmarks(): BookmarkResponse[] {
  return loadState().bookmarks;
}

export async function devSessionAddBookmark(
  buildingId: number
): Promise<BookmarkResponse> {
  const state = loadState();
  if (state.bookmarks.some((b) => b.buildingId === buildingId)) {
    return state.bookmarks.find((b) => b.buildingId === buildingId)!;
  }

  const building = await fetchBuilding(buildingId);
  const bookmark: BookmarkResponse = {
    bookmarkId: state.nextBookmarkId++,
    buildingId,
    buildingName: building.buildingName,
    roadAddress: building.roadAddress,
    hriScore: building.totalScore ?? 0,
    riskGrade: building.riskGrade ?? "CAUTION",
    bookmarkedAt: new Date().toISOString(),
  };
  state.bookmarks.push(bookmark);
  saveState(state);
  return bookmark;
}

export function devSessionRemoveBookmark(buildingId: number) {
  const state = loadState();
  state.bookmarks = state.bookmarks.filter((b) => b.buildingId !== buildingId);
  saveState(state);
}

export function devSessionGetContracts(): ContractResponse[] {
  return loadState().contracts;
}

export async function devSessionRegisterContract(
  data: ContractRequest
): Promise<ContractResponse> {
  const state = loadState();
  const building = await fetchBuilding(data.buildingId);
  const end = new Date(data.contractEnd);
  const daysUntilExpiry = Math.max(
    0,
    Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const contract: ContractResponse = {
    contractId: state.nextContractId++,
    buildingId: data.buildingId,
    roadAddress: building.roadAddress,
    deposit: data.deposit,
    monthlyRent: data.monthlyRent,
    contractStart: data.contractStart,
    contractEnd: data.contractEnd,
    daysUntilExpiry,
    expiryAlert: daysUntilExpiry <= 90 ? "계약 만료가 임박했습니다." : null,
    createdAt: new Date().toISOString(),
  };
  state.contracts.push(contract);
  saveState(state);
  return contract;
}

export async function devSessionUpdateContract(
  contractId: number,
  data: ContractRequest
): Promise<ContractResponse> {
  const state = loadState();
  const index = state.contracts.findIndex((c) => c.contractId === contractId);
  if (index < 0) throw new Error("계약을 찾을 수 없습니다.");

  const building = await fetchBuilding(data.buildingId);
  const end = new Date(data.contractEnd);
  const daysUntilExpiry = Math.max(
    0,
    Math.ceil((end.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  );

  const updated: ContractResponse = {
    ...state.contracts[index],
    buildingId: data.buildingId,
    roadAddress: building.roadAddress,
    deposit: data.deposit,
    monthlyRent: data.monthlyRent,
    contractStart: data.contractStart,
    contractEnd: data.contractEnd,
    daysUntilExpiry,
    expiryAlert: daysUntilExpiry <= 90 ? "계약 만료가 임박했습니다." : null,
  };
  state.contracts[index] = updated;
  saveState(state);
  return updated;
}

export function devSessionDeleteContract(contractId: number): void {
  const state = loadState();
  state.contracts = state.contracts.filter((c) => c.contractId !== contractId);
  saveState(state);
}

export function devSessionSimulateContract(
  contractId: number
): SimulationResponse {
  const state = loadState();
  const contract = state.contracts.find((c) => c.contractId === contractId);
  if (!contract) throw new Error("계약을 찾을 수 없습니다.");

  const recoveryRate = 0.72;
  const expectedRecovery = Math.round(contract.deposit * recoveryRate);
  const expectedLoss = contract.deposit - expectedRecovery;

  return {
    contractId,
    deposit: contract.deposit,
    officialPrice: Math.round(contract.deposit * 1.1),
    priorMortgage: 0,
    auctionPrice: Math.round(contract.deposit * 0.85),
    smallTenantProtection: Math.round(contract.deposit * 0.5),
    remainingAfterMortgage: expectedRecovery,
    expectedRecovery,
    expectedLoss,
    recoveryRate,
    riskComment: "개발용 임시 시뮬레이션 결과입니다.",
    calculatedAt: new Date().toISOString(),
  };
}
