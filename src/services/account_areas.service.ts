import { supabase } from "@/lib/supabase";

export const getAccountAreaByAccountId = async (account_id: string) => {
  const { data, error } = await supabase
    .from("account_areas")
    .select("*")
    .eq("account_id", account_id)
    .single();

  if (error) {
    throw error;
  }

  return data;
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
