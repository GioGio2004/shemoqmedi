import { Loader2, Sparkles } from "lucide-react";

interface MobileTriggerProps {
  isOpen: boolean;
  isProcessing: boolean;
  isReady: boolean;
  openChatAnimation: () => void;
}

export function MobileTrigger({
  isOpen,
  isProcessing,
  isReady,
  openChatAnimation,
}: MobileTriggerProps) {
  return (
    <div
      className="fixed z-50 left-4 right-4 flex md:hidden justify-center items-center pointer-events-none"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 1rem)" }}
    >
      <div
        className={`pointer-events-auto relative flex items-center justify-center transition-all duration-500 ease-in-out cursor-pointer ${
          !isOpen
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8 pointer-events-none"
        }`}
        onClick={() => {
          if (!isOpen) openChatAnimation();
        }}
      >
        <div
          className={`w-auto min-w-[180px] h-auto rounded-full backdrop-blur-[20px] bg-gradient-to-b from-white/10 to-white/5 active:scale-95 active:bg-white/20 transition-all duration-300 flex items-center justify-center py-3.5 px-8 relative shadow-[0_0_25px_rgba(255,255,255,0.08)]`}
        >
          <div
            className={`absolute inset-0 rounded-full border pointer-events-none transition-colors duration-500 ${isReady ? "border-green-400/80 shadow-[0_0_20px_rgba(74,222,128,0.4),inset_0_0_15px_rgba(74,222,128,0.2)] animate-pulse" : "border-white/20"}`}
          />
          <span className="font-bold text-sm tracking-wide text-zinc-100 drop-shadow-md flex items-center justify-center gap-2 whitespace-nowrap">
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                VolooAI is thinking
              </>
            ) : isReady ? (
              <>
                <Sparkles className="w-4 h-4 text-green-400 animate-bounce" />
                your request is ready
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                Ask VolooAI...
              </>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
