import { useAuthStore } from "@/store/auth-store";
import { reissueToken } from "./auth";
import type { ApiErrorBody } from "./types";

/**
 * 기본값 `/api-proxy` → next.config.ts rewrite로 EC2 백엔드에 전달 (CORS 우회)
 */
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api-proxy";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiClientOptions extends RequestInit {
  auth?: boolean;
  _retry?: boolean;
}

export async function apiClient<T>(
  path: string,
  options?: ApiClientOptions
): Promise<T> {
  const { auth = true, headers: customHeaders, _retry, ...fetchOptions } =
    options ?? {};
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...customHeaders,
    },
  });

  if (
    res.status === 401 &&
    auth &&
    !_retry &&
    !useAuthStore.getState().isDevSession
  ) {
    const refresh = useAuthStore.getState().refreshToken;
    if (refresh) {
      try {
        const tokens = await reissueToken(refresh);
        useAuthStore.getState().setTokens(tokens.accessToken, tokens.refreshToken);
        return apiClient<T>(path, { ...options, _retry: true });
      } catch {
        useAuthStore.getState().logout();
      }
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  const text = await res.text();

  if (!res.ok) {
    let message = text || res.statusText;
    try {
      const err = JSON.parse(text) as ApiErrorBody;
      message = err.message ?? message;
    } catch {
      // non-JSON
    }
    throw new ApiError(res.status, message);
  }

  if (!text) {
    return undefined as T;
  }

  return JSON.parse(text) as T;
}
