import { ENABLE_DEV_LOGIN } from "@/lib/config";
import type { User } from "@/types";

export function isDevLoginEnabled(): boolean {
  return ENABLE_DEV_LOGIN;
}

export const DEV_MOCK_USER: User = {
  id: "dev-user",
  email: "dev@saferoom.local",
  nickname: "개발 테스트",
  provider: "kakao",
  createdAt: new Date().toISOString(),
};
