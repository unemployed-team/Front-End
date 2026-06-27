export function buildSharePath(buildingId: number | string): string {
  return `/v1/hri/${buildingId}/report`;
}
