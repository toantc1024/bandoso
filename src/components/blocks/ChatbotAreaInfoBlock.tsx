import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { Area } from "@/types/areas.service.type"
import { MapPin, Calendar, Info, Users } from "lucide-react"

interface ChatbotAreaInfoBlockProps {
    area: Area | null
}

const ChatbotAreaInfoBlock = ({ area }: ChatbotAreaInfoBlockProps) => {
    if (!area) {
        return (
            <Card className="col-span-full lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Thông tin khu vực
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        Không có thông tin khu vực
                    </div>
                </CardContent>
            </Card>
        )
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <Card className="col-span-full lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Thông tin khu vực
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Tên khu vực:</span>
                    </div>
                    <Badge variant="outline" className="text-base px-3 py-1">
                        {area.area_name}
                    </Badge>
                </div>

                <Separator />

                {area.created_at && (
                    <>
                        <Separator />
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Ngày tạo:</span>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {formatDate(area.created_at)}
                            </span>
                        </div>
                    </>
                )}

                <Separator />

                {area.is_active !== undefined && (
                    <>
                        <Separator />
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Trạng thái:</span>
                            </div>
                            <Badge
                                variant={area.is_active ? "default" : "secondary"}
                                className={area.is_active ? "bg-green-500" : ""}
                            >
                                {area.is_active ? "Hoạt động" : "Không hoạt động"}
                            </Badge>
                        </div>
                    </>
                )}

                {area.description && (
                    <>
                        <Separator />
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Info className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Mô tả:</span>
                            </div>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {area.description}
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

export default ChatbotAreaInfoBlock
