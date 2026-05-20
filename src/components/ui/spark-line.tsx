import { useMemo } from "react";

export type SparkPoint = { x: number; y: number | null };

type Props = {
  title: string;
  unit: string;
  points: SparkPoint[];
  xMin?: number;
  xMax?: number;
  yPad?: number;
  color?: string;
  emptyMessage?: string;
};

const WIDTH = 320;
const HEIGHT = 120;
const PAD = { top: 12, right: 8, bottom: 18, left: 8 };

export function SparkLine({
  title,
  unit,
  points,
  xMin: xMinProp,
  xMax: xMaxProp,
  yPad = 1,
  color = "var(--color-flame)",
  emptyMessage = "sem dados ainda",
}: Props) {
  const filled = useMemo(() => points.filter((p): p is { x: number; y: number } => p.y !== null), [points]);

  const xMin = xMinProp ?? Math.min(...points.map((p) => p.x));
  const xMax = xMaxProp ?? Math.max(...points.map((p) => p.x));

  const { yMin, yMax } = useMemo(() => {
    if (filled.length === 0) return { yMin: 0, yMax: 1 };
    const ys = filled.map((p) => p.y);
    const min = Math.min(...ys);
    const max = Math.max(...ys);
    return { yMin: min - yPad, yMax: max + yPad };
  }, [filled, yPad]);

  const innerW = WIDTH - PAD.left - PAD.right;
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const xScale = (x: number) => PAD.left + ((x - xMin) / (xMax - xMin || 1)) * innerW;
  const yScale = (y: number) => PAD.top + (1 - (y - yMin) / (yMax - yMin || 1)) * innerH;

  const linePath =
    filled.length >= 2
      ? filled.map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(p.x).toFixed(1)} ${yScale(p.y).toFixed(1)}`).join(" ")
      : "";

  const areaPath =
    filled.length >= 2
      ? `${linePath} L ${xScale(filled[filled.length - 1]!.x).toFixed(1)} ${HEIGHT - PAD.bottom} L ${xScale(filled[0]!.x).toFixed(1)} ${HEIGHT - PAD.bottom} Z`
      : "";

  const firstY = filled[0]?.y ?? null;
  const lastY = filled[filled.length - 1]?.y ?? null;
  const delta = firstY !== null && lastY !== null && filled.length > 1 ? lastY - firstY : null;

  const fillId = `spark-fill-${title.replace(/\s+/g, "")}`;

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-[12px] font-semibold tracking-tight text-(--color-ink-dim) uppercase">
          {title}
        </h3>
        <div className="flex items-baseline gap-2">
          {lastY !== null ? (
            <>
              <span className="stat-num text-[22px] text-(--color-ink)">{formatNumber(lastY)}</span>
              <span className="font-display text-[11px] text-(--color-ink-mute) uppercase">{unit}</span>
            </>
          ) : (
            <span className="font-display text-[14px] text-(--color-ink-mute)">—</span>
          )}
          {delta !== null && (
            <span
              className="stat-num text-[12px]"
              style={{ color: delta < 0 ? "var(--color-lime)" : delta > 0 ? "var(--color-flame)" : "var(--color-ink-mute)" }}
            >
              {delta > 0 ? "+" : ""}
              {formatNumber(delta)}
            </span>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="block h-[110px] w-full"
        role="img"
        aria-label={`${title} ao longo das semanas`}
      >
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>

        {areaPath && <path d={areaPath} fill={`url(#${fillId})`} />}
        {linePath && (
          <path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
        )}

        {filled.map((p, i) => (
          <circle
            key={p.x}
            cx={xScale(p.x)}
            cy={yScale(p.y)}
            r={i === filled.length - 1 ? 4.5 : 0}
            fill={color}
            stroke="var(--color-bg)"
            strokeWidth={2.5}
          />
        ))}

        {filled.length === 0 && (
          <text
            x={WIDTH / 2}
            y={HEIGHT / 2 + 4}
            textAnchor="middle"
            fontSize="11"
            fill="var(--color-ink-mute)"
            fontFamily="Bricolage Grotesque, sans-serif"
          >
            {emptyMessage}
          </text>
        )}
      </svg>
    </div>
  );
}

function formatNumber(n: number): string {
  if (Math.abs(n) >= 100) return n.toFixed(0);
  if (Math.abs(n) >= 10) return n.toFixed(1);
  return n.toFixed(2);
}
