import { create } from "zustand";

interface AuthState {
  token: string | null;
  hydrated: boolean;

  setToken: (token: string) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  hydrated: false,

  setToken: (token) => {
    sessionStorage.setItem("auth_token", token);

    localStorage.removeItem("auth_token");

    set({
      token,
    });
  },

  logout: () => {
    sessionStorage.removeItem("auth_token");
    localStorage.removeItem("auth_token");

    document.cookie =
      "token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";

    set({
      token: null,
    });
  },

  hydrate: () => {
    localStorage.removeItem("auth_token");

    const token = sessionStorage.getItem("auth_token");

    set({
      token,
      hydrated: true,
    });
  },
}));