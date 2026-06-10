import { memo } from "react";

// Accepts `accentColor` from the parent's theme so bold text uses the
// cafe's brand colour instead of a hardcoded orange.
export const FormatMessage = memo(
  ({ content, accentColor }: { content: string; accentColor: string }) => {
    if (!content) return null;
    return (
      <div className="space-y-1.5">
        {content.split("\n").map((line, i) => {
          if (!line.trim()) return <div key={i} className="h-1" />;
          return (
            <p key={i} className="leading-relaxed text-sm">
              {line.split(/(\*\*.*?\*\*)/).map((part, j) => {
                if (part.startsWith("**") && part.endsWith("**")) {
                  return (
                    <span
                      key={j}
                      className="font-bold"
                      style={{ color: accentColor }}
                    >
                      {part.slice(2, -2)}
                    </span>
                  );
                }
                return part;
              })}
            </p>
          );
        })}
      </div>
    );
  },
);
FormatMessage.displayName = "FormatMessage";
