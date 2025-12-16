import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Loader2, ChevronDown, ChevronRight } from "lucide-react"

export interface Chat {
    questions: any[];
    next_offset_id: string;
}

interface ChatbotChatListBlockProps {
    chat: Chat | undefined
    onLoadMore: (offsetId: string) => void
    isLoading?: boolean
}

const ChatbotChatListBlock = ({
    chat,
    onLoadMore,
    isLoading = false
}: ChatbotChatListBlockProps) => {
    const [expandedChats, setExpandedChats] = useState<Set<string>>(new Set())

    const toggleChatExpansion = (chatId: string) => {
        const newExpanded = new Set(expandedChats)
        if (newExpanded.has(chatId)) {
            newExpanded.delete(chatId)
        } else {
            newExpanded.add(chatId)
        }
        setExpandedChats(newExpanded)
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleLoadMore = () => {
        if (chat?.next_offset_id) {
            onLoadMore(chat.next_offset_id)
        }
    }

    const chatData = chat?.questions || []
    if (chatData.length === 0) {
        return (
            <Card className="col-span-full lg:col-span-1">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Lịch sử trò chuyện
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        Chưa có cuộc trò chuyện nào
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="col-span-full lg:col-span-1">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Các câu hỏi gần đây
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="max-h-[400px] overflow-y-auto pr-4">
                    <div className="space-y-4">
                        {chatData.map((chatItem: any, index: number) => {
                            const chatId = chatItem.id || `chat-${index}`
                            const isExpanded = expandedChats.has(chatId)
                            const question = chatItem.metadata?.page_content || chatItem.question || "Không có câu hỏi"
                            const answer = chatItem.metadata?.metadata?.answer || chatItem.answer || "Không có câu trả lời"
                            const timestamp = chatItem.created_at || chatItem.timestamp

                            return (
                                <div key={chatId} className="border rounded-lg p-4 bg-card">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 ">
                                                {timestamp && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        {formatDate(timestamp)}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div
                                                className="cursor-pointer hover:bg-muted/50 rounded p-2 -m-2 transition-colors"
                                                onClick={() => toggleChatExpansion(chatId)}
                                            >
                                                <p className="text-lg text-foreground font-medium">
                                                    {question}
                                                </p>
                                            </div>

                                            {isExpanded && (
                                                <div className="pl-6 border-l-2 border-muted py-4 mt-2">
                                                    <p className="text-lg text-muted-foreground">
                                                        {answer}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleChatExpansion(chatId)}
                                            className="ml-2 p-1 h-8 w-8"
                                        >
                                            {isExpanded ? (
                                                <ChevronDown className="h-4 w-4" />
                                            ) : (
                                                <ChevronRight className="h-4 w-4" />
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Load More Button */}
                    {chat?.next_offset_id && (
                        <div className="flex w-full justify-center pt-4 border-t">
                            <Button
                                onClick={handleLoadMore}
                                disabled={isLoading}
                                variant="outline"
                                className="w-full max-w-xs"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        Đang tải...
                                    </>
                                ) : (
                                    'Tải thêm câu hỏi'
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default ChatbotChatListBlock
