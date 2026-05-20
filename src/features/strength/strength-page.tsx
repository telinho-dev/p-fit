import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Menu, Timer } from "lucide-react";
import { STRENGTH_SESSIONS, type StrengthSession, type Exercise } from "@/lib/plan/data";
import { useStore } from "@/lib/store";
import { Input, Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Drawer } from "@/components/ui/drawer";
import { cn, getISOWeek } from "@/lib/utils";

const sessionGradients: Record<StrengthSession["key"], string> = {
  "lower-a": "grad-flame",
  "upper-a": "grad-cyan",
  "lower-b": "grad-violet",
  "upper-b": "grad-lime",
};

const sessionAccents: Record<StrengthSession["key"], string> = {
  "lower-a": "var(--color-flame)",
  "upper-a": "var(--color-cyan)",
  "lower-b": "#a86eff",
  "upper-b": "var(--color-lime)",
};

export function StrengthPage() {
  const { sessionKey } = useParams<{ sessionKey?: string }>();
  const navigate = useNavigate();
  const [week, setWeek] = useState(() => getISOWeek());
  const [drawerOpen, setDrawerOpen] = useState(false);

  const session = useMemo(
    () => STRENGTH_SESSIONS.find((s) => s.key === sessionKey) ?? STRENGTH_SESSIONS[0],
    [sessionKey],
  );
  const { data } = useStore();

  const loggedCount = useMemo(() => {
    const ex = new Set(session.exercises.map((e) => e.key));
    const logged = new Set(
      data.exerciseLogs
        .filter(
          (l) =>
            l.sessionKey === session.key &&
            l.week === week &&
            ex.has(l.exerciseKey) &&
            l.setNumber >= 1 &&
            (l.load || l.reps),
        )
        .map((l) => l.exerciseKey),
    );
    return logged.size;
  }, [data.exerciseLogs, session, week]);

  return (
    <>
      {/* Session drawer */}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Sessão">
        {STRENGTH_SESSIONS.map((s) => {
          const active = s.key === sessionKey;
          return (
            <button
              key={s.key}
              onClick={() => {
                navigate(`/strength/${s.key}`);
                setDrawerOpen(false);
              }}
              className={cn(
                "w-full text-left rounded-2xl border p-4 flex items-center gap-3 transition-colors",
                active
                  ? "border-(--color-lime)/30 bg-(--color-lime)/8"
                  : "border-(--color-line) bg-(--color-panel-2) active:bg-(--color-panel-3)",
              )}
            >
              <div
                className="w-1 self-stretch rounded-full shrink-0"
                style={{ background: sessionAccents[s.key] }}
              />
              <div className="flex-1 min-w-0">
                <div className="micro-label text-(--color-ink-mute)" style={{ fontSize: "9px" }}>
                  {s.day}
                </div>
                <div className="font-display font-bold text-[18px] text-(--color-ink) leading-tight mt-0.5">
                  {s.title}
                </div>
                <div className="font-display text-[12px] text-(--color-ink-mute) mt-0.5">{s.focus}</div>
              </div>
              {active && <Check size={16} className="text-(--color-lime) shrink-0" />}
            </button>
          );
        })}
      </Drawer>

      <div className="space-y-5">
        {/* Sticky top bar — session picker + week nav */}
        <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between px-4 py-3 bg-(--color-bg)/90 backdrop-blur-sm border-b border-(--color-line)">
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center gap-2 rounded-xl py-1 text-(--color-ink) active:opacity-70 transition-opacity"
            aria-label="Selecionar sessão"
          >
            <Menu size={19} className="text-(--color-ink-mute)" />
            <span className="font-display font-bold text-[17px]">{session.title}</span>
            <ChevronDown size={13} className="text-(--color-ink-mute)" />
          </button>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setWeek((w) => Math.max(1, w - 1))}
              aria-label="Semana anterior"
              className="grid place-items-center h-8 w-8 rounded-lg text-(--color-ink-dim) hover:bg-(--color-panel-2) hover:text-(--color-ink) transition-colors"
            >
              <ChevronLeft size={17} />
            </button>
            <span className="stat-num text-[14px] w-10 text-center text-(--color-ink)">
              W{String(week).padStart(2, "0")}
            </span>
            <button
              onClick={() => setWeek((w) => Math.min(53, w + 1))}
              aria-label="Próxima semana"
              className="grid place-items-center h-8 w-8 rounded-lg text-(--color-ink-dim) hover:bg-(--color-panel-2) hover:text-(--color-ink) transition-colors"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>

        {/* Hero — session opener */}
        <section
          className={cn(
            "relative overflow-hidden rounded-3xl border border-(--color-line) p-5",
            sessionGradients[session.key],
          )}
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="micro-label text-(--color-ink-dim)">{session.day}</span>
              <span className="text-(--color-ink-mute)">·</span>
              <span className="micro-label text-(--color-ink-mute)">W{String(week).padStart(2, "0")}</span>
            </div>
            <h1 className="display text-[40px] leading-[1] text-(--color-ink)">{session.title}</h1>
            <p className="text-[14px] text-(--color-ink-dim) max-w-[36ch] leading-snug pt-1">{session.headline}</p>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            <HeroStat label="Exercícios" value={session.exercises.length} />
            <HeroStat label="Logados" value={loggedCount} color="var(--color-lime)" />
            <HeroStat label="Duração" value={session.duration.replace("~", "")} unit="min" />
          </div>
        </section>

        {/* Exercise list */}
        <div className="space-y-2">
          {session.exercises.map((ex, idx) => (
            <ExerciseCard key={ex.key} sessionKey={session.key} exercise={ex} week={week} index={idx + 1} />
          ))}
        </div>

        {/* Footer note */}
        <div className="rounded-2xl border border-dashed border-(--color-line) bg-(--color-panel)/60 px-4 py-4 space-y-2">
          <div className="micro-label text-(--color-ink-mute)">Lembretes</div>
          <ul className="space-y-1 text-[12.5px] leading-snug text-(--color-ink-dim)">
            <li>• RIR 1-2: pare 1-2 reps antes da falha.</li>
            <li>• Bilateral: peso total da barra. Halteres: peso de um halter.</li>
            <li>• Bateu reps com RIR 1-2? Sobe carga na próxima semana.</li>
          </ul>
        </div>
      </div>
    </>
  );
}

function HeroStat({ label, value, unit, color }: { label: string; value: number | string; unit?: string; color?: string }) {
  return (
    <div>
      <div className="micro-label text-(--color-ink-mute)" style={{ fontSize: "9px" }}>
        {label}
      </div>
      <div className="flex items-baseline gap-1">
        <span className="stat-num text-[26px] leading-none" style={{ color: color ?? "var(--color-ink)" }}>
          {value}
        </span>
        {unit && <span className="font-display text-[11px] font-semibold text-(--color-ink-mute)">{unit}</span>}
      </div>
    </div>
  );
}

function ExerciseCard({
  sessionKey,
  exercise,
  week,
  index,
}: {
  sessionKey: string;
  exercise: Exercise;
  week: number;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const { getExerciseLogs, upsertExerciseLog } = useStore();
  const allLogs = getExerciseLogs(sessionKey, exercise.key, week);
  const notesRecord = allLogs.find((l) => l.setNumber === 0);
  const setLogs = allLogs.filter((l) => l.setNumber >= 1);
  const isLogged = setLogs.some((l) => l.load || l.reps);

  const updateSet = (setNum: number, patch: Partial<{ load: string; reps: string }>) => {
    const existing = setLogs.find((l) => l.setNumber === setNum);
    upsertExerciseLog({
      sessionKey,
      exerciseKey: exercise.key,
      week,
      setNumber: setNum,
      load: existing?.load ?? "",
      reps: existing?.reps ?? "",
      notes: "",
      ...patch,
    });
  };

  const updateNotes = (notes: string) => {
    upsertExerciseLog({
      sessionKey,
      exerciseKey: exercise.key,
      week,
      setNumber: 0,
      load: "",
      reps: "",
      notes,
    });
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-(--color-line) bg-(--color-panel)">
      {/* Accordion header — always visible, clickable */}
      <header
        className="flex items-center gap-3 px-4 py-3.5 cursor-pointer select-none active:bg-(--color-panel-2) transition-colors"
        onClick={() => setOpen((o) => !o)}
        role="button"
        aria-expanded={open}
      >
        <div
          className={cn(
            "grid place-items-center h-9 w-9 shrink-0 rounded-xl transition-colors",
            isLogged ? "bg-(--color-lime) text-(--color-bg)" : "bg-(--color-panel-2) text-(--color-ink-dim)",
          )}
        >
          {isLogged ? (
            <Check size={16} strokeWidth={3} />
          ) : (
            <span className="stat-num text-[13px]">{String(index).padStart(2, "0")}</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <h3 className="font-display text-[15px] font-semibold leading-tight text-(--color-ink)">
              {exercise.name}
            </h3>
            {exercise.isCore && <Badge variant="warn">core</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <ChipStat value={exercise.sets} unit="séries" />
            <ChipStat value={exercise.reps} unit="reps" />
            <ChipStat value={exercise.rest} unit="" icon={<Timer size={10} />} />
          </div>
        </div>

        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-(--color-ink-mute) transition-transform duration-250",
            open && "rotate-180",
          )}
        />
      </header>

      {/* Accordion body — animated */}
      <div
        style={{
          display: "grid",
          gridTemplateRows: open ? "1fr" : "0fr",
          transition: "grid-template-rows 250ms ease-out",
        }}
      >
        <div className="overflow-hidden">
          <p className="px-4 pb-3 text-[12.5px] leading-snug text-(--color-ink-dim) border-t border-(--color-line) pt-3">
            {exercise.notes}
          </p>

          <div className="border-t border-(--color-line) bg-(--color-bg-2) px-4 py-4 space-y-2.5">
            {/* Column headers */}
            <div className="grid gap-2 items-center" style={{ gridTemplateColumns: "2.25rem 1fr 1fr" }}>
              <div />
              <div className="micro-label text-(--color-ink-mute)" style={{ fontSize: "9px" }}>
                CARGA · KG
              </div>
              <div className="micro-label text-(--color-ink-mute)" style={{ fontSize: "9px" }}>
                REPS FEITAS
              </div>
            </div>

            {/* One row per set */}
            {Array.from({ length: exercise.sets }, (_, i) => i + 1).map((setNum) => {
              const setLog = setLogs.find((l) => l.setNumber === setNum);
              const setDone = Boolean(setLog?.load || setLog?.reps);
              return (
                <div
                  key={setNum}
                  className="grid gap-2 items-center"
                  style={{ gridTemplateColumns: "2.25rem 1fr 1fr" }}
                >
                  <div
                    className={cn(
                      "grid place-items-center h-9 w-9 rounded-lg stat-num text-[14px] leading-none transition-colors",
                      setDone
                        ? "bg-(--color-lime)/15 text-(--color-lime)"
                        : "bg-(--color-panel-3) text-(--color-ink-mute)",
                    )}
                  >
                    {setNum}
                  </div>
                  <Input
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={setLog?.load ?? ""}
                    onChange={(e) => updateSet(setNum, { load: e.target.value })}
                    className="stat-num text-[18px] !py-2.5 !px-3"
                  />
                  <Input
                    type="text"
                    placeholder={exercise.reps}
                    value={setLog?.reps ?? ""}
                    onChange={(e) => updateSet(setNum, { reps: e.target.value })}
                    className="stat-num text-[18px] !py-2.5 !px-3"
                  />
                </div>
              );
            })}

            <div className="space-y-1.5 pt-1">
              <Label htmlFor={`notes-${exercise.key}-${week}`}>Notas</Label>
              <Textarea
                id={`notes-${exercise.key}-${week}`}
                placeholder="RIR, como se sentiu, drop set…"
                value={notesRecord?.notes ?? ""}
                onChange={(e) => updateNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function ChipStat({ value, unit, icon }: { value: string | number; unit: string; icon?: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-(--color-panel-2) border border-(--color-line) px-2 py-0.5">
      {icon && <span className="text-(--color-ink-mute)">{icon}</span>}
      <span className="font-display text-[11px] font-semibold text-(--color-ink)">{value}</span>
      {unit && <span className="font-display text-[10px] text-(--color-ink-mute)">{unit}</span>}
    </span>
  );
}
