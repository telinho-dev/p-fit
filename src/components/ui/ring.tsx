import { cn } from "@/lib/utils";

type RingProps = {
  /** 0..1 */
  value: number;
  size?: number;
  thickness?: number;
  color?: string;
  trackColor?: string;
  className?: string;
  children?: React.ReactNode;
};

/** Apple-Fitness-style activity ring. */
export function Ring({
  value,
  size = 120,
  thickness = 12,
  color = "var(--color-flame)",
  trackColor = "var(--color-panel-2)",
  className,
  children,
}: RingProps) {
  const clamped = Math.max(0, Math.min(1, value));
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - clamped);

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={trackColor} strokeWidth={thickness} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={thickness}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 600ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center text-center leading-none">{children}</div>
      )}
    </div>
  );
}

type MultiRingProps = {
  size?: number;
  thickness?: number;
  gap?: number;
  rings: { value: number; color: string; label?: string }[];
  className?: string;
  children?: React.ReactNode;
};

/** Apple-Fitness concentric multi-ring. */
export function MultiRing({ size = 160, thickness = 14, gap = 4, rings, className, children }: MultiRingProps) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {rings.map((ring, i) => {
          const r = (size - thickness) / 2 - i * (thickness + gap);
          if (r < thickness / 2) return null;
          const c = 2 * Math.PI * r;
          const clamped = Math.max(0, Math.min(1, ring.value));
          const offset = c * (1 - clamped);
          return (
            <g key={i}>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={ring.color}
                strokeOpacity={0.15}
                strokeWidth={thickness}
                fill="none"
              />
              <circle
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={ring.color}
                strokeWidth={thickness}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={c}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.22, 1, 0.36, 1)" }}
              />
            </g>
          );
        })}
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  );
}
