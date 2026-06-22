import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Bookmark, Contract, CompareItem } from "@/types";

interface AppState {
  bookmarks: Bookmark[];
  contracts: Contract[];
  compareSelection: CompareItem[];
  addBookmark: (bookmark: Bookmark) => void;
  removeBookmark: (id: string) => void;
  addContract: (contract: Contract) => void;
  removeContract: (id: string) => void;
  toggleCompare: (item: CompareItem) => void;
  clearCompare: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      bookmarks: [],
      contracts: [],
      compareSelection: [],
      addBookmark: (bookmark) =>
        set((state) => {
          if (state.bookmarks.some((b) => b.buildingId === bookmark.buildingId)) {
            return state;
          }
          return { bookmarks: [...state.bookmarks, bookmark] };
        }),
      removeBookmark: (id) =>
        set((state) => ({
          bookmarks: state.bookmarks.filter((b) => b.id !== id),
        })),
      addContract: (contract) =>
        set((state) => ({ contracts: [...state.contracts, contract] })),
      removeContract: (id) =>
        set((state) => ({
          contracts: state.contracts.filter((c) => c.id !== id),
        })),
      toggleCompare: (item) =>
        set((state) => {
          const exists = state.compareSelection.find(
            (c) => c.building.id === item.building.id
          );
          if (exists) {
            return {
              compareSelection: state.compareSelection.filter(
                (c) => c.building.id !== item.building.id
              ),
            };
          }
          if (state.compareSelection.length >= 3) return state;
          return { compareSelection: [...state.compareSelection, item] };
        }),
      clearCompare: () => set({ compareSelection: [] }),
    }),
    {
      name: "saferoom-app-mobile",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
