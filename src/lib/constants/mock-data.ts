import type { Building, HRIReport, MapCluster } from "@/types";

export const UNIVERSITY_ZONES = {
  keimyung: { name: "계명대", lat: 35.8531, lng: 128.4856, radiusKm: 2 },
  kyungpook: { name: "경북대", lat: 35.8903, lng: 128.6124, radiusKm: 2.5 },
  yeungnam: { name: "영남대", lat: 35.8714, lng: 128.6014, radiusKm: 2 },
} as const;

export const CATEGORY_LABELS = {
  construction: "건축 위험",
  market: "시세 이상",
  landlord: "임대인 위험",
  safety: "생활 안전",
} as const;

export const FIELD_REPORT_TYPES = {
  registry: "등기 변경 징후",
  maintenance_fee: "관리비 밀실 정산",
  defect: "건물 중대 하자",
  landlord_contact: "임대인 연락 두절",
} as const;

export const MOCK_BUILDINGS: Building[] = [
  {
    id: "bld-001",
    pnu: "2726010100100010001",
    roadAddress: "대구광역시 중구 동성로2길 80",
    jibunAddress: "대구광역시 중구 동성로3가 123-4",
    lat: 35.8719,
    lng: 128.6016,
    buildingType: "oneroom",
    buildYear: 1998,
    floors: 5,
    householdCount: 12,
    isViolation: false,
    adminDong: "동성로3가",
    universityProximity: "kyungpook",
  },
  {
    id: "bld-002",
    pnu: "2726010100100020001",
    roadAddress: "대구광역시 남구 대명로 112",
    jibunAddress: "대구광역시 남구 대명동 456-7",
    lat: 35.8421,
    lng: 128.5893,
    buildingType: "officetel",
    buildYear: 2005,
    floors: 15,
    householdCount: 48,
    isViolation: false,
    adminDong: "대명동",
    universityProximity: "keimyung",
  },
  {
    id: "bld-003",
    pnu: "2726010100100030001",
    roadAddress: "대구광역시 북구 대학로 80",
    jibunAddress: "대구광역시 북구 산격동 789-1",
    lat: 35.8967,
    lng: 128.6145,
    buildingType: "oneroom",
    buildYear: 1985,
    floors: 4,
    householdCount: 20,
    isViolation: true,
    adminDong: "산격동",
    universityProximity: "kyungpook",
  },
  {
    id: "bld-004",
    pnu: "2726010100100040001",
    roadAddress: "대구광역시 수성구 범어동 234",
    jibunAddress: "대구광역시 수성구 범어동 234-5",
    lat: 35.8589,
    lng: 128.6312,
    buildingType: "multifamily",
    buildYear: 2010,
    floors: 6,
    householdCount: 8,
    isViolation: false,
    adminDong: "범어동",
    universityProximity: "yeungnam",
  },
  {
    id: "bld-005",
    pnu: "2726010100100050001",
    roadAddress: "대구광역시 달서구 성당로 45",
    jibunAddress: "대구광역시 달서구 성당동 567-8",
    lat: 35.8298,
    lng: 128.5345,
    buildingType: "oneroom",
    buildYear: 1992,
    floors: 5,
    householdCount: 15,
    isViolation: false,
    adminDong: "성당동",
    universityProximity: null,
  },
];

export const MOCK_CLUSTERS: MapCluster[] = [
  { id: "c1", lat: 35.8719, lng: 128.6016, count: 24, avgScore: 42 },
  { id: "c2", lat: 35.8421, lng: 128.5893, count: 18, avgScore: 58 },
  { id: "c3", lat: 35.8967, lng: 128.6145, count: 31, avgScore: 71 },
  { id: "c4", lat: 35.8589, lng: 128.6312, count: 12, avgScore: 38 },
];

export function findBuildingById(id: string): Building | undefined {
  return MOCK_BUILDINGS.find((b) => b.id === id);
}

export function searchBuildingsByAddress(query: string): Building[] {
  const q = query.toLowerCase();
  return MOCK_BUILDINGS.filter(
    (b) =>
      b.roadAddress.includes(q) ||
      b.jibunAddress.includes(q) ||
      b.adminDong.includes(q)
  );
}
