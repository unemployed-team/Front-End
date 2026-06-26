export type RiskGrade = "safe" | "caution" | "danger";

export type SocialProvider = "kakao" | "naver";

export interface User {
  id: string;
  email: string;
  nickname: string;
  interestRegion?: { city: string; district: string };
  provider: SocialProvider;
  createdAt: string;
}

export interface Building {
  id: string;
  pnu: string;
  roadAddress: string;
  jibunAddress: string;
  lat: number;
  lng: number;
  buildingType: "oneroom" | "officetel" | "multifamily";
  buildYear: number;
  floors: number;
  householdCount: number;
  isViolation: boolean;
  adminDong: string;
  universityProximity?: "keimyung" | "kyungpook" | "yeungnam" | null;
}

export interface HRICategoryScore {
  category: "construction" | "market" | "landlord" | "safety";
  label: string;
  score: number;
  maxScore: number;
  weight: number;
  details: string[];
}

export interface HRIReport {
  buildingId: string;
  totalScore: number;
  grade: RiskGrade;
  categories: HRICategoryScore[];
  depositReturnRiskPercent: number;
  jeonseRatio: number;
  districtAvgJeonseRatio: number;
  relativeRiskPercent: number;
  fieldReportPenalty: number;
  updatedAt: string;
}

export interface FieldReport {
  id: string;
  buildingId: string;
  type: "registry" | "maintenance_fee" | "defect" | "landlord_contact";
  description: string;
  createdAt: string;
  verified: boolean;
}

export interface Bookmark {
  id: string;
  buildingId: string;
  building: Building;
  report: HRIReport;
  addedAt: string;
  previousGrade?: RiskGrade;
}

export interface Contract {
  id: string;
  buildingId: string;
  building: Building;
  deposit: number;
  monthlyRent: number;
  startDate: string;
  endDate: string;
  hasMonthlyRent: boolean;
}

export interface RecoverySimulation {
  depositRecoveryRate: number;
  expectedLoss: number;
  priorityRepayment: number;
  auctionBidRate: number;
  officialPrice: number;
  seniorMortgage: number;
  smallTenantProtection: boolean;
  protectedAmount: number;
}

export interface AddressSuggestion {
  roadAddress: string;
  jibunAddress: string;
  lat: number;
  lng: number;
  pnu?: string;
  adminDong?: string;
}

export interface MapCluster {
  id: string;
  lat: number;
  lng: number;
  count: number;
  avgScore: number;
}

export interface TermsAgreement {
  service: boolean;
  privacy: boolean;
  location: boolean;
}

export interface CompareItem {
  building: Building;
  report: HRIReport;
  simulation?: RecoverySimulation;
}
