/** UI 키 → 백엔드 FieldReportRequest.reportType */
export const FIELD_REPORT_TYPE_MAP: Record<string, string> = {
  registry: "REGISTRY_CHANGE",
  maintenance_fee: "MGMT_FEE",
  defect: "MAJOR_DEFECT",
  landlord_contact: "LANDLORD_MISSING",
};

export function toApiReportType(uiKey: string): string {
  return FIELD_REPORT_TYPE_MAP[uiKey] ?? uiKey.toUpperCase();
}
