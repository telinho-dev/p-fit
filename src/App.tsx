import { NavLink, Outlet } from "react-router";
import { Activity, Dumbbell, Home, Salad, ClipboardList, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { isSupabaseConfigured } from "@/lib/supabase";

const TABS = [
  { to: "/", label: "Hoje", Icon: Home, end: true },
  { to: "/strength", label: "Força", Icon: Dumbbell, end: false },
  { to: "/cardio", label: "Cardio", Icon: Activity, end: false },
  { to: "/weekly", label: "Semanas", Icon: ClipboardList, end: false },
  { to: "/nutrition", label: "Nutri", Icon: Salad, end: false },
  { to: "/settings", label: "Perfil", Icon: UserRound, end: false },
] as const;

export function Shell() {
  const { ready, adapterKind } = useStore();

  return (
    <div className="mx-auto flex min-h-dvh max-w-2xl flex-col bg-(--color-bg)">
      {/* Status pill — top right floating */}
      <div className="pointer-events-none fixed top-3 right-3 z-30 sm:right-auto sm:left-1/2 sm:-translate-x-1/2">
        <div className="glass pointer-events-auto rounded-full px-3 py-1 flex items-center gap-2">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              !ready
                ? "bg-(--color-warn) animate-pulse"
                : isSupabaseConfigured
                  ? "bg-(--color-lime)"
                  : "bg-(--color-ink-mute)",
            )}
          />
          <span className="micro-label text-(--color-ink-dim)" style={{ fontSize: "9.5px" }}>
            {!ready ? "sync" : isSupabaseConfigured ? "remote" : "local"}
          </span>
          <span className="sr-only">adapter {adapterKind}</span>
        </div>
      </div>

      <main className="flex-1 px-4 pt-5 pb-32">
        <Outlet />
      </main>

      {/* Floating bottom nav */}
      <nav aria-label="Seções" className="safe-bottom fixed inset-x-0 bottom-3 z-20 px-3">
        <div className="mx-auto max-w-2xl">
          <div className="glass rounded-full px-2 py-1.5">
            <div className="grid grid-cols-6">
              {TABS.map(({ to, label, Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  aria-label={label}
                  className={({ isActive }) =>
                    cn(
                      "relative flex flex-col items-center gap-0.5 rounded-full py-1.5 transition-colors",
                      isActive ? "text-(--color-flame)" : "text-(--color-ink-mute) hover:text-(--color-ink-dim)",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={21}
                        strokeWidth={isActive ? 2.4 : 1.8}
                        fill={isActive ? "currentColor" : "none"}
                        fillOpacity={isActive ? 0.18 : 0}
                      />
                      <span className="font-display text-[9px] font-semibold tracking-tight">{label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}
