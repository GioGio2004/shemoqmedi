import { X, SlidersHorizontal, Check } from "lucide-react";
import { CafeTheme } from "./types";

interface PreferencesModalProps {
  isPreferencesOpen: boolean;
  setIsPreferencesOpen: (open: boolean) => void;
  userAllergies: string[];
  toggleAllergy: (allergy: string) => void;
  hasConsent: boolean;
  setHasConsent: (consent: boolean) => void;
  theme: CafeTheme;
}

export function PreferencesModal({
  isPreferencesOpen,
  setIsPreferencesOpen,
  userAllergies,
  toggleAllergy,
  hasConsent,
  setHasConsent,
  theme,
}: PreferencesModalProps) {
  if (!isPreferencesOpen) return null;

  const requiresConsent = userAllergies.length > 0;
  const canSave = !requiresConsent || hasConsent;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in"
      style={{
        backgroundColor: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div
        className="relative w-full max-w-[320px] rounded-[2rem] p-6 border shadow-2xl bg-black/80 backdrop-blur-xl border-white/10"
      >
        <button
          onClick={() => setIsPreferencesOpen(false)}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2 mb-2">
          <SlidersHorizontal
            className="w-4 h-4 text-white"
          />
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            Dietary Needs
          </h3>
        </div>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          Select any ingredients you'd like our AI to avoid when recommending
          menu items.
        </p>

        <div className="flex flex-wrap gap-2 mb-6">
          {["Lactose/Dairy", "Nuts", "Gluten", "Vegan"].map((allergy) => {
            const isActive = userAllergies.includes(allergy);
            return (
              <button
                key={allergy}
                onClick={() => toggleAllergy(allergy)}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all duration-200 ${
                  isActive
                    ? "bg-white border-white text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                    : "bg-white/5 border-white/10 text-zinc-400 hover:text-zinc-300 hover:border-white/20 hover:bg-white/10"
                }`}
              >
                {allergy}
              </button>
            );
          })}
        </div>

        {requiresConsent && (
          <label className="flex items-start gap-3 mb-8 cursor-pointer group">
            <div className="relative flex items-center justify-center mt-0.5">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={hasConsent}
                onChange={(e) => setHasConsent(e.target.checked)}
              />
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                  hasConsent
                    ? "bg-white border-white"
                    : "bg-transparent border-white/20 group-hover:border-white/40"
                }`}
              >
                <Check
                  className={`w-3 h-3 text-black transition-transform ${
                    hasConsent ? "scale-100" : "scale-0"
                  }`}
                  strokeWidth={3}
                />
              </div>
            </div>
            <span className="text-xs text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors select-none">
              I explicitly consent to the processing of my dietary and allergy information to receive personalized recommendations.
            </span>
          </label>
        )}

        <button
          onClick={() => {
            if (canSave) setIsPreferencesOpen(false);
          }}
          disabled={!canSave}
          className={`w-full py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-lg ${
            canSave
              ? "bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.15)]"
              : "bg-white/5 text-zinc-500 border border-white/10 cursor-not-allowed"
          }`}
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
