import { useStore } from "@/lib/store";
import type { DailyLog } from "@/lib/storage/types";

const TODAY = new Date().toISOString().slice(0, 10);

const DATE_LABEL = new Date().toLocaleDateString("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
}).replace(/^./, (c) => c.toUpperCase());

function emptyLog(): DailyLog {
  return {
    date: TODAY,
    hydrationMl: 0,
    creatineDone: false,
    proteinOnTarget: false,
    sleepOk: false,
  };
}

export function DailyCard() {
  const { data, getDailyLog, upsertDailyLog } = useStore();

  const log = getDailyLog(TODAY) ?? emptyLog();
  const hydrationTarget = data.settings.hydrationTargetMl ?? 2500;
  const progress = Math.min(log.hydrationMl / hydrationTarget, 1);
  const atTarget = log.hydrationMl >= hydrationTarget;

  const addWater = () => {
    if (atTarget) return;
    upsertDailyLog({ ...log, hydrationMl: log.hydrationMl + 200 });
  };

  const toggle = (field: "creatineDone" | "proteinOnTarget" | "sleepOk") => {
    upsertDailyLog({ ...log, [field]: !log[field] });
  };

  const hydrationL = (log.hydrationMl / 1000).toFixed(1);
  const targetL = (hydrationTarget / 1000).toFixed(1);

  return (
    <div className="rounded-2xl border border-(--color-line) bg-(--color-panel) p-4 space-y-4">
      <div className="flex items-baseline justify-between">
        <span className="micro-label text-(--color-ink-mute)">HOJE</span>
        <span className="font-display text-[12px] text-(--color-ink-mute)">{DATE_LABEL}</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-[16px]">💧</span>
          <span className="font-display text-[13px] font-semibold text-(--color-ink)">Hidratação</span>
          <span className="ml-auto font-display text-[13px] text-(--color-ink-dim)">
            {hydrationL}L / {targetL}L
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-(--color-panel-2) overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${progress * 100}%`,
              backgroundColor: atTarget ? "var(--color-lime)" : "var(--color-cyan)",
            }}
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={addWater}
            disabled={atTarget}
            className="rounded-xl bg-(--color-panel-2) px-3 py-1.5 font-display text-[12px] font-semibold text-(--color-cyan) transition-opacity disabled:opacity-30 active:opacity-70"
          >
            +200ml
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <ToggleChip
          label="Creatina"
          active={log.creatineDone}
          onToggle={() => toggle("creatineDone")}
        />
        <ToggleChip
          label="Proteína"
          active={log.proteinOnTarget}
          onToggle={() => toggle("proteinOnTarget")}
        />
        <ToggleChip
          label="Sono"
          active={log.sleepOk}
          onToggle={() => toggle("sleepOk")}
        />
      </div>
    </div>
  );
}

function ToggleChip({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 font-display text-[12px] font-semibold transition-colors ${
        active
          ? "bg-(--color-lime)/15 text-(--color-lime)"
          : "bg-(--color-panel-2) text-(--color-ink-mute)"
      }`}
    >
      {active && <span>✓</span>}
      {label}
    </button>
  );
}
