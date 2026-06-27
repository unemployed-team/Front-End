/** 공유 리포트 경로: /v1/hri/{buildingId}/report */
export function buildSharePath(buildingId: string | number): string {
  return `/v1/hri/${buildingId}/report`;
}

export function buildShareUrl(buildingId: string | number, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}${buildSharePath(buildingId)}`;
}

/** API shareUrl 또는 buildingId로 복사용 전체 URL 생성 */
export function resolveShareUrlForCopy(
  buildingId: string,
  shareUrl?: string
): string {
  if (shareUrl) {
    if (shareUrl.startsWith("http://") || shareUrl.startsWith("https://")) {
      return shareUrl;
    }
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    return `${origin}${shareUrl.startsWith("/") ? shareUrl : `/${shareUrl}`}`;
  }
  return buildShareUrl(buildingId);
}
