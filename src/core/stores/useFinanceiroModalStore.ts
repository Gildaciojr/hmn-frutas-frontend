import { create } from "zustand";

type TipoModal = "entrada" | "saida" | null;

interface FinanceiroModalState {
  open: boolean;
  tipo: TipoModal;

  openModal: (tipo: TipoModal) => void;
  closeModal: () => void;
}

export const useFinanceiroModalStore = create<FinanceiroModalState>((set) => ({
  open: false,
  tipo: null,

  openModal: (tipo) =>
    set({
      open: true,
      tipo,
    }),

  closeModal: () =>
    set({
      open: false,
      tipo: null,
    }),
}));