// src/stores/useAmbassadorStore.js

import { create } from "zustand";

export const useAmbassadorStore = create((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
