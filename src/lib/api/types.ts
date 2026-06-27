/** 백엔드 OpenAPI DTO (http://54.116.153.193:8080/api/v3/api-docs) */

export interface BuildingResponse {
  buildingId: number;
  buildingName: string;
  roadAddress: string;
  jibunAddress: string;
  latitude: number;
  longitude: number;
  buildingType: string;
  buildYear: number;
  isIllegalBuilding: boolean;
  totalScore: number | null;
  riskGrade: string | null;
}

export interface HriReportResponse {
  reportId: number;
  buildingId: number;
  roadAddress: string;
  totalScore: number;
  riskGrade: string;
  buildingRiskScore: number;
  marketRiskScore: number;
  landlordRiskScore: number;
  livingRiskScore: number;
  recentTrades: TradePriceDto[];
  auctions: AuctionDto[];
  shareUrl: string;
  calculatedAt: string;
  riskProbability: number;
  riskTrend: string;
  predictedJeonseRatio: number;
  buildingJeonseRatio: number | null;
  districtAvgJeonseRatio: number | null;
  districtCompareComment: string;
}

export interface TradePriceDto {
  tradeType: string;
  price: number;
  contractYearMonth: string;
}

export interface AuctionDto {
  courtName: string;
  caseNumber: string;
  auctionStatus: string;
}

export interface ApiErrorBody {
  status: number;
  message: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  userId: number;
  email: string;
  nickname: string;
  interestRegion: string | null;
  oauthProvider: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserRequest {
  nickname?: string;
  interestRegion?: string;
}

export interface BookmarkResponse {
  bookmarkId: number;
  buildingId: number;
  buildingName: string;
  roadAddress: string;
  hriScore: number;
  riskGrade: string;
  bookmarkedAt: string;
}

export interface ContractRequest {
  buildingId: number;
  deposit: number;
  monthlyRent: number;
  contractStart: string;
  contractEnd: string;
}

export interface ContractResponse {
  contractId: number;
  buildingId: number;
  roadAddress: string;
  deposit: number;
  monthlyRent: number;
  contractStart: string;
  contractEnd: string;
  daysUntilExpiry: number;
  expiryAlert: string | null;
  createdAt: string;
}

export interface SimulationResponse {
  contractId: number;
  deposit: number;
  officialPrice: number;
  priorMortgage: number;
  auctionPrice: number;
  smallTenantProtection: number;
  remainingAfterMortgage: number;
  expectedRecovery: number;
  expectedLoss: number;
  recoveryRate: number;
  riskComment: string;
  calculatedAt: string;
}

export interface BuildingCompareItem {
  buildingId: number;
  buildingName: string;
  roadAddress: string;
  hriScore: number;
  riskGrade: string;
  buildingRiskScore: number;
  marketRiskScore: number;
  landlordRiskScore: number;
  livingRiskScore: number;
  avgDepositPrice: number;
  isHighlighted: boolean;
}

export interface CompareResponse {
  buildings: BuildingCompareItem[];
  safestBuildingId: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  score: number;
  riskGrade: string;
  buildingId: number;
}

export interface HeatmapResponse {
  points: HeatmapPoint[];
}

export interface MapBounds {
  swLat: number;
  swLng: number;
  neLat: number;
  neLng: number;
}

export interface FieldReportRequest {
  reportType: string;
  description: string;
}

export interface FieldReportResponse {
  reportId?: number;
  buildingId?: number;
  message?: string;
}
