import { RiChatAiFill } from "react-icons/ri";
import AI_ICON from "@/assets/AI_ICON.png";
import { FiUser } from "react-icons/fi";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useState } from "react";
import { cn } from "@/lib/utils";

const ChatbotDialogBlock = () => {
  const [messages, setMessages] = useState<
    Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      timestamp: Date;
    }>
  >([
    {
      id: "1",
      content:
        "Chào bạn, mình là trợ lý ảo của hệ thống bản đồ số. Bạn cần mình trợ giúp gì nè?",
      role: "assistant",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = async (question: string) => {
    if (!question.trim()) return;

    setIsLoading(true);

    // Add user message immediately
    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user" as const,
      content: question,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Simulate API call that always fails for now
      await new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Feature not available")), 1000)
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      const errorMessage = {
        id: `error-${Date.now()}`,
        role: "assistant" as const,
        content:
          "Tính năng đang được phát triển và sẽ ra mắt trong thời gian tới",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    handleSubmit(inputValue);
    setInputValue("");
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (isLoading) return;
    handleSubmit(suggestion);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-18 lg:h-18 rounded-full glass glass-light flex justify-center items-center glass-hover cursor-pointer transition-all duration-300 hover:scale-105">
          <img
            src={AI_ICON}
            className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 lg:w-12 lg:h-12 p-1"
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="glass glass-light text-white border border-white/20 w-[calc(100vw-1rem)] sm:w-96 h-[80vh] sm:h-[500px] p-0"
        align="end"
        side="top"
        sideOffset={10}
      >
        <div className="flex h-full w-full flex-col overflow-hidden">
          {/* Header */}
          <div className="p-3 sm:p-4 border-b border-white/20">
            <div className="flex items-center gap-2">
              <RiChatAiFill className="text-white w-5 h-5" />
              <h3 className="text-white font-medium">Chatbot</h3>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="flex gap-2 sm:gap-3">
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center",
                      message.role === "user"
                        ? "bg-blue-500/30 border border-blue-600/30"
                        : "glass border border-white/20"
                    )}
                  >
                    {message.role === "user" ? (
                      <FiUser className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    ) : (
                      <RiChatAiFill className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                    )}
                  </div>
                </div>
                <div
                  className={cn(
                    "flex-1 p-2 sm:p-3 rounded-lg text-xs sm:text-sm",
                    message.role === "user"
                      ? "bg-blue-500/30 border border-blue-600/30"
                      : "glass-light border border-white/20"
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 sm:gap-3">
                <div className="flex-shrink-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full glass border border-white/20 flex items-center justify-center">
                    <RiChatAiFill className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                  </div>
                </div>
                <div className="flex-1 p-2 sm:p-3 rounded-lg text-xs sm:text-sm glass-light border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Đang suy nghĩ...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 border-t border-white/20">
            {/* Suggestion Pills */}
            {!isLoading && (
              <div className="mb-3">
                <div className="flex flex-wrap sm:flex-nowrap gap-2 overflow-x-auto scrollbar-hide pb-2">
                  {[
                    "Địa điểm này ở đâu?",
                    "Giới thiệu về lịch sử nơi này",
                    "Có gì đặc biệt ở đây?",
                    "Kể thêm về địa điểm này",
                  ].map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="glass glass-hover hover:text-white text-white border-white/20 hover:border-white/40 rounded-full text-xs whitespace-nowrap flex-shrink-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <form
              onSubmit={handleFormSubmit}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Hỏi tôi bất cứ điều gì về các địa chỉ đỏ..."
                disabled={isLoading}
                className="flex-1 bg-transparent border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/60 focus:outline-none focus:border-white/40"
              />
              <Button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                size="sm"
                className="glass glass-hover text-white border border-white/20 hover:border-white/40 sm:w-auto w-full"
              >
                Gửi
              </Button>
            </form>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ChatbotDialogBlock;
