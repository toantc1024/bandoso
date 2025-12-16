import { supabase } from "@/lib/supabase"
import type { ChatbotRequestCount } from "@/types/chatbot_request_counts.service.type"

export const getChatbotRequestCountsByAreaId = async (area_id: string): Promise<ChatbotRequestCount[]> => {
    const { data, error } = await supabase.from("chatbot_request_counts").select("*").eq("area_id", area_id);
    if (error) {
        throw error;
    }
    return data;
}

export const countChatbotRequests = async (): Promise<any> => {
    const { count, error }: any = await supabase
        .from("chatbot_request_counts")
        .select('*', { count: 'exact', head: true });
    if (error) {
        throw new Error("Failed to count chatbot requests: " + error.message);
    }
    return count
};

export const countChatbotRequestsByAreaId = async (area_id: string): Promise<any> => {
    const { count, error }: any = await supabase
        .from("chatbot_request_counts")
        .select('*', { count: 'exact', head: true })
        .eq("area_id", area_id);
    if (error) {
        throw new Error("Failed to count chatbot requests by area ID: " + error.message);
    }
    return count
};

export const countChatbotRequestsByAccountId = async (account_id: string): Promise<any> => {
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

    // Get chatbot request count for all assigned areas
    const areaIds = accountAreas.map(area => area.area_id);
    let totalCount = 0;

    for (const areaId of areaIds) {
        const count = await countChatbotRequestsByAreaId(areaId);
        totalCount += count;
    }

    return totalCount;
};

export const getAllAreas = async (): Promise<any[]> => {
    const { data, error } = await supabase.from("areas").select("*");
    if (error) {
        throw new Error("Failed to get all areas: " + error.message);
    }
    return data;
};

export const getSystemWideChatbotRequestCounts = async (): Promise<ChatbotRequestCount[]> => {
    const { data, error } = await supabase.from("chatbot_request_counts").select("*");
    if (error) {
        throw error;
    }
    return data;
};