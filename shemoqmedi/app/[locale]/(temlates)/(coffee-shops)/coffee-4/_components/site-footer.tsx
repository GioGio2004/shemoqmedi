export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="text-2xl font-serif tracking-wide mb-4 text-foreground">
              KO<span className="text-primary">HI</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Crafting exceptional coffee experiences since 2024. Every cup is a journey from farm to your hands.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground mb-4">
              Navigate
            </h4>
            <ul className="space-y-3">
              {["Menu", "Visit", "About", "Careers"].map((item) => (
                <li key={item}>
                  <a
                    href={item === "Menu" ? "#menu" : item === "Visit" ? "#visit" : "#"}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-xs font-semibold tracking-[0.2em] uppercase text-foreground mb-4">
              Connect
            </h4>
            <ul className="space-y-3">
              {["Instagram", "Twitter", "LinkedIn"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-border gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 KOHI Coffee. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-xs text-muted-foreground hover:text-primary transition-colors"
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
