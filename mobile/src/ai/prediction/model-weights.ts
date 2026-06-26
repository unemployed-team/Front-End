/**
 * 보증금 미반환 위험 예측 모델 가중치
 *
 * MVP: 로지스틱 회귀 계수 (통계·도메인 지식 기반 초기값)
 * 백엔드 ML 파이프라인 학습 후 이 계수만 교체하면 됨
 */
export const DEPOSIT_RISK_MODEL_WEIGHTS: Record<string, number> = {
  bias: -2.1,
  jeonse_ratio: 1.8,
  district_dev: 1.4,
  ltv: 1.6,
  senior_ltv: 0.9,
  auction: 2.5,
  field_reports: 1.1,
  price_trend_down: 1.0,
  volatility: 0.7,
  contract_years: 0.4,
  trade_liquidity_low: 0.6,
};

export const FEATURE_LABELS: Record<string, string> = {
  jeonse_ratio: "전세가율",
  district_dev: "동 평균 대비 전세가율 편차",
  ltv: "담보대출 비율(LTV)",
  senior_ltv: "선순위 근저당 비율",
  auction: "경매 진행 여부",
  field_reports: "검증된 현장 제보",
  price_trend_down: "매매가 하락 추세",
  volatility: "시세 변동성",
  contract_years: "잔여 계약 기간",
  trade_liquidity_low: "실거래 이력 부족",
};
