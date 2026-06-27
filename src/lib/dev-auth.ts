import type { User } from "@/types";

export function isDevLoginEnabled(): boolean {
  return process.env.NEXT_PUBLIC_ENABLE_DEV_LOGIN === "true";
}

export const DEV_MOCK_USER: User = {
  id: "dev-user",
  email: "dev@saferoom.local",
  nickname: "개발 테스트",
  provider: "kakao",
  createdAt: new Date().toISOString(),
};
