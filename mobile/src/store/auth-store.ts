import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { User, TermsAgreement } from "@/types";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  pendingTerms: TermsAgreement | null;
  login: (user: User) => void;
  logout: () => void;
  updateProfile: (updates: Partial<Pick<User, "nickname" | "interestRegion">>) => void;
  setPendingTerms: (terms: TermsAgreement) => void;
  completeOnboarding: (region: { city: string; district: string }) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      pendingTerms: null,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, pendingTerms: null }),
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
