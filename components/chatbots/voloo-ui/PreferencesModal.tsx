import { X, SlidersHorizontal } from "lucide-react";
import { CafeTheme } from "./types";

interface PreferencesModalProps {
  isPreferencesOpen: boolean;
  setIsPreferencesOpen: (open: boolean) => void;
  userAllergies: string[];
  toggleAllergy: (allergy: string) => void;
  theme: CafeTheme;
}

export function PreferencesModal({
  isPreferencesOpen,
  setIsPreferencesOpen,
  userAllergies,
  toggleAllergy,
  theme,
}: PreferencesModalProps) {
  if (!isPreferencesOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="relative w-full max-w-[320px] rounded-[2rem] p-6 border shadow-2xl"
        style={{
          backgroundColor: `${theme.backgroundColor}f0`,
          borderColor: "rgba(255,255,255,0.08)",
          backdropFilter: "blur(24px) saturate(150%)",
        }}
      >
        <button
          onClick={() => setIsPreferencesOpen(false)}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 mb-2">
          <SlidersHorizontal
            className="w-4 h-4"
            style={{ color: theme.primaryColorLight }}
          />
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            Dietary Needs
          </h3>
        </div>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          Select any ingredients you'd like our AI to avoid when recommending
          menu items.
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {["Lactose/Dairy", "Nuts", "Gluten", "Vegan"].map((allergy) => {
            const isActive = userAllergies.includes(allergy);
            return (
              <button
                key={allergy}
                onClick={() => toggleAllergy(allergy)}
                className="px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all duration-200"
                style={
                  isActive
                    ? {
                        backgroundColor: theme.primaryColor,
                        borderColor: theme.primaryColor,
                        color: "#fff",
                        boxShadow: `0 4px 12px ${theme.primaryColor}50`,
                      }
                    : {
                        backgroundColor: "rgba(255,255,255,0.02)",
                        borderColor: "rgba(255,255,255,0.1)",
                        color: "#a1a1aa",
                      }
                }
              >
                {allergy}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => setIsPreferencesOpen(false)}
          className="w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider text-white transition-all hover:opacity-90 shadow-lg"
          style={{
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.primaryColorLight})`,
            boxShadow: `0 8px 24px ${theme.primaryColor}40`,
          }}
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
