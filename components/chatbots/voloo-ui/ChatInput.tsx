import React, { memo, useState } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  isProcessing: boolean;
  chatMode: "collapse" | "keep";
  hasContext: boolean;
  contextName?: string;
  placeholder: string;
  onTyping?: () => void;
}

export const ChatInput = memo(
  ({
    onSend,
    isProcessing,
    chatMode,
    hasContext,
    contextName,
    placeholder,
    onTyping,
  }: ChatInputProps) => {
    const [inputValue, setInputValue] = useState("");

    const handleSubmit = () => {
      const trimmed = inputValue.trim();
      if (!trimmed || (isProcessing && chatMode === "collapse")) return;
      onSend(trimmed);
      setInputValue("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    const isActive = inputValue.trim().length > 0;

    return (
      <div
        className="flex items-center gap-3 px-5 py-3 rounded-full relative overflow-hidden transition-all duration-400"
        style={{
          backgroundColor: "rgba(10, 10, 10, 0.6)",
          backdropFilter: "blur(32px) saturate(200%)",
          WebkitBackdropFilter: "blur(32px) saturate(200%)",
          border: hasContext
            ? "1px solid rgba(255,255,255,0.4)"
            : "1px solid rgba(255,255,255,0.1)",
          boxShadow:
            "0 24px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Context-active indicator */}
        {hasContext && (
          <div className="w-2 h-2 rounded-full shrink-0 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)] animate-pulse" />
        )}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onTyping?.();
          }}
          onKeyDown={handleKeyDown}
          placeholder={
            hasContext && contextName
              ? `Ask about ${contextName}…`
              : placeholder
          }
          className="flex-1 bg-transparent outline-none text-[15px] text-white placeholder:text-zinc-500 font-medium tracking-wide"
          autoComplete="off"
        />

        <button
          onClick={handleSubmit}
          disabled={!isActive || (isProcessing && chatMode === "collapse")}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
          style={
            isActive
              ? {
                  backgroundColor: "transparent",
                  color: "#ffffff",
                  border: "1px solid rgba(255, 255, 255, 0.4)",
                  transform: "scale(1.05)",
                }
              : { 
                  backgroundColor: "transparent",
                  color: "rgba(255,255,255,0.5)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                }
          }
        >
          <Send className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
        </button>
      </div>
    );
  },
);
ChatInput.displayName = "ChatInput";
