import { useMemo } from "react";
import { Flame } from "lucide-react";
import { MOUNJARO_POINTS } from "@/lib/plan/data";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ring } from "@/components/ui/ring";

function parseNum(v: string): number | null {
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function NutritionPage() {
  const { data, updateSettings } = useStore();
  const { currentWeightKg, targetWeightKg } = data.settings;

  const { proteinMin, proteinIdeal, proteinMax } = useMemo(() => {
    const t = targetWeightKg ?? null;
    return {
      proteinMin: t !== null ? Math.round(t * 1.6) : null,
      proteinIdeal: t !== null ? Math.round(t * 2.0) : null,
      proteinMax: t !== null ? Math.round(t * 2.2) : null,
    };
  }, [targetWeightKg]);

  // Ring shows protein-ideal as a fraction of an "anchored" 250g cap
  const ringValue = proteinIdeal !== null ? Math.min(1, proteinIdeal / 250) : 0;

  return (
    <div className="space-y-6">
      {/* Hero ring — protein target */}
      <section className="relative overflow-hidden rounded-3xl grad-lime border border-(--color-line) p-5">
        <div className="flex items-center gap-5">
          <Ring size={140} thickness={11} value={ringValue} color="var(--color-lime)">
            <div className="text-center">
              <div className="stat-num text-[36px] leading-none text-(--color-ink)">{proteinIdeal ?? "—"}</div>
              <div className="micro-label text-(--color-ink-dim) mt-0.5" style={{ fontSize: "9px" }}>
                g/dia
              </div>
            </div>
          </Ring>

          <div className="flex-1 space-y-2">
            <span className="micro-label text-(--color-ink-dim)">Proteína ideal</span>
            <h1 className="display text-[24px] leading-[1.05] text-(--color-ink)">
              2.0×<span className="text-(--color-ink-dim)"> peso-alvo</span>
            </h1>
            <p className="text-[12px] text-(--color-ink-dim) leading-snug">
              Calculado sobre o peso-alvo, não o atual.
            </p>
          </div>
        </div>
      </section>

      {/* Inputs + min/ideal/max */}
      <Card>
        <CardHeader>
          <CardTitle>Sua composição</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="weight-now">Peso atual · kg</Label>
              <Input
                id="weight-now"
                type="number"
                inputMode="decimal"
                step={0.1}
                value={currentWeightKg ?? ""}
                onChange={(e) => updateSettings({ currentWeightKg: parseNum(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="weight-target">Peso-alvo · kg</Label>
              <Input
                id="weight-target"
                type="number"
                inputMode="decimal"
                step={0.1}
                value={targetWeightKg ?? ""}
                onChange={(e) => updateSettings({ targetWeightKg: parseNum(e.target.value) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-(--color-line) bg-(--color-bg-2) p-3">
            <ProteinSlot label="mínimo" mul="1.6×" value={proteinMin} />
            <ProteinSlot label="ideal" mul="2.0×" value={proteinIdeal} accent />
            <ProteinSlot label="máximo" mul="2.2×" value={proteinMax} />
          </div>
        </CardContent>
      </Card>

      {/* Mounjaro alerts */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <h2 className="display text-[20px] text-(--color-ink)">Atenção · GLP-1</h2>
          <Flame size={16} className="text-(--color-flame)" />
        </div>

        <ul className="space-y-2">
          {MOUNJARO_POINTS.map((p, idx) => (
            <li
              key={p.topic}
              className="rounded-2xl border border-(--color-line) bg-(--color-panel) overflow-hidden"
            >
              <div className="flex gap-3 px-4 py-3">
                <div className="grid place-items-center h-9 w-9 shrink-0 rounded-lg bg-(--color-flame)/15 text-(--color-flame)">
                  <span className="stat-num text-[14px] leading-none">{String(idx + 1).padStart(2, "0")}</span>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="font-display text-[15px] font-semibold text-(--color-ink) leading-tight">{p.topic}</h3>
                  <p className="text-[12.5px] leading-snug text-(--color-ink-dim)">{p.recommendation}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ProteinSlot({ label, mul, value, accent }: { label: string; mul: string; value: number | null; accent?: boolean }) {
  return (
    <div className={`text-center rounded-xl p-2 ${accent ? "bg-(--color-lime)/10 border border-(--color-lime)/30" : ""}`}>
      <div className="micro-label text-(--color-ink-mute)" style={{ fontSize: "9px" }}>
        {label}
      </div>
      <div className="flex items-baseline justify-center gap-0.5">
        <span
          className="stat-num text-[24px] leading-none"
          style={{ color: accent ? "var(--color-lime)" : "var(--color-ink)" }}
        >
          {value ?? "—"}
        </span>
        <span className="font-display text-[10px] text-(--color-ink-mute)">g</span>
      </div>
      <div className="font-display text-[10px] font-semibold text-(--color-ink-mute) mt-0.5">{mul}</div>
    </div>
  );
}
