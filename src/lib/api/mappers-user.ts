import type { SocialProvider, User } from "@/types";
import type { UserResponse } from "./types";
import { toRiskGrade } from "./mappers";
import type { RiskGrade } from "@/types";

export function toUser(res: UserResponse): User {
  const provider: SocialProvider =
    res.oauthProvider?.toUpperCase() === "GOOGLE" ? "google" : "kakao";

  return {
    id: String(res.userId),
    email: res.email,
    nickname: res.nickname,
    interestRegion: res.interestRegion ?? undefined,
    provider,
    createdAt: res.createdAt,
  };
}

export function toRiskGradeFromApi(riskGrade: string): RiskGrade {
  return toRiskGrade(riskGrade);
}
