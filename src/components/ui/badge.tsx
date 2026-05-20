import { forwardRef, type HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badge = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-display text-[10.5px] font-semibold tracking-tight uppercase",
  {
    variants: {
      variant: {
        default: "bg-(--color-panel-2) text-(--color-ink-dim) border border-(--color-line)",
        flame: "bg-(--color-flame-soft) text-(--color-flame)",
        lime: "bg-(--color-lime-soft) text-(--color-lime)",
        rose: "bg-(--color-rose-soft) text-(--color-rose)",
        warn: "bg-(--color-panel-2) text-(--color-warn) border border-(--color-warn)/30",
        ink: "bg-(--color-ink) text-(--color-bg)",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badge>;

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(({ className, variant, ...p }, ref) => (
  <span ref={ref} className={cn(badge({ variant }), className)} {...p} />
));
Badge.displayName = "Badge";
