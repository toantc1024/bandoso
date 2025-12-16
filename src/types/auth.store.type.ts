import type { Session } from "@supabase/supabase-js";
import type { LoginResponse } from "./auth.service.type";

export type AuthState = {
  isAuthenticated: boolean;
  user: LoginResponse | null;
  isLoading: boolean;
};

export type AuthActions = {
  setUser: (user: LoginResponse) => void;
  clearUser: () => void;
  session: Session | null;
  getSession: () => Promise<Session>;
  getAccessToken: () => Promise<string>;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

export type AuthStore = AuthState & AuthActions;
