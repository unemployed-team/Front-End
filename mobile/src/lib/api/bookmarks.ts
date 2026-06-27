import { apiClient } from "./client";
import { useAuthStore } from "@/store/auth-store";
import {
  devSessionGetBookmarks,
  devSessionAddBookmark,
  devSessionRemoveBookmark,
} from "@/lib/dev-session";
import type { BookmarkResponse, CompareResponse } from "./types";

function isDevSession() {
  return useAuthStore.getState().isDevSession;
}

export async function getMyBookmarks() {
  if (isDevSession()) return devSessionGetBookmarks();
  return apiClient<BookmarkResponse[]>("/bookmarks/me");
}

export async function addBookmark(buildingId: number) {
  if (isDevSession()) return devSessionAddBookmark(buildingId);
  return apiClient<BookmarkResponse>(`/bookmarks/${buildingId}`, {
    method: "POST",
  });
}

export async function removeBookmark(buildingId: number) {
  if (isDevSession()) {
    await devSessionRemoveBookmark(buildingId);
    return;
  }
  return apiClient<void>(`/bookmarks/${buildingId}`, {
    method: "DELETE",
  });
}

export async function compareBookmarks(buildingIds: number[]) {
  return apiClient<CompareResponse>("/bookmarks/compare", {
    method: "POST",
    body: JSON.stringify(buildingIds),
  });
}
