import { useNavigate } from "react-router-dom";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Map,
  Users,
  Settings,
  BarChart3,
  ArrowRight,
  Eye,
  Bot,
  Badge,
  TrendingUpDown,
  MapPin,
} from "lucide-react";
import { useAuthStore } from "@/stores/auth.store";
import { ROOT_ROLE } from "@/constants/role.constants";
import { useEffect, useState } from "react";
import VisitorLogsChartBlock from "@/components/blocks/VisitorLogsChartBlock";
import { countAreas, countAreasByAccountId } from "@/services/areas.service";
import { countHotspots, countHotspotsByAccountId } from "@/services/hotspots.service";
import { countPanoramas, countPanoramasByAccountId } from "@/services/panoramas.service";
import { countChatbotRequests, countChatbotRequestsByAccountId } from "@/services/chatbot_request_counts.service";
import { countVisitLogs, countVisitLogsByAccountId } from "@/services/visitor_logs.service";

const MainManagePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isRoot = user?.role === ROOT_ROLE;

  const quickActions = [
    {
      title: "Quản lý Địa điểm",
      description: "Thêm, sửa, xóa các địa điểm du lịch",
      icon: Map,
      path: "/quan-ly/dia-diem",
      color: "bg-blue-500",
    },
    {
      title: "Trợ lý ảo",
      description: "Quản lý chatbot và câu hỏi thường gặp",
      icon: Bot,
      path: "/quan-ly/tro-ly-ao",
      color: "bg-green-500",
    },
    ...(isRoot
      ? [
        {
          title: "Quản lý Người dùng",
          description: "Quản lý tài khoản và phân quyền",
          icon: Users,
          path: "/quan-ly/nguoi-dung",
          color: "bg-purple-500",
        },
        {
          title: "Quản lý Khu vực",
          description: "Cấu hình và quản lý các khu vực",
          icon: Settings,
          path: "/quan-ly/khu-vuc",
          color: "bg-orange-500",
        },
      ]
      : []),
  ];
  const [areaCount, setAreaCount] = useState(0);
  const [hotspotCount, setHotspotCount] = useState(0);
  const [panoramaCount, setPanoramaCount] = useState(0);
  const [chatbotRequestCount, setChatbotRequestCount] = useState(0);
  const [visitorLogCount, setVisitorLogCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        if (isRoot) {
          // For root users, get all system data
          const [areaCountData, hotspotCountData, panoramaCountData, chatbotRequestCountData, visitorLogCountData] = await Promise.all([
            countAreas(),
            countHotspots(),
            countPanoramas(),
            countChatbotRequests(),
            countVisitLogs()
          ]);
          setAreaCount(areaCountData);
          setHotspotCount(hotspotCountData);
          setPanoramaCount(panoramaCountData);
          setChatbotRequestCount(chatbotRequestCountData);
          setVisitorLogCount(visitorLogCountData);
        } else {
          // For admin users, get only their assigned area data
          const accountId = user?.account_id;
          if (accountId) {
            const [areaCountData, hotspotCountData, panoramaCountData, chatbotRequestCountData, visitorLogCountData] = await Promise.all([
              countAreasByAccountId(accountId),
              countHotspotsByAccountId(accountId),
              countPanoramasByAccountId(accountId),
              countChatbotRequestsByAccountId(accountId),
              countVisitLogsByAccountId(accountId)
            ]);
            setAreaCount(areaCountData);
            setHotspotCount(hotspotCountData);
            setPanoramaCount(panoramaCountData);
            setChatbotRequestCount(chatbotRequestCountData);
            setVisitorLogCount(visitorLogCountData);
          }
        }
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    })()
  }, [isRoot, user?.account_id])

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="">
          <CardHeader>
            <CardDescription>Tổng số khu vực</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {areaCount}
            </CardTitle>
            <CardAction>
              <MapPin />
            </CardAction>
          </CardHeader>

        </Card>
        <Card className="">
          <CardHeader>
            <CardDescription>Tổng số địa điểm</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {hotspotCount}
            </CardTitle>
            <CardAction>
              <Map />
            </CardAction>
          </CardHeader>

        </Card>
        <Card className="">
          <CardHeader>
            <CardDescription>Tổng số panorama</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {panoramaCount}
            </CardTitle>
            <CardAction>
              <Eye />
            </CardAction>
          </CardHeader>

        </Card>

      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="">
          <CardHeader>
            <CardDescription>Tổng số câu hỏi chatbot</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {chatbotRequestCount}
            </CardTitle>
            <CardAction>
              <Bot />
            </CardAction>
          </CardHeader>

        </Card>
        <Card className="">
          <CardHeader>
            <CardDescription>Tổng số lượt truy cập</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              {visitorLogCount}
            </CardTitle>
            <CardAction>
              <TrendingUpDown />
            </CardAction>
          </CardHeader>

        </Card>
        <Card className="">
          <CardHeader>
            <CardDescription>Trạng thái hệ thống</CardDescription>
            <CardTitle className="text-2xl font-semibold text-green-600">
              Hoạt động
            </CardTitle>
            <CardAction>
              <Badge />
            </CardAction>
          </CardHeader>

        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Truy cập nhanh
            </CardTitle>
            <CardDescription>
              Các chức năng quản lý chính của hệ thống
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action) => (
              <div
                key={action.path}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${action.color} text-white`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{action.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {action.description}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(action.path)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <VisitorLogsChartBlock
          areaId={isRoot ? "all" : user?.account_id || ""}
          title={isRoot ? "Thống kê truy cập toàn hệ thống" : "Thống kê truy cập khu vực"}
          description={isRoot
            ? "Biểu đồ số lượng khách truy cập toàn hệ thống trong 30 ngày gần đây"
            : "Biểu đồ số lượng khách truy cập khu vực trong 30 ngày gần đây"
          }
        />
      </div>
    </div>
  );
};

export default MainManagePage;
