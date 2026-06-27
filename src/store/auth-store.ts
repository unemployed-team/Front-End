"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, TermsAgreement } from "@/types";
import { clearDevSession, devSessionGetUser } from "@/lib/dev-session";
import { DEV_MOCK_USER } from "@/lib/dev-auth";
import { toUser } from "@/lib/api/mappers-user";
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isDevSession: boolean;
  pendingTerms: TermsAgreement | null;
  login: (user: User, tokens?: { access: string; refresh: string }) => void;
  devLogin: () => void;
  logout: () => void;
  setTokens: (access: string, refresh: string) => void;
  updateProfile: (updates: Partial<Pick<User, "nickname" | "interestRegion">>) => void;
  setPendingTerms: (terms: TermsAgreement) => void;
  setUser: (user: User) => void;
  completeOnboarding: (interestRegion: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isDevSession: false,
      pendingTerms: null,
      login: (user, tokens) =>
        set({
          user,
          isAuthenticated: true,
          isDevSession: false,
          ...(tokens
            ? { accessToken: tokens.access, refreshToken: tokens.refresh }
            : {}),
        }),
      devLogin: () => {
        const devUser = toUser(devSessionGetUser());
        set({
          user: { ...DEV_MOCK_USER, ...devUser },
          accessToken: "dev-access-token",
          refreshToken: "dev-refresh-token",
          isAuthenticated: true,
          isDevSession: true,
        });
      },
      logout: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isDevSession: false,
          pendingTerms: null,
        }),
      setTokens: (access, refresh) =>
        set({ accessToken: access, refreshToken: refresh }),
      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setPendingTerms: (terms) => set({ pendingTerms: terms }),
      setUser: (user) => set({ user }),
      completeOnboarding: (interestRegion) =>
        set((state) => ({
          user: state.user ? { ...state.user, interestRegion } : null,
        })),
    }),
    { name: "saferoom-auth" }
  )
);
