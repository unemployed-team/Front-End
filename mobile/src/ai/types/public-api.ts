/**
 * 공공 Open API 응답 타입 (백엔드 적재 스키마와 1:1 매핑)
 */

/** 국토교통부 건축물대장 표제부 */
export interface BuildingRegistryData {
  pnu: string;
  isViolation: boolean;
  mainUse: string;
  structure: string;
  floors: number;
  householdCount: number;
  buildYear: number;
  totalArea?: number;
}

/** 국토교통부 실거래 (전월세/매매) */
export interface TradeRecord {
  type: "jeonse" | "monthly" | "sale";
  deposit: number;
  monthlyRent: number;
  price: number;
  contractDate: string;
  buildYear?: number;
  floor?: number;
}

/** 대법원 경매정보 */
export interface AuctionRecord {
  caseNumber: string;
  courtName: string;
  address: string;
  status: "progress" | "closed" | "changed";
  auctionType: string;
  registeredAt: string;
}

/** 국토교통부 공시지가 / 공동주택가격 */
export interface OfficialPriceData {
  pnu: string;
  officialPrice: number;
  baseYear: number;
}

/** 등기부 근저당 (백엔드 파싱 결과) */
export interface MortgageData {
  totalMortgage: number;
  seniorMortgage: number;
  juniorMortgage: number;
}

/** 행정안전부 주소 표준화 */
export interface StandardAddressData {
  roadAddress: string;
  jibunAddress: string;
  adminDongCode: string;
  pnu: string;
  lat: number;
  lng: number;
}

/** 동 단위 시세 벤치마크 (백엔드 집계) */
export interface DistrictBenchmark {
  adminDong: string;
  avgDeposit: number;
  avgSalePrice: number;
  avgJeonseRatio: number;
  tradeCount12m: number;
}

/** 생활 안전 컨텍스트 (범죄·화재 등 외부 지표) */
export interface SafetyContext {
  crimeIndex: number;
  fireIncidentCount: number;
}
