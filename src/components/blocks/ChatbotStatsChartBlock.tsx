"use client"

import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import type { ChatbotRequestCount } from "@/types/chatbot_request_counts.service.type"

interface ChatbotStatsChartBlockProps {
    data: ChatbotRequestCount[]
}

const ChatbotStatsChartBlock = ({ data }: ChatbotStatsChartBlockProps) => {
    const [activeChart, setActiveChart] = React.useState<"total">("total")

    const chartData = data
        .map((item) => ({
            date: item.period_start,
            total: item.request_count,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const total = React.useMemo(
        () => ({
            total: chartData.reduce((acc, curr) => acc + curr.total, 0),
        }),
        [chartData]
    )

    const chartConfig = {
        total: {
            label: "Tổng yêu cầu",
            color: "var(--chart-1)",
        },
    } satisfies ChartConfig

    return (
        <Card className="py-0">
            <CardHeader className="flex flex-col items-stretch border-b !p-0 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:!py-0">
                    <CardTitle>Thống kê yêu cầu chatbot</CardTitle>
                    <CardDescription>
                        Hiển thị tổng số yêu cầu theo chu kỳ 30 ngày
                    </CardDescription>
                </div>
                <div className="flex">
                    <button
                        data-active={activeChart === "total"}
                        className="data-[active=true]:bg-muted/50 relative z-30 flex flex-1 flex-col justify-center gap-1 border-t px-6 py-4 text-left sm:border-t-0 sm:px-8 sm:py-6"
                        onClick={() => setActiveChart("total")}
                    >
                        <span className="text-muted-foreground text-xs">
                            {chartConfig.total.label}
                        </span>
                        <span className="text-lg leading-none font-bold sm:text-3xl">
                            {total.total.toLocaleString()}
                        </span>
                    </button>
                </div>
            </CardHeader>
            <CardContent className="px-2 sm:p-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[250px] w-full"
                >
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const startDate = new Date(value)
                                const endDate = new Date(startDate)
                                endDate.setDate(endDate.getDate() + 30)

                                return `${startDate.toLocaleDateString("vi-VN", {
                                    day: "numeric",
                                    month: "numeric",
                                })} - ${endDate.toLocaleDateString("vi-VN", {
                                    day: "numeric",
                                    month: "numeric",
                                })}`
                            }}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="total"
                                    labelFormatter={(value) => {
                                        const startDate = new Date(value)
                                        const endDate = new Date(startDate)
                                        endDate.setDate(endDate.getDate() + 30)

                                        return `${startDate.toLocaleDateString("vi-VN", {
                                            day: "numeric",
                                            month: "numeric",
                                            year: "numeric",
                                        })} - ${endDate.toLocaleDateString("vi-VN", {
                                            day: "numeric",
                                            month: "numeric",
                                            year: "numeric",
                                        })}`
                                    }}
                                />
                            }
                        />
                        <Bar dataKey={activeChart} fill={`var(--color-${activeChart})`} />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export default ChatbotStatsChartBlock
