// class GetChatCacheRequest(BaseModel):
//     queries: list[QueryBase]
//     limit: int = 10
//     offset: str = ""

import { getApi } from "@/lib/api";
import type { GetVectorRequest } from "./base.service";



export const getChatCache = async (request: GetVectorRequest) => {
  let data = await getApi().post(`/chats/cache`, request);
  if (data.status !== 200) {
    throw new Error("Failed to get chat cache: " + data.statusText);
  }
  return data.data;
};

export const getChatCacheByAreaId = async (areaId: string, limit: number = 10, offset?: string) => {
  const request: GetVectorRequest = {
    queries: [
      {
        key: "area_id",
        value: String(areaId),
      },
    ],
    limit,
    offset,
  };
  return getChatCache(request);
};

export const deleteChatCache = async (uuids: string[]) => {
  let data = await getApi().delete(`/chats/cache`, {
    data: { uuids },
  });
  if (data.status !== 200) {
    throw new Error("Failed to delete chat cache: " + data.statusText);
  }
  return data.data;
};