export function SiteFooter({
  organizationName = "KOHI",
  socialLinks = {},
}: {
  organizationName?: string;
  socialLinks?: Record<string, string>;
}) {
  return (
    <footer className="border-t border-white/5 bg-background/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="text-2xl font-serif tracking-wide mb-4 text-foreground font-bold transition-opacity hover:opacity-80">
              <span className="text-primary">{organizationName.charAt(0)}</span>
              {organizationName.slice(1)}
            </div>
            <p className="text-sm text-foreground/60 max-w-sm leading-relaxed font-light">
              Crafting exceptional experiences. Every detail is a journey tailored for you.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground/90 mb-4">
              Navigate
            </h4>
            <ul className="space-y-3">
              {["Menu", "Visit", "About", "Careers"].map((item) => (
                <li key={item}>
                  <a
                    href={`#${item.toLowerCase()}`}
                    className="text-sm text-foreground/50 hover:text-primary transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground/90 mb-4">
              Connect
            </h4>
            <ul className="space-y-3">
              {["Instagram", "Twitter", "LinkedIn", "Facebook"].map((item) => {
                const link = socialLinks?.[item.toLowerCase()];
                // Keep some defaults so it doesn't look empty if none are provided
                if (!link && item !== "Instagram" && item !== "Twitter") return null;
                return (
                  <li key={item}>
                    <a
                      href={link || "#"}
                      target={link ? "_blank" : undefined}
                      rel={link ? "noopener noreferrer" : undefined}
                      className="text-sm text-foreground/50 hover:text-primary transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 gap-4">
          <p className="text-xs text-foreground/40 font-light">
            &copy; {new Date().getFullYear()} {organizationName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-foreground/40 hover:text-foreground/80 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
