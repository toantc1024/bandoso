import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ChatbotRequestCount } from "@/types/chatbot_request_counts.service.type"
import { MessageSquare, TrendingUp, Clock, Activity } from "lucide-react"

interface ChatbotRecentActivityBlockProps {
    areaRequestCounts: ChatbotRequestCount[]
}

const ChatbotRecentActivityBlock = ({ areaRequestCounts }: ChatbotRecentActivityBlockProps) => {
    const recentActivity = areaRequestCounts
        .sort((a, b) => new Date(b.period_start).getTime() - new Date(a.period_start).getTime())
        .slice(0, 10)

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

        if (diffInHours < 1) {
            return 'Vừa xong'
        } else if (diffInHours < 24) {
            return `${diffInHours} giờ trước`
        } else {
            const diffInDays = Math.floor(diffInHours / 24)
            return `${diffInDays} ngày trước`
        }
    }

    const getActivityIcon = (requestCount: number) => {
        if (requestCount > 100) return <TrendingUp className="h-4 w-4 text-green-500" />
        if (requestCount > 50) return <Activity className="h-4 w-4 text-blue-500" />
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }

    const getActivityColor = (requestCount: number) => {
        if (requestCount > 100) return "bg-green-100 text-green-800"
        if (requestCount > 50) return "bg-blue-100 text-blue-800"
        return "bg-gray-100 text-gray-800"
    }

    if (recentActivity.length === 0) {
        return (
            <Card className="col-span-full lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Hoạt động gần đây
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        Chưa có hoạt động nào
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-full lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Hoạt động gần đây
                </CardTitle>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                        {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                                <div className="flex-shrink-0">
                                    {getActivityIcon(activity.request_count)}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-medium">
                                            {activity.request_count} yêu cầu
                                        </p>
                                        <Badge
                                            variant="secondary"
                                            className={`text-xs ${getActivityColor(activity.request_count)}`}
                                        >
                                            {activity.request_count > 100 ? 'Cao' : activity.request_count > 50 ? 'Trung bình' : 'Thấp'}
                                        </Badge>
                                    </div>

                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                            {formatDate(activity.period_start)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

export default ChatbotRecentActivityBlock
