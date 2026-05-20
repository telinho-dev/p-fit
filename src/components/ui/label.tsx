import { forwardRef, type LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...p }, ref) => (
    <label ref={ref} className={cn("micro-label block text-(--color-ink-mute)", className)} {...p} />
  ),
);
Label.displayName = "Label";
