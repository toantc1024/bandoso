import { supabase } from "@/lib/supabase";
import { getAccountProfileByAccountId } from "./account_profiles.service";
import type { Session } from "@supabase/supabase-js";
import type { LoginResponse } from "@/types/auth.service.type";
import { ADMIN_ROLE } from "@/constants/role.constants";
import { getApi } from "@/lib/api";

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const {
    data: { user },
    error,
  } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error("Tài khoản hoặc mật khẩu không đúng.");
  }

  if (!user) {
    throw new Error("No user returned from login.");
  }

  const account_profile = await getAccountProfileByAccountId(user.id);
  if (!account_profile) {
    throw new Error("No account profile found for this user.");
  }

  return {
    email: user.email!,
    role: account_profile.role,
    account_id: user.id,
  };
};

export const logout = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
};

export const getCurrentUser = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }

  return data.session;
};

export const createUser = async (
  email: string,
  password: string,
  role: string = ADMIN_ROLE
) => {
  let data = await getApi().post("/users/create", {
    email,
    password,
    role,
  });
  if (data.status !== 200) {
    throw new Error("Failed to create user: " + data.statusText);
  }
  return data.data;
};

export const deleteUsers = async (account_ids: string[]) => {
  let data = await getApi().delete(`/users/delete`, {
    data: { user_ids: account_ids },
  });
  if (data.status !== 200) {
    throw new Error("Failed to delete user: " + data.statusText);
  }
  return data.data;
};

export const updateUserByAccountId = async (
  user_id: string,
  email: string,
  role: string,
  password: string | null = null
) => {
  let data = await getApi().put(`/users/update`, {
    user_id,
    email,
    role,
    password,
  });
  if (data.status !== 200) {
    throw new Error("Failed to update user: " + data.statusText);
  }
  return data.data;
};
