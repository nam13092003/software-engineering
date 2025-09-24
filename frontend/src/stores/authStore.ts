import { create } from "zustand";
import { AuthResponse, User } from "../types";

const STORAGE_KEY = "mlms-auth";

interface AuthState {
  user: User | null;
  token: string | null;
  isHydrated: boolean;
  setAuth: (payload: AuthResponse) => void;
  logout: () => void;
  hydrate: () => void;
}

function persistAuth(payload: { user: User; token: string } | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!payload) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isHydrated: false,
  setAuth: (payload) => {
    persistAuth(payload);
    set({ user: payload.user, token: payload.token, isHydrated: true });
  },
  logout: () => {
    persistAuth(null);
    set({ user: null, token: null, isHydrated: true });
  },
  hydrate: () => {
    if (get().isHydrated || typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as { user: User; token: string };
        set({ user: parsed.user, token: parsed.token, isHydrated: true });
        return;
      } catch (error) {
        console.warn("Failed to parse stored auth payload", error);
      }
    }

    set({ isHydrated: true, user: null, token: null });
  }
}));
