import { supabase } from "@/lib/supabase";
import type { AccountProfile } from "@/types/account_profiles.service.type";

export const getAccountProfilesByAreaId = async (
  area_id: number
): Promise<AccountProfile[]> => {
  const { data, error } = await supabase
    .from("account_profiles")
    .select(
      `
      account_id,
      role,
      email,
      account_areas!inner(area_id)
    `
    )
    .eq("account_areas.area_id", area_id);

  if (error) {
    throw error;
  }

  // Return account profiles without the join data
  return data?.map(({ account_areas, ...profile }) => profile) || [];
};

export const addAccountToArea = async (account_id: string, area_id: number) => {
  const { data, error } = await supabase
    .from("account_areas")
    .insert([{ account_id, area_id }])
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const removeAccountFromArea = async (
  account_id: string,
  area_id: number
) => {
  const { data, error } = await supabase
    .from("account_areas")
    .delete()
    .eq("account_id", account_id)
    .eq("area_id", area_id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const isAccountInArea = async (
  account_id: string,
  area_id: number
): Promise<boolean> => {
  const { data, error } = await supabase
    .from("account_areas")
    .select("account_id")
    .eq("account_id", account_id)
    .eq("area_id", area_id)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 is "not found" error
    throw error;
  }

  return !!data;
};

export const getAreasByAccountId = async (account_id: string) => {
  const { data, error } = await supabase
    .from("account_areas")
    .select("area_id")
    .eq("account_id", account_id);

  if (error) {
    throw error;
  }

  return data?.map((item) => item.area_id) || [];
};

export const getAccountProfileByAccountId = async (account_id: string) => {
  const { data, error } = await supabase
    .from("account_profiles")
    .select("*")
    .eq("account_id", account_id)
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const createAccountProfile = async ({
  account_id,
  role,
  email,
}: AccountProfile) => {
  const { data, error } = await supabase
    .from("account_profiles")
    .insert([{ account_id, role, email }])
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const getAccountProfilesNotInAnyArea = async (): Promise<
  AccountProfile[]
> => {
  // First get all account_ids that are in areas
  const { data: accountsInAreas, error: areasError } = await supabase
    .from("account_areas")
    .select("account_id");

  if (areasError) {
    throw areasError;
  }

  const accountIdsInAreas =
    accountsInAreas?.map((item) => item.account_id) || [];

  // Then get all account profiles not in those IDs
  let query = supabase.from("account_profiles").select("*");

  if (accountIdsInAreas.length > 0) {
    query = query.not(
      "account_id",
      "in",
      `(${accountIdsInAreas.map((id) => `"${id}"`).join(",")})`
    );
  }

  const { data, error } = await query.order("email", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};

export const getAllAccountProfiles = async (): Promise<AccountProfile[]> => {
  const { data, error } = await supabase
    .from("account_profiles")
    .select("*")
    .order("email", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
};
