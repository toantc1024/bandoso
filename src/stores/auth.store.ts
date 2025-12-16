import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { AuthStore } from "@/types/auth.store.type";
import type { LoginResponse } from "@/types/auth.service.type";
import * as authService from "@/services/auth.service";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: null,
      session: null,
      getSession: async () => {
        if (get().session) return get().session as Session;
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        if (!session) {
          throw new Error("Session not found");
        }
        set({ session });
        return session;
      },
      getAccessToken: async () => {
        const session = await get().getSession();
        return session.access_token;
      },
      isLoading: false,
      setUser: (user: LoginResponse) =>
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
        }),

      clearUser: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading: boolean) =>
        set({
          isLoading: loading,
        }),

      login: async (email: string, password: string) => {
        try {
          set({ isLoading: true });
          const loginResponse = await authService.login(email, password);

          // Get the session after successful login
          const { data } = await supabase.auth.getSession();
          if (data.session) {
            set({ session: data.session });
          }

          get().setUser(loginResponse);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          await authService.logout();
        } catch (error) {
          set({ isLoading: false });
          //   throw error;
        }
        get().clearUser();
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        user: state.user,
      }),
      storage: createJSONStorage(() => localStorage),
    }
  )
);
