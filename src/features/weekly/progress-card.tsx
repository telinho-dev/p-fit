import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { SparkLine, type SparkPoint } from "@/components/ui/spark-line";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProgressCard({ weeks }: { weeks: number[] }) {
  const { data } = useStore();

  const { weightPoints, waistPoints, totals } = useMemo(() => {
    const wp: SparkPoint[] = [];
    const cp: SparkPoint[] = [];
    let sessionsTotal = 0;
    let cardiosTotal = 0;
    let proteinSum = 0;
    let proteinN = 0;
    let sleepSum = 0;
    let sleepN = 0;

    for (const w of weeks) {
      const row = data.weeklyLogs.find((l) => l.week === w);
      wp.push({ x: w, y: row?.weightKg ?? null });
      cp.push({ x: w, y: row?.waistCm ?? null });
      if (row?.sessionsDone != null) sessionsTotal += row.sessionsDone;
      if (row?.cardiosDone != null) cardiosTotal += row.cardiosDone;
      if (row?.proteinAvg != null) {
        proteinSum += row.proteinAvg;
        proteinN += 1;
      }
      if (row?.sleepAvg != null) {
        sleepSum += row.sleepAvg;
        sleepN += 1;
      }
    }

    return {
      weightPoints: wp,
      waistPoints: cp,
      totals: {
        sessions: sessionsTotal,
        cardios: cardiosTotal,
        proteinAvg: proteinN > 0 ? proteinSum / proteinN : null,
        sleepAvg: sleepN > 0 ? sleepSum / sleepN : null,
      },
    };
  }, [data.weeklyLogs, weeks]);

  const xMin = weeks[0];
  const xMax = weeks[weeks.length - 1];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tendência</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-2">
        <SparkLine title="Peso" unit="kg" points={weightPoints} xMin={xMin} xMax={xMax} yPad={1} color="var(--color-flame)" />
        <SparkLine title="Cintura" unit="cm" points={waistPoints} xMin={xMin} xMax={xMax} yPad={1} color="var(--color-cyan)" />

        <div className="grid grid-cols-4 gap-2 pt-2 border-t border-(--color-line)">
          <MiniStat label="Treinos" value={totals.sessions} unit={`/${weeks.length * 4}`} />
          <MiniStat label="Cardios" value={totals.cardios} unit={`/${weeks.length * 4}`} />
          <MiniStat label="Proteína" value={totals.proteinAvg !== null ? Math.round(totals.proteinAvg) : null} unit="g" />
          <MiniStat label="Sono" value={totals.sleepAvg !== null ? Number(totals.sleepAvg.toFixed(1)) : null} unit="h" />
        </div>
      </CardContent>
    </Card>
  );
}

function MiniStat({ label, value, unit }: { label: string; value: number | null; unit: string }) {
  return (
    <div className="pt-3">
      <div className="micro-label text-(--color-ink-mute)" style={{ fontSize: "9px" }}>
        {label}
      </div>
      <div className="flex items-baseline gap-0.5 mt-0.5">
        <span className="stat-num text-[18px] leading-none text-(--color-ink)">{value ?? "—"}</span>
        <span className="font-display text-[10px] text-(--color-ink-mute)">{unit}</span>
      </div>
    </div>
  );
}
