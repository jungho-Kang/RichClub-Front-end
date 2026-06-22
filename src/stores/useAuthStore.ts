import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email?: string;
}

interface AuthState {
  isLogin: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      isLogin: false,
      user: null,

      login: user =>
        set({
          isLogin: true,
          user,
        }),

      logout: () =>
        set({
          isLogin: false,
          user: null,
        }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
