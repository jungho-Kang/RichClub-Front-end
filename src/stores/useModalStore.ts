import { create } from "zustand";

interface ModalState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  mode: "login" | "signup";
  onChangeMode: (mode: "login" | "signup") => void;
}

export const useModalStore = create<ModalState>(set => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  mode: "login",
  onChangeMode: mode => set({ mode }),
}));
