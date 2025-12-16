import { supabase } from "@/lib/supabase"

export const getVisitorLogs = async (area_id: string) => {
    if (area_id === "all") {
        // Get all visitor logs for root users
        const { data, error } = await supabase.from("visitor_logs").select("*")
        if (error) {
            throw error
        }
        return data
    }

    const { data, error } = await supabase.from("visitor_logs").select("*").eq("area_id", area_id)

    if (error) {
        throw error
    }

    return data
}

export const getVisitorLogsByAccountId = async (account_id: string) => {
    // First get the areas assigned to this account
    const { data: accountAreas, error: accountError } = await supabase
        .from("account_areas")
        .select("area_id")
        .eq("account_id", account_id)

    if (accountError) {
        throw accountError
    }

    if (!accountAreas || accountAreas.length === 0) {
        return []
    }

    // Get visitor logs for all assigned areas
    const areaIds = accountAreas.map(area => area.area_id)
    const { data, error } = await supabase
        .from("visitor_logs")
        .select("*")
        .in("area_id", areaIds)

    if (error) {
        throw error
    }

    return data
}

export const countVisitLogs = async (): Promise<any> => {
    const { count, error }: any = await supabase
        .from("visitor_logs")
        .select('*', { count: 'exact', head: true });
    if (error) {
        throw new Error("Failed to count visitor logs: " + error.message);
    }
    return count
}

export const countVisitLogsByAreaId = async (area_id: string): Promise<any> => {
    const { count, error }: any = await supabase
        .from("visitor_logs")
        .select('*', { count: 'exact', head: true })
        .eq("area_id", area_id);
    if (error) {
        throw new Error("Failed to count visitor logs by area ID: " + error.message);
    }
    return count
}

export const countVisitLogsByAccountId = async (account_id: string): Promise<any> => {
    // First get the areas assigned to this account
    const { data: accountAreas, error: accountError } = await supabase
        .from("account_areas")
        .select("area_id")
        .eq("account_id", account_id)

    if (accountError) {
        throw new Error("Failed to get account areas: " + accountError.message);
    }

    if (!accountAreas || accountAreas.length === 0) {
        return 0;
    }

    // Get visitor log count for all assigned areas
    const areaIds = accountAreas.map(area => area.area_id);
    let totalCount = 0;

    for (const areaId of areaIds) {
        const count = await countVisitLogsByAreaId(areaId);
        totalCount += count;
    }

    return totalCount;
};