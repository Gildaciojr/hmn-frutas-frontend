import { create } from "zustand";

type Mode = "COMPRAS" | "VENDAS";

interface AppState {
  user: null | {
    id: string;
    name: string;
  };

  mode: Mode | null;

  // 🔧 CONTROLE DE HIDRATAÇÃO
  hydrated: boolean;

  setUser: (user: AppState["user"]) => void;

  setMode: (mode: Mode) => void;

  hydrate: () => void;

  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  mode: null,
  hydrated: false,

  setUser: (user) => set({ user }),

  setMode: (mode) => {
    // 🔐 PERSISTE MODE
    localStorage.setItem("app_mode", mode);

    set({ mode });
  },

  hydrate: () => {
    const mode = localStorage.getItem("app_mode") as Mode | null;

    set({
      mode: mode ?? null,
      hydrated: true,
    });
  },

  logout: () => {
    // 🔥 LIMPA TUDO
    localStorage.removeItem("app_mode");

    set({
      user: null,
      mode: null,
      hydrated: true,
    });
  },
}));