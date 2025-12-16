export const PERIOD_RANGE = 30 * 24 * 60 * 60 * 1000

export type ChatbotRequestCount = {
    id: string;
    area_id: string;
    period_start: string;
    request_count: number;
};

