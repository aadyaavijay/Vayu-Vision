import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Activity,
  Pill,
  Gauge,
  CalendarDays,
  Radar,
  FlaskConical,
  BarChart3,
  User,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/routes/index";
import { cn } from "@/lib/utils";

/**
 * Persistent sidebar shell used by every authenticated route.
 * Collapses into a slide-over menu on mobile.
 */

const NAV: Array<{ to: string; label: string; icon: typeof Activity }> = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/symptoms", label: "Symptoms", icon: Activity },
  { to: "/medications", label: "Medications", icon: Pill },
  { to: "/peak-flow", label: "Peak flow", icon: Gauge },
  { to: "/air-memory", label: "Air Memory", icon: CalendarDays },
  { to: "/vayuprint", label: "VayuPrint", icon: Radar },
  { to: "/what-if", label: "What-if Lab", icon: FlaskConical },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <div className="flex min-h-dvh bg-background">
      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card/40 lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-border bg-card animate-in slide-in-from-left">
            <div className="flex items-center justify-between px-4 pt-4">
              <span className="sr-only">Menu</span>
              <button
                aria-label="Close menu"
                className="ml-auto rounded-md p-2 text-muted-foreground hover:bg-secondary"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-xl lg:px-8">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              className="rounded-md p-2 text-muted-foreground hover:bg-secondary lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden">
              <Link to="/dashboard" className="flex items-center gap-2">
                <BrandMark className="h-7 w-7" />
                <span className="text-sm font-semibold">Vayu Vision</span>
              </Link>
            </div>
          </div>
          <TopBarActions />
        </header>
        <main className="min-w-0 flex-1 px-4 pb-16 pt-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

function SidebarContent() {
  const location = useLocation();
  return (
    <>
      <div className="flex items-center gap-2.5 px-5 py-5">
        <BrandMark className="h-8 w-8" />
        <div>
          <div className="text-sm font-semibold leading-none">Vayu Vision</div>
          <div className="mt-0.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            Respiratory OS
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map((item) => {
          const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border px-3 py-3">
        {[
          { to: "/profile", label: "Profile", icon: User },
          { to: "/settings", label: "Settings", icon: SettingsIcon },
        ].map((item) => {
          const Icon = item.icon;
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary/15 text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </>
  );
}

function TopBarActions() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" className="gap-1.5" onClick={signOut}>
        <LogOut className="h-4 w-4" />
        <span className="hidden sm:inline">Sign out</span>
      </Button>
    </div>
  );
}
