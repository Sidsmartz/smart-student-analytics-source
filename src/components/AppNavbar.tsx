import { Link, useLocation } from "react-router-dom";
import { Upload, BarChart3, Lightbulb, GraduationCap } from "lucide-react";

const navItems = [
  { to: "/", label: "Upload", icon: Upload },
  { to: "/analysis", label: "Analysis", icon: BarChart3 },
  { to: "/recommendations", label: "Recommendations", icon: Lightbulb },
];

const AppNavbar = () => {
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary">
          <GraduationCap className="h-6 w-6" />
          <span>Smart Student Analytics</span>
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default AppNavbar;
