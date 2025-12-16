"use client"

import type { ChatbotRequestCount } from "@/types/chatbot_request_counts.service.type"
import type { Area } from "@/types/areas.service.type"
import { MapPin, MessageSquare, Globe } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import type { ChartConfig } from "../ui/chart"
import { ChartContainer } from "../ui/chart"
import { PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart, Label } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { useState } from "react"

interface ChatbotStatsOverviewBlockProps {
    area: Area | null
    areaRequestCounts: ChatbotRequestCount[]
    systemWideRequestCounts?: ChatbotRequestCount[]
    isRootUser?: boolean
}

const ChatbotStatsOverviewBlock = ({
    area,
    areaRequestCounts,
    systemWideRequestCounts,
    isRootUser = false
}: ChatbotStatsOverviewBlockProps) => {
    // Sort by period_start and get the most recent month's data
    const sortedRequestCounts = [...areaRequestCounts].sort((a, b) =>
        new Date(b.period_start).getTime() - new Date(a.period_start).getTime()
    )

    // State for selected period
    const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0)

    // Get the selected period's data
    const selectedPeriodData = sortedRequestCounts[selectedPeriodIndex] || null
    const currentPeriodRequests = selectedPeriodData ? selectedPeriodData.request_count : 0
    const chatbotLimit = area?.chatbot_limit_request || 0
    const usagePercentage = chatbotLimit > 0 ? (currentPeriodRequests / chatbotLimit) * 100 : 0

    // Calculate system-wide totals for root users
    const getSystemWideTotal = () => {
        if (!systemWideRequestCounts || !isRootUser) return 0;
        return systemWideRequestCounts.reduce((total, count) => total + count.request_count, 0);
    };

    const systemWideTotal = getSystemWideTotal();

    // Format period for display as a date range (start date + 30 days)
    const formatPeriod = (periodStart: string) => {
        const startDate = new Date(periodStart)
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 30)

        const formatOptions: Intl.DateTimeFormatOptions = {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        }

        const startFormatted = startDate.toLocaleDateString('vi-VN', formatOptions)
        const endFormatted = endDate.toLocaleDateString('vi-VN', formatOptions)

        return `${startFormatted} - ${endFormatted}`
    }

    // Chart data for the radial chart - show usage percentage (0-100%)
    const chartData = [
        {
            usage: "current",
            value: Math.min(usagePercentage, 100), // Cap at 100% for display
            fill: "hsl(var(--primary))"
        }
    ]

    const chartConfig = {
        usage: {
            label: "Usage",
            color: "hsl(var(--primary))",
        },
    } satisfies ChartConfig

    return (
        <div className="grid cols-span-1 gap-4">
            {/* System-wide Overview for Root Users */}
            {isRootUser && systemWideRequestCounts && (
                <Card className="flex flex-col">
                    <CardHeader className="items-center pb-0">
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            Tổng Quan Hệ Thống
                        </CardTitle>
                        <CardDescription>Thống kê toàn bộ hệ thống</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 pb-0">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="space-y-2">
                                <div className="text-2xl font-bold text-primary">
                                    {systemWideTotal.toLocaleString()}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Tổng requests
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="text-2xl font-bold text-green-600">
                                    {systemWideRequestCounts.length}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    Khu vực hoạt động
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Area Information Card */}
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        {isRootUser ? `Khu Vực: ${area?.area_name}` : 'Thông Tin Khu Vực'}
                    </CardTitle>
                    <CardDescription>
                        {isRootUser ? 'Chi tiết khu vực được chọn' : 'Thông tin chi tiết'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-blue-600">
                                {area?.chatbot_limit_request?.toLocaleString() || 0}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Giới hạn requests
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="text-2xl font-bold text-orange-600">
                                {area?.domain || 'N/A'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                Domain
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Chatbot Usage Card */}
            <Card className="flex flex-col">
                <CardHeader className="items-center pb-0">
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Sử dụng Chatbot
                    </CardTitle>
                    <CardDescription>Giới hạn request theo chu kỳ 30 ngày</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    {/* Period Selector */}
                    <div className="mb-4 flex justify-center">
                        <Select value={selectedPeriodIndex.toString()} onValueChange={(value) => setSelectedPeriodIndex(parseInt(value))}>
                            <SelectTrigger className="w-64">
                                <SelectValue placeholder="Chọn chu kỳ thời gian" />
                            </SelectTrigger>
                            <SelectContent>
                                {sortedRequestCounts.map((period, index) => (
                                    <SelectItem key={period.period_start} value={index.toString()}>
                                        {formatPeriod(period.period_start)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[250px]"
                    >
                        <RadialBarChart
                            data={chartData}
                            startAngle={90}
                            endAngle={90 + (usagePercentage / 100) * 360}
                            innerRadius={80}
                            outerRadius={110}
                        >
                            <PolarGrid
                                gridType="circle"
                                radialLines={false}
                                stroke="none"
                                className="first:fill-muted last:fill-background"
                                polarRadius={[86, 74]}
                            />
                            <RadialBar dataKey="value" background cornerRadius={15} fill="blue" />
                            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-foreground text-lg font-bold"
                                                    >
                                                        {usagePercentage.toFixed(1)}%
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 32}
                                                        className="fill-muted-foreground text-lg"
                                                    >
                                                        Giới hạn
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </PolarRadiusAxis>
                        </RadialBarChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-sm">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-foreground">
                            {currentPeriodRequests.toLocaleString()}/{chatbotLimit.toLocaleString()} requests
                        </div>
                        <div className="text-lg text-muted-foreground">
                            Sử dụng {usagePercentage.toFixed(1)}% giới hạn
                        </div>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}

export default ChatbotStatsOverviewBlock
