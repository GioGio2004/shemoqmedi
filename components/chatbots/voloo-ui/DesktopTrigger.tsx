import { Loader2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { CafeTheme } from "./types";
import { RefObject } from "react";

interface DesktopTriggerProps {
  isOpen: boolean;
  isProcessing: boolean;
  isReady: boolean;
  openChatAnimation: () => void;
  theme: CafeTheme;
  processingPillRef: React.RefObject<HTMLDivElement | null> | React.RefObject<HTMLDivElement>;
}

export function DesktopTrigger({
  isOpen,
  isProcessing,
  isReady,
  openChatAnimation,
  theme,
  processingPillRef,
}: DesktopTriggerProps) {
  const t = useTranslations("CoffeeTemplate3.Chatbot");

  return (
    <>
      {/* ── Desktop Floating Trigger ── */}
      {!isOpen && !isProcessing && !isReady && (
        <button
          onClick={openChatAnimation}
          className="fixed z-50 p-4 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-300 group hidden md:flex"
          style={{
            bottom: "calc(env(safe-area-inset-bottom) + 5rem)",
            right: "1.25rem",
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColorLight})`,
            boxShadow: `0 20px 60px -10px ${theme.primaryColor}80`,
          }}
        >
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50" />
        </button>
      )}

      {/* ── Desktop Processing Pill ── */}
      <div
        ref={processingPillRef}
        className="fixed z-[100] hidden"
        style={{
          bottom: "calc(env(safe-area-inset-bottom) + 5rem)",
          right: "1.5rem",
        }}
      >
        <div className="hidden md:flex px-6 py-3 bg-zinc-900/90 text-white rounded-full shadow-2xl items-center gap-2.5 border border-white/10 backdrop-blur-xl">
          <Loader2
            className="w-4 h-4 animate-spin"
            style={{ color: theme.primaryColorLight }}
          />
          <span className="font-bold text-xs uppercase tracking-wider">
            {t("thinking")}
          </span>
        </div>
      </div>
    </>
  );
}
