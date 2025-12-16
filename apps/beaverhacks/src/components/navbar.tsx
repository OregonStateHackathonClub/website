const navItems = ["home", "sponsors", "faq"] as const;

export type Page = (typeof navItems)[number];

interface NavbarProps {
  active: Page;
  onNavigate: (page: Page) => void;
}

export const Navbar = ({ active, onNavigate }: NavbarProps) => {
  return (
    <nav className="relative z-20 flex items-center justify-between pb-1 border-b-2 border-amber-muted">
      <div className="flex gap-6 font-primary text-lg tracking-wide">
        {navItems.map((item) => (
          <button
            key={item}
            onClick={() => onNavigate(item)}
            className={`transition-all ${
              active === item
                ? "text-amber-bright text-glow-base"
                : "text-amber-dim hover:text-amber-normal"
            }`}
          >
            {active === item ? `[${item}]` : item}
          </button>
        ))}
      </div>

      <a
        href="/apply"
        className="font-primary text-lg tracking-wide text-amber-dim hover:text-amber-bright hover:text-glow-base transition-all"
      >
        [register]
      </a>
    </nav>
  );
};
