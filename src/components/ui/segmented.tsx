import { cn } from "@/lib/utils";

export type SegmentedOption<T extends string | number> = {
  value: T;
  label: string;
  hint?: string;
};

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
  className,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex rounded-full border border-(--color-line) bg-(--color-panel-2) p-1",
        className,
      )}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(opt.value)}
            title={opt.hint}
            className={cn(
              "rounded-full px-3.5 py-1.5 font-display text-[12px] font-semibold transition-all",
              active
                ? "bg-(--color-ink) text-(--color-bg) shadow-sm"
                : "text-(--color-ink-dim) hover:text-(--color-ink)",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

/** Pillscroll — horizontal-scrollable variant for many options (weeks 1-12) */
export function PillScroll<T extends string | number>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className="-mx-4 overflow-x-auto px-4 pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
    >
      <div className="flex gap-2">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              title={opt.hint}
              className={cn(
                "shrink-0 rounded-full border px-3.5 py-1.5 font-display text-[12px] font-semibold transition-all",
                active
                  ? "border-(--color-flame) bg-(--color-flame) text-(--color-ink)"
                  : "border-(--color-line) bg-(--color-panel-2) text-(--color-ink-dim) hover:text-(--color-ink)",
              )}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
