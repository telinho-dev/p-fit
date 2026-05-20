import { useStore } from "@/lib/store";
import type { WeeklyLog } from "@/lib/storage/types";
import { Textarea } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProgressCard } from "./progress-card";
import { cn } from "@/lib/utils";
import { getISOWeek } from "@/lib/utils";

function parseNum(v: string): number | null {
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

const tips = [
  "Peso: 1× por semana, mesmo dia, mesma hora (domingo, jejum).",
  "Cintura: na altura do umbigo, sem segurar a respiração.",
  "Proteína: 1.6-2.2g/kg de peso-alvo. MyFitnessPal mede.",
  "Sono: 7-8h. Sono ruim sabota recuperação.",
];

// Show last 12 ISO weeks ending at the current week
function getRecentWeeks(): number[] {
  const current = getISOWeek();
  return Array.from({ length: 12 }, (_, i) => current - 11 + i);
}

export function WeeklyPage() {
  const weeks = getRecentWeeks();

  return (
    <div className="space-y-6">
      <header className="space-y-1 pt-1 px-1">
        <p className="micro-label text-(--color-ink-mute)">Últimas 12 semanas</p>
        <h1 className="display text-[36px] leading-[1] text-(--color-ink)">Histórico</h1>
      </header>

      <ProgressCard weeks={weeks} />

      <section className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="display text-[20px] text-(--color-ink)">Registro</h2>
          <span className="micro-label text-(--color-ink-mute)">semanas do ano</span>
        </div>

        <ul className="space-y-3">
          {[...weeks].reverse().map((week) => (
            <WeekRow key={week} week={week} />
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="display text-[18px] text-(--color-ink) px-1">Como usar</h2>
        <ul className="space-y-2">
          {tips.map((t) => (
            <li key={t} className="rounded-2xl border border-(--color-line) bg-(--color-panel) px-4 py-3 text-[12.5px] leading-snug text-(--color-ink-dim)">
              {t}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function WeekRow({ week }: { week: number }) {
  const { getWeeklyLog, upsertWeeklyLog } = useStore();
  const log = getWeeklyLog(week);
  const isCurrent = week === getISOWeek();
  const hasData =
    log && (log.weightKg !== null || log.waistCm !== null || log.sessionsDone !== null || log.cardiosDone !== null || log.proteinAvg !== null || log.sleepAvg !== null);

  const update = (patch: Partial<WeeklyLog>) => {
    const base: WeeklyLog = log ?? {
      week,
      weightKg: null,
      waistCm: null,
      sessionsDone: null,
      cardiosDone: null,
      proteinAvg: null,
      sleepAvg: null,
      notes: "",
    };
    upsertWeeklyLog({ ...base, ...patch, week });
  };

  return (
    <li className={cn("rounded-2xl border bg-(--color-panel) overflow-hidden", isCurrent ? "border-(--color-flame)" : "border-(--color-line)")}>
      <header className="flex items-center gap-3 px-5 pt-4 pb-3">
        <div
          className={cn(
            "grid place-items-center h-12 w-12 rounded-xl shrink-0",
            hasData ? "bg-(--color-lime)/15 text-(--color-lime)" : isCurrent ? "bg-(--color-flame)/15 text-(--color-flame)" : "bg-(--color-panel-2) text-(--color-ink-dim)",
          )}
        >
          <span className="stat-num text-[15px] leading-none">W{String(week).padStart(2, "0")}</span>
        </div>
        <div className="flex-1">
          <h3 className="font-display text-[16px] font-semibold text-(--color-ink)">Semana {week}</h3>
          <p className="font-display text-[11px] text-(--color-ink-mute)">
            {isCurrent ? "semana atual" : `semana ${week} do ano`}
          </p>
        </div>
        {isCurrent && (
          <span className="micro-label rounded-full px-2 py-0.5 bg-(--color-flame)/15 text-(--color-flame)" style={{ fontSize: "9px" }}>
            AGORA
          </span>
        )}
      </header>

      <div className="grid grid-cols-3 gap-2 border-t border-(--color-line) bg-(--color-bg-2) p-3">
        <SubField label="Peso · kg" id={`w-weight-${week}`} value={log?.weightKg} onChange={(v) => update({ weightKg: v })} step={0.1} placeholder="—" />
        <SubField label="Cintura · cm" id={`w-waist-${week}`} value={log?.waistCm} onChange={(v) => update({ waistCm: v })} step={0.5} placeholder="—" />
        <SubField label="Treinos" id={`w-tr-${week}`} value={log?.sessionsDone} onChange={(v) => update({ sessionsDone: v })} step={1} min={0} max={4} placeholder="—" />
        <SubField label="Cardios" id={`w-ca-${week}`} value={log?.cardiosDone} onChange={(v) => update({ cardiosDone: v })} step={1} min={0} max={5} placeholder="—" />
        <SubField label="Proteína g" id={`w-pr-${week}`} value={log?.proteinAvg} onChange={(v) => update({ proteinAvg: v })} step={1} placeholder="—" />
        <SubField label="Sono h" id={`w-sl-${week}`} value={log?.sleepAvg} onChange={(v) => update({ sleepAvg: v })} step={0.1} placeholder="—" />
      </div>

      <div className="border-t border-(--color-line) px-5 py-3 space-y-1.5">
        <Label htmlFor={`w-notes-${week}`}>Notas</Label>
        <Textarea
          id={`w-notes-${week}`}
          placeholder="como se sentiu, fome, energia, efeitos do Mounjaro…"
          value={log?.notes ?? ""}
          onChange={(e) => update({ notes: e.target.value })}
        />
      </div>
    </li>
  );
}

function SubField({
  label,
  id,
  value,
  onChange,
  step,
  min,
  max,
  placeholder,
}: {
  label: string;
  id: string;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  step?: number;
  min?: number;
  max?: number;
  placeholder?: string;
}) {
  return (
    <div className="rounded-xl bg-(--color-panel) border border-(--color-line) p-2.5">
      <div className="micro-label text-(--color-ink-mute)" style={{ fontSize: "9px" }}>
        {label}
      </div>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        value={value ?? ""}
        onChange={(e) => onChange(parseNum(e.target.value))}
        className="mt-0.5 w-full bg-transparent border-none outline-none p-0 stat-num text-[18px] text-(--color-ink) placeholder:text-(--color-ink-mute)"
      />
    </div>
  );
}
