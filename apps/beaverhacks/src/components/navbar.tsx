"use client";

const navItems = [
  { id: "home", label: "home", icon: "", file: "index.tsx" },
  { id: "sponsors", label: "sponsors", icon: "", file: "sponsors.tsx" },
  { id: "faq", label: "faq", icon: "󰋖", file: "faq.md" },
] as const;

export type Page = (typeof navItems)[number]["id"];

interface NavbarProps {
  active: Page;
  onNavigate: (page: Page) => void;
}

export const Navbar = ({ active, onNavigate }: NavbarProps) => {
  return (
    <nav className="relative z-20 shrink-0 mb-2">
      {/* Tabline */}
      <div className="flex items-stretch font-secondary text-[10px] md:text-xs border-b border-amber-muted/30">
        {/* Tabs */}
        <div className="flex items-stretch">
          {navItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`group flex items-center gap-1.5 px-3 py-1.5 transition-all border-b-2 -mb-[2px] ${
                  isActive
                    ? "bg-amber-muted/20 border-amber-bright text-amber-bright"
                    : "border-transparent text-amber-dim hover:text-amber-normal hover:bg-amber-muted/10"
                }`}
              >
                <span className={`text-[10px] ${isActive ? "text-amber-bright" : "text-amber-muted group-hover:text-amber-dim"}`}>
                  {item.icon}
                </span>
                <span className="hidden sm:inline">{item.file}</span>
                <span className="sm:hidden">{item.label}</span>
                {isActive && (
                  <span className="text-amber-muted text-[8px] hidden md:inline">●</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Spacer with vim-style buffer info */}
        <div className="flex-1 flex items-center justify-end px-2 text-amber-muted/50">
          <span className="hidden lg:inline">
            {navItems.findIndex((item) => item.id === active) + 1}/{navItems.length}
          </span>
        </div>

        {/* Register button - special tab */}
        <a
          href="/apply"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-bright/10 text-amber-bright hover:bg-amber-bright/20 transition-all border-l border-amber-muted/30"
        >
          <span className="text-[10px]"></span>
          <span className="hidden sm:inline">register</span>
          <span className="sm:hidden">reg</span>
        </a>
      </div>

      {/* Breadcrumb / path line */}
      <div className="flex items-center gap-2 px-1 py-1 text-[9px] md:text-[10px] text-amber-muted">
        <span className="text-amber-dim">~</span>
        <span className="text-amber-muted/50">/</span>
        <span className="text-amber-dim">beaverhacks</span>
        <span className="text-amber-muted/50">/</span>
        <span className="text-amber-normal">{navItems.find((item) => item.id === active)?.file}</span>
        <span className="text-amber-muted/50 hidden sm:inline">
          [+] utf-8 unix
        </span>
      </div>
    </nav>
  );
};
