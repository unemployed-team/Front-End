import { apiClient } from "./client";
import { toUser } from "./mappers-user";
import { useAuthStore } from "@/store/auth-store";
import {
  devSessionDeleteUser,
  devSessionGetUser,
  devSessionUpdateUser,
} from "@/lib/dev-session";
import type { UserRequest, UserResponse } from "./types";

function isDevSession() {
  return useAuthStore.getState().isDevSession;
}

export async function fetchMe() {
  if (isDevSession()) return toUser(devSessionGetUser());
  const res = await apiClient<UserResponse>("/users/me");
  return toUser(res);
}

export async function updateMe(data: UserRequest) {
  if (isDevSession()) return toUser(devSessionUpdateUser(data));
  const res = await apiClient<UserResponse>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return toUser(res);
}

export async function deleteMe() {
  if (isDevSession()) {
    devSessionDeleteUser();
    return;
  }
  return apiClient<void>("/users/me", { method: "DELETE" });
}
