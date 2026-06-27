import type { SocialProvider, User } from "@/types";
import type { UserResponse } from "./types";

function parseInterestRegion(
  value: string | null
): { city: string; district: string } | undefined {
  if (!value) return undefined;
  const parts = value.trim().split(/\s+/);
  if (parts.length >= 2) {
    return { city: parts[0], district: parts.slice(1).join(" ") };
  }
  return { city: value, district: "" };
}

export function toUser(res: UserResponse): User {
  const provider: SocialProvider =
    res.oauthProvider?.toUpperCase() === "GOOGLE" ? "google" : "kakao";

  return {
    id: String(res.userId),
    email: res.email,
    nickname: res.nickname,
    interestRegion: parseInterestRegion(res.interestRegion),
    provider,
    createdAt: res.createdAt,
  };
}
