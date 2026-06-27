import { apiClient } from "./client";
import { useAuthStore } from "@/store/auth-store";
import {
  devSessionDeleteUser,
  devSessionGetUser,
  devSessionUpdateUser,
} from "@/lib/dev-session";
import { toUser } from "./mappers-user";
import type { UserResponse } from "./types";

function isDevSession() {
  return useAuthStore.getState().isDevSession;
}

export async function fetchMe() {
  if (isDevSession()) return toUser(await devSessionGetUser());
  const res = await apiClient<UserResponse>("/users/me");
  return toUser(res);
}

export async function updateMe(data: {
  nickname?: string;
  interestRegion?: string;
}) {
  if (isDevSession()) return toUser(await devSessionUpdateUser(data));
  const res = await apiClient<UserResponse>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return toUser(res);
}

export async function deleteMe() {
  if (isDevSession()) {
    await devSessionDeleteUser();
    return;
  }
  return apiClient<void>("/users/me", { method: "DELETE" });
}
