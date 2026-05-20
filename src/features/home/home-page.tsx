import { useMemo } from "react";
import { useNavigate } from "react-router";
import { ChevronRight, Flame, Heart, Dumbbell as DumbbellIcon } from "lucide-react";
import { WEEKLY_OVERVIEW, GENERAL_GUIDELINES, STRENGTH_SESSIONS, type StrengthSession } from "@/lib/plan/data";
import { useStore } from "@/lib/store";
import { MultiRing } from "@/components/ui/ring";
import { Badge } from "@/components/ui/badge";
import { cn, getISOWeek } from "@/lib/utils";

const dayToSessionKey: Record<string, StrengthSession["key"] | undefined> = {
  Segunda: "lower-a",
  Terça: "upper-a",
  Quinta: "lower-b",
  Sexta: "upper-b",
};

const PT_DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

const sessionGradients: Record<StrengthSession["key"], string> = {
  "lower-a": "grad-flame",
  "upper-a": "grad-cyan",
  "lower-b": "grad-violet",
  "upper-b": "grad-lime",
};

export function HomePage() {
  const navigate = useNavigate();
  const today = PT_DAYS[new Date().getDay()];
  const dateLabel = useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }).replace(/^./, (c) => c.toUpperCase()),
    [],
  );

  const { data } = useStore();

  // Aggregate current ISO-week progress for the ring
  const week = data.weeklyLogs.find((l) => l.week === getISOWeek());
  const sessionsDone = week?.sessionsDone ?? 0;
  const cardiosDone = week?.cardiosDone ?? 0;
  const proteinAvg = week?.proteinAvg ?? 0;
  const target = data.settings.targetWeightKg ?? 95;
  const proteinTarget = Math.round(target * 2.0);

  return (
    <div className="space-y-7">
      {/* Hero — today + activity ring */}
      <header className="space-y-1 pt-1">
        <p className="micro-label text-(--color-ink-mute)">{dateLabel}</p>
        <h1 className="display text-[40px] leading-[1] text-(--color-ink)">
          Bom dia. <span className="text-(--color-ink-dim) italic font-medium">Bora?</span>
        </h1>
      </header>

      {/* Activity rings card — Apple Fitness signature */}
      <section className="relative overflow-hidden rounded-3xl grad-flame border border-(--color-line) p-5">
        <div className="flex items-center gap-5">
          <MultiRing
            size={140}
            thickness={11}
            gap={4}
            rings={[
              { value: sessionsDone / 4, color: "#ff5722" },
              { value: cardiosDone / 4, color: "#5ad6ff" },
              { value: proteinAvg / proteinTarget, color: "#b5ea3a" },
            ]}
          >
            <div className="text-center">
              <div className="stat-num text-[28px] text-(--color-ink) leading-none">
                {sessionsDone + cardiosDone}
              </div>
              <div className="micro-label text-(--color-ink-dim) mt-0.5" style={{ fontSize: "9px" }}>
                sessões
              </div>
            </div>
          </MultiRing>

          <ul className="flex-1 space-y-2.5">
            <RingLegend color="#ff5722" label="Força" value={`${sessionsDone}/4`} icon={<DumbbellIcon size={13} />} />
            <RingLegend color="#5ad6ff" label="Cardio" value={`${cardiosDone}/4`} icon={<Heart size={13} />} />
            <RingLegend color="#b5ea3a" label="Proteína" value={`${proteinAvg}/${proteinTarget}g`} icon={<Flame size={13} />} />
          </ul>
        </div>
      </section>

      {/* Today's session — big call to action */}
      {(() => {
        const todayRow = WEEKLY_OVERVIEW.find((r) => r.day === today);
        if (!todayRow) return null;
        const sessionKey = dayToSessionKey[todayRow.day];
        const isCardio = todayRow.type === "Cardio";
        const handler = sessionKey ? () => navigate(`/strength/${sessionKey}`) : isCardio ? () => navigate("/cardio") : undefined;
        if (!handler) return null;
        return (
          <button
            type="button"
            onClick={handler}
            className={cn(
              "group block w-full overflow-hidden rounded-3xl border border-(--color-line) p-5 text-left transition-transform active:scale-[0.99]",
              sessionKey ? sessionGradients[sessionKey] : "grad-cyan",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5">
                <span className="micro-label text-(--color-ink-dim)">Treino de hoje</span>
                <h2 className="display text-[32px] leading-[1.02] text-(--color-ink)">{todayRow.session}</h2>
                <p className="text-[13px] text-(--color-ink-dim) max-w-[28ch]">{todayRow.note}</p>
              </div>
              <ChevronRight className="text-(--color-ink) shrink-0 mt-1" size={28} />
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Badge variant={isCardio ? "default" : "flame"}>{todayRow.type}</Badge>
              <span className="font-display text-[12px] font-semibold text-(--color-ink-dim)">{todayRow.duration}</span>
            </div>
          </button>
        );
      })()}

      {/* Week schedule */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="display text-[20px] text-(--color-ink)">Esta semana</h2>
          <span className="micro-label text-(--color-ink-mute)">7 sessões</span>
        </div>

        <ul className="space-y-2">
          {WEEKLY_OVERVIEW.map((row) => {
            const isToday = row.day === today;
            const strengthKey = dayToSessionKey[row.day];
            const isCardio = row.type === "Cardio";
            const handler = strengthKey ? () => navigate(`/strength/${strengthKey}`) : isCardio ? () => navigate("/cardio") : undefined;
            const Tag = handler ? "button" : "div";
            return (
              <li key={row.day}>
                <Tag
                  type={handler ? "button" : undefined}
                  onClick={handler}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all active:scale-[0.99]",
                    isToday
                      ? "bg-(--color-panel) border-(--color-flame)"
                      : "bg-(--color-panel) border-(--color-line) hover:border-(--color-line-strong)",
                  )}
                >
                  {/* Day pill */}
                  <div
                    className={cn(
                      "shrink-0 grid place-items-center h-12 w-12 rounded-xl",
                      isToday ? "bg-(--color-flame) text-(--color-ink)" : "bg-(--color-panel-2) text-(--color-ink-dim)",
                    )}
                  >
                    <span className="stat-num text-[16px] leading-none">{row.day.slice(0, 3).toUpperCase()}</span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-display text-[14px] font-semibold",
                          isToday ? "text-(--color-flame)" : "text-(--color-ink)",
                        )}
                      >
                        {row.type === "Força" ? <DumbbellIcon size={13} className="inline -mt-0.5" /> : <Heart size={13} className="inline -mt-0.5" />}{" "}
                        {row.type}
                      </span>
                      {isToday && <Badge variant="flame">HOJE</Badge>}
                    </div>
                    <p className="truncate text-[13px] text-(--color-ink-dim)">{row.session}</p>
                  </div>

                  <div className="text-right">
                    <div className="font-display text-[12px] font-semibold text-(--color-ink-dim)">{row.duration}</div>
                    {handler && <ChevronRight size={16} className="ml-auto mt-0.5 text-(--color-ink-mute)" />}
                  </div>
                </Tag>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Quick shortcuts to strength sessions */}
      <section className="space-y-3">
        <h2 className="display text-[20px] text-(--color-ink) px-1">Sessões de força</h2>
        <div className="grid grid-cols-2 gap-2">
          {STRENGTH_SESSIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => navigate(`/strength/${s.key}`)}
              className={cn(
                "group rounded-2xl border border-(--color-line) p-4 text-left transition-transform active:scale-[0.98]",
                sessionGradients[s.key],
              )}
            >
              <div className="micro-label text-(--color-ink-dim)">{s.day}</div>
              <div className="mt-1 display text-[22px] leading-[1] text-(--color-ink)">{s.title}</div>
              <div className="mt-2 text-[12px] text-(--color-ink-dim)">{s.focus}</div>
            </button>
          ))}
        </div>
      </section>

      {/* Coach tips */}
      <section className="space-y-3">
        <h2 className="display text-[20px] text-(--color-ink) px-1">Lembretes</h2>
        <ul className="space-y-2">
          {GENERAL_GUIDELINES.slice(0, 5).map((g, i) => (
            <li
              key={g}
              className="rounded-2xl border border-(--color-line) bg-(--color-panel) px-4 py-3 text-[13px] leading-snug text-(--color-ink-dim)"
            >
              <span className="stat-num text-(--color-ink-mute) text-[14px] mr-2">{String(i + 1).padStart(2, "0")}</span>
              {g}
            </li>
          ))}
        </ul>
      </section>

    </div>
  );
}

function RingLegend({ color, label, value, icon }: { color: string; label: string; value: string; icon: React.ReactNode }) {
  return (
    <li className="flex items-center gap-2.5">
      <span
        className="grid place-items-center h-6 w-6 rounded-full shrink-0"
        style={{ backgroundColor: `${color}24`, color }}
      >
        {icon}
      </span>
      <div className="flex-1 flex items-baseline justify-between gap-2">
        <span className="font-display text-[13px] font-semibold text-(--color-ink)">{label}</span>
        <span className="stat-num text-[15px] text-(--color-ink)">{value}</span>
      </div>
    </li>
  );
}
