import { getAreasByAccountId } from "@/services/account_profiles.service";
import { getAreaById } from "@/services/areas.service";
import { getChatCacheByAreaId } from "@/services/chat.service";
import { getChatbotRequestCountsByAreaId, getAllAreas, getSystemWideChatbotRequestCounts } from "@/services/chatbot_request_counts.service";
import { useAuthStore } from "@/stores/auth.store";
import type { Area } from "@/types/areas.service.type";
import type { ChatbotRequestCount } from "@/types/chatbot_request_counts.service.type";
import { useEffect, useState } from "react";
import ChatbotStatsChartBlock from "@/components/blocks/ChatbotStatsChartBlock";
import ChatbotUsageBlock from "@/components/blocks/ChatbotUsageBlock";
import ChatbotChatListBlock, { type Chat } from "@/components/blocks/ChatbotChatListBlock";
import { Bot, Globe } from "lucide-react";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ROOT_ROLE } from "@/constants/role.constants";

const ManageChatbot = () => {
  const { user } = useAuthStore();
  const [chat, setChat] = useState<Chat>();
  const [area, setArea] = useState<Area | null>(null);
  const [areaRequestCounts, setAreaRequestCounts] = useState<ChatbotRequestCount[]>([]);
  const [systemWideRequestCounts, setSystemWideRequestCounts] = useState<ChatbotRequestCount[]>([]);
  const [allAreas, setAllAreas] = useState<Area[]>([]);
  const [selectedAreaId, setSelectedAreaId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const getChat = async (areaId?: string) => {
    try {
      setIsLoading(true);
      if (!user) return;

      let targetAreaId = areaId;

      if (user.role === ROOT_ROLE) {
        // For root users, use selected area or first available area
        if (!targetAreaId && allAreas.length > 0) {
          targetAreaId = allAreas[0].area_id;
          setSelectedAreaId(targetAreaId);
        }
      } else {
        // For regular users, get their assigned areas
        const areaIds = await getAreasByAccountId(user.account_id);
        if (areaIds.length === 0) return;
        targetAreaId = areaIds[0];
      }

      if (!targetAreaId) return;

      const [areaData, areaRequestCountsData] = await Promise.all([
        getAreaById(targetAreaId),
        getChatbotRequestCountsByAreaId(targetAreaId)
      ]);
      setAreaRequestCounts(areaRequestCountsData);
      setArea(areaData);

      const chatData = await getChatCacheByAreaId(targetAreaId, 1);
      setChat(chatData);
    } catch (error) {
      console.error("Error fetching chatbot data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreChats = async (offsetId: string) => {
    try {
      setIsLoadingMore(true);
      if (!user) return;

      let targetAreaId = selectedAreaId;

      if (user.role !== ROOT_ROLE) {
        const areaIds = await getAreasByAccountId(user.account_id);
        if (areaIds.length === 0) return;
        targetAreaId = areaIds[0];
      }

      if (!targetAreaId) return;

      const moreChats = await getChatCacheByAreaId(targetAreaId, 10, offsetId);

      // Merge the new chats with existing ones, preserving the structure
      setChat(prevChat => {
        if (!prevChat) return moreChats;

        return {
          ...prevChat,
          questions: [...(prevChat.questions || []), ...(moreChats.questions || [])],
          next_offset_id: moreChats.next_offset_id
        };
      });
    } catch (error) {
      console.error("Error loading more chats:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleAreaChange = async (areaId: string) => {
    setSelectedAreaId(areaId);
    await getChat(areaId);
  };

  const loadSystemData = async () => {
    try {
      if (!user) return;

      if (user.role === ROOT_ROLE) {
        // Load all areas and system-wide data for root users
        const [areasData, systemWideData] = await Promise.all([
          getAllAreas(),
          getSystemWideChatbotRequestCounts()
        ]);
        setAllAreas(areasData);
        setSystemWideRequestCounts(systemWideData);

        if (areasData.length > 0) {
          setSelectedAreaId(areasData[0].area_id);
          await getChat(areasData[0].area_id);
        }
      } else {
        // Regular user flow
        await getChat();
      }
    } catch (error) {
      console.error("Error loading system data:", error);
    }
  };

  useEffect(() => {
    loadSystemData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <div className="flex flex-col items-center space-y-4">
          <Spinner className="text-primary" size={64} variant="default" />
          <div className="text-lg font-medium text-foreground animate-pulse">
            Đang tải dữ liệu về trợ lý...
          </div>
        </div>
      </div>
    );
  }

  if (!area) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Bot className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Không có khu vực nào</h3>
          <p className="text-muted-foreground">
            Bạn cần có ít nhất một khu vực để quản lý chatbot
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Area Selection for Root Users */}
      {user?.role === ROOT_ROLE && allAreas.length > 0 && (
        <div className="bg-card border rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Chọn Khu Vực</h3>
          </div>
          <Select value={selectedAreaId} onValueChange={handleAreaChange}>
            <SelectTrigger className="w-full max-w-md">
              <SelectValue placeholder="Chọn khu vực để xem" />
            </SelectTrigger>
            <SelectContent>
              {allAreas.map((area) => (
                <SelectItem key={area.area_id} value={area.area_id}>
                  {area.area_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChatbotStatsChartBlock
          data={user?.role === ROOT_ROLE ? systemWideRequestCounts : areaRequestCounts}
        />
        <ChatbotUsageBlock
          area={area}
          areaRequestCounts={areaRequestCounts}
        />
      </div>
      <ChatbotChatListBlock
        chat={chat}
        onLoadMore={loadMoreChats}
        isLoading={isLoadingMore}
      />
    </div>
  );
}

export default ManageChatbot;
