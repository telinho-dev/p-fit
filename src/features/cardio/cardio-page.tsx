import { useMemo } from "react";
import { Heart } from "lucide-react";
import { CARDIO_SESSIONS, CARDIO_TIPS } from "@/lib/plan/data";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ring } from "@/components/ui/ring";

function clampPositive(n: number | null): number | null {
  if (n === null || Number.isNaN(n) || n <= 0) return null;
  return n;
}

function parseNum(v: string): number | null {
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function CardioPage() {
  const { data, updateSettings } = useStore();
  const { fcMax, fcRest } = data.settings;

  const zone = useMemo(() => {
    const max = clampPositive(fcMax);
    const rest = clampPositive(fcRest);
    if (max === null || rest === null || max <= rest) return null;
    const reserve = max - rest;
    return {
      reserve,
      lower: Math.round(rest + reserve * 0.6),
      upper: Math.round(rest + reserve * 0.7),
    };
  }, [fcMax, fcRest]);

  const zoneLabel = zone ? `${zone.lower}–${zone.upper}` : "—";
  const midZone = zone ? Math.round((zone.lower + zone.upper) / 2) : null;

  // Ring shows midZone normalized over fcMax
  const ringValue = zone && fcMax ? (midZone! / fcMax) * 1.0 : 0.65;

  return (
    <div className="space-y-6">
      {/* Hero — Karvonen with ring */}
      <section className="relative overflow-hidden rounded-3xl grad-cyan border border-(--color-line) p-5">
        <div className="flex items-center gap-5">
          <Ring size={140} thickness={11} value={ringValue} color="var(--color-cyan)">
            <div className="text-center">
              <div className="stat-num text-[34px] leading-none text-(--color-ink)">{midZone ?? "—"}</div>
              <div className="micro-label text-(--color-ink-dim) mt-0.5" style={{ fontSize: "9px" }}>
                bpm alvo
              </div>
            </div>
          </Ring>

          <div className="flex-1 space-y-2">
            <span className="micro-label text-(--color-ink-dim)">Zona 2</span>
            <h1 className="display text-[26px] leading-[1] text-(--color-ink)">
              {zoneLabel}
              <span className="ml-1 text-[14px] text-(--color-ink-dim)">bpm</span>
            </h1>
            <p className="text-[12px] text-(--color-ink-dim) leading-snug">
              60-70% da reserva (Karvonen)
            </p>
          </div>
        </div>
      </section>

      {/* Karvonen inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Sua frequência</CardTitle>
        </CardHeader>
        <CardContent className="pt-2 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="fc-max">FCmáx</Label>
              <Input
                id="fc-max"
                type="number"
                inputMode="numeric"
                min={120}
                max={220}
                value={fcMax ?? ""}
                onChange={(e) => updateSettings({ fcMax: parseNum(e.target.value) })}
                placeholder="220 - idade"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="fc-rest">FCrep</Label>
              <Input
                id="fc-rest"
                type="number"
                inputMode="numeric"
                min={30}
                max={120}
                value={fcRest ?? ""}
                onChange={(e) => updateSettings({ fcRest: parseNum(e.target.value) })}
                placeholder="do Garmin"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-(--color-bg-2) border border-(--color-line) p-3">
            <ZoneStat label="Reserva" value={zone?.reserve} unit="bpm" />
            <ZoneStat label="Z2 mín" value={zone?.lower} unit="bpm" color="var(--color-cyan)" />
            <ZoneStat label="Z2 máx" value={zone?.upper} unit="bpm" color="var(--color-cyan)" />
          </div>
        </CardContent>
      </Card>

      {/* Sessions */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between px-1">
          <h2 className="display text-[20px] text-(--color-ink)">Sessões da semana</h2>
          <span className="micro-label text-(--color-ink-mute)">{CARDIO_SESSIONS.length}</span>
        </div>

        <ul className="space-y-2">
          {CARDIO_SESSIONS.map((s) => (
            <li key={s.key}>
              <div className="rounded-2xl border border-(--color-line) bg-(--color-panel) p-4">
                <div className="flex items-start gap-3">
                  <div className="grid place-items-center h-10 w-10 shrink-0 rounded-xl bg-(--color-cyan)/15 text-(--color-cyan)">
                    <Heart size={16} fill="currentColor" fillOpacity={0.4} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <h3 className="font-display text-[15px] font-semibold text-(--color-ink)">{s.day}</h3>
                      <span className="stat-num text-[13px] text-(--color-ink-dim)">{s.duration}</span>
                    </div>
                    <p className="font-display text-[13px] font-medium text-(--color-ink-dim)">{s.modality}</p>
                    <p className="mt-1 text-[12px] leading-snug text-(--color-ink-mute)">{s.notes}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Badge>{s.intensity}</Badge>
                      <Badge variant="flame">{zoneLabel} bpm</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Tips */}
      <section className="space-y-3">
        <h2 className="display text-[20px] text-(--color-ink) px-1">Dicas</h2>
        <ul className="space-y-2">
          {CARDIO_TIPS.map((t) => (
            <li key={t} className="rounded-2xl border border-(--color-line) bg-(--color-panel) px-4 py-3 text-[12.5px] leading-snug text-(--color-ink-dim)">
              {t}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ZoneStat({ label, value, unit, color }: { label: string; value: number | null | undefined; unit: string; color?: string }) {
  return (
    <div className="text-center">
      <div className="micro-label text-(--color-ink-mute)" style={{ fontSize: "9px" }}>
        {label}
      </div>
      <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
        <span className="stat-num text-[24px] leading-none" style={{ color: color ?? "var(--color-ink)" }}>
          {value ?? "—"}
        </span>
        <span className="font-display text-[10px] text-(--color-ink-mute)">{unit}</span>
      </div>
    </div>
  );
}
