import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User, TermsAgreement } from "@/types";
import { DEV_MOCK_USER } from "@/lib/dev-auth";

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
  setUser: (user: User) => void;
  updateProfile: (updates: Partial<Pick<User, "nickname" | "interestRegion">>) => void;
  setPendingTerms: (terms: TermsAgreement) => void;
  completeOnboarding: (region: { city: string; district: string }) => void;
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
          accessToken: tokens?.access ?? null,
          refreshToken: tokens?.refresh ?? null,
        }),
      devLogin: () =>
        set({
          user: DEV_MOCK_USER,
          accessToken: "dev-access-token",
          isAuthenticated: true,
          isDevSession: true,
        }),
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
      setUser: (user) => set({ user }),
      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),
      setPendingTerms: (terms) => set({ pendingTerms: terms }),
      completeOnboarding: (region) =>
        set((state) => ({
          user: state.user ? { ...state.user, interestRegion: region } : null,
        })),
    }),
    {
      name: "saferoom-auth-mobile",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
